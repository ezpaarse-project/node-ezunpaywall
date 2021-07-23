/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');

const { connection } = require('../../lib/ezunpaywall');
const { getConfig } = require('../../lib/config');
const logger = require('../../lib/logger');

/**
 * start a csv file enrichment
 *
 * @param {string} options.file --file <file> - File which must be enriched
 * @param {string} options.attributes --attributes <attributes> - Attributes which must be enriched
 * in graphql format. By default, all attributes are added
 * @param {string} options.separator --separator <separator> - Separator of csv out file
 * @param {string} options.out --out <out> - Name of enriched file
 * @param {boolean} options.use --use <use> - filepath of custom config
 */
const enrich = async (command, options) => {
  const config = await getConfig(options.use);
  const ezunpaywall = await connection();

  const extAccepted = ['csv', 'jsonl'];

  if (command === 'job') {
    if (!options.file) {
      logger.error('file expected');
      process.exit(1);
    }

    const type = path.extname(options.file).substring(1);

    if (!extAccepted.includes(type)) {
      logger.error(`${type} is not suported for enrich. Required csv or jsonl`);
      process.exit(1);
    }

    const out = options.out || `out.${type}`;

    const data = {
      type,
      separator: ',',
    };

    if (options.separator) data.separator = options.separator;
    if (options.attributes) data.args = options.attributes;
    if (options.index) data.index = options.index;

    console.log(options.attributes);

    const stat = await fs.stat(options.file);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(options.file));

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
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/enrich/upload`);
      logger.error(err);
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
          'X-API-KEY': config.ezunpaywall.apikey,
        },
        responseType: 'json',
      });
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/enrich/job`);
      logger.error(err);
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
    } while (!res2?.data?.state?.done);

    let enrichedFile;

    try {
      enrichedFile = await ezunpaywall({
        method: 'GET',
        url: `/api/enrich/enriched/${id}.${type}`,
        responseType: 'stream',
      });
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/enrich/enriched/${id}.${type}`);
      logger.error(err);
      process.exit(1);
    }

    const writer = fs.createWriteStream(out);
    enrichedFile.data.pipe(writer);
    logger.info(`File enriched at ${path.resolve(out)}`);
  }
};

module.exports = enrich;
