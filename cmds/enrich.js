/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');
const joi = require('joi');
const FormData = require('form-data');

const enrichLib = require('../lib/enrich');
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

  const res = await enrichLib.upload(formData);

  const { id } = res;

  await enrichLib.job(id, data, stat.size);

  let state;

  do {
    state = await enrichLib.getState(id);
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (!state?.done);

  const enrichedFile = await enrichLib.download(id, type);

  const writer = fs.createWriteStream(out);
  enrichedFile.pipe(writer);
  logger.info(`File enriched at ${path.resolve(out)}`);
};

module.exports = enrich;
