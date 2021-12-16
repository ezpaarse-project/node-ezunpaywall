/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');
const joi = require('joi');
const FormData = require('form-data');

const connection = require('../lib/ezunpaywall');
const { getConfig } = require('../lib/config');
const logger = require('../lib/logger');

/**
 * start a csv file enrichment
 *
 * @param {string} option.file --file <file> - File which must be enriched
 * @param {string} option.attributes --attributes <attributes> - Attributes which must be enriched
 * in graphql format. By default, all attributes are added
 * @param {string} option.separator --separator <separator> - Separator of csv out file
 * @param {string} option.out --out <out> - Name of enriched file
 * @param {boolean} option.use --use <use> - filepath of custom config
 */
const enrich = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  const extAccepted = ['csv', 'jsonl'];

  const { error, value } = joi.string().required().validate(option?.file);

  if (error) {
    logger.error(error.details[0].message);
    process.exit(1);
  }

  const filepath = value;

  if (!await fs.pathExists(filepath)) {
    logger.error(`[${filepath}] not fount`);
    process.exit(1);
  }

  const type = path.extname(filepath).substring(1);

  if (!extAccepted.includes(type)) {
    logger.error(`${type} is not suported for enrich. Required csv or jsonl`);
    process.exit(1);
  }

  const out = option.out || `out.${type}`;

  const data = {
    type,
    separator: ',',
  };

  if (option.separator) data.separator = option.separator;
  if (option.attributes) data.args = option.attributes;
  if (option.index) data.index = option.index;

  const stat = await fs.stat(filepath);

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filepath));

  let res1;
  try {
    res1 = await ezunpaywall({
      method: 'POST',
      url: '/api/enrich/upload',
      data: formData,
      headers: formData.getHeaders(),
      responseType: 'json',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  const id = res1?.data?.id;
  data.id = id;

  try {
    await ezunpaywall({
      method: 'POST',
      url: '/api/enrich/job',
      data,
      headers: {
        'Content-length': stat.size,
        'x-api-key': config.apikey,
      },
      responseType: 'json',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  let res2;

  do {
    res2 = await ezunpaywall({
      method: 'GET',
      url: `/api/enrich/state/${id}.json`,
      responseType: 'json',
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (!res2?.data?.done);

  let enrichedFile;

  try {
    enrichedFile = await ezunpaywall({
      method: 'GET',
      url: `/api/enrich/enriched/${id}.${type}`,
      responseType: 'stream',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  const writer = fs.createWriteStream(out);
  enrichedFile.data.pipe(writer);
  logger.info(`File enriched at ${path.resolve(out)}`);
};

module.exports = enrich;
