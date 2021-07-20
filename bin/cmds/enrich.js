/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');

const { connection } = require('../../lib/ezunpaywall');
const { getConfig } = require('../../lib/config');
const { logger } = require('../../lib/logger');

/**
 * start a csv file enrichment
 *
 * @param {string} args.file -f --file <file> - file which must be enriched
 * @param {string} args.attributes -a --attributes <attributes> - attributes which must be enriched
 * in graphql format. By default, all attributes are added
 * @param {string} args.separator -s --separator <separator> - separator of csv out file
 * @param {string} args.out -o --out <out> - name of enriched file
 * @param {boolean} args.verbose -v --verbose - logs how much lines are enriched
 * @param {boolean} args.use -u --use <use> - pathfile of custom config
 */
const enrichCSV = async (args) => {
  const config = await getConfig(args.use);
  const ezunpaywall = await connection();

  if (!args.file) {
    logger.error('file expected');
    process.exit(1);
  }

  const file = path.resolve(args.file);
  const fileExist = await fs.pathExists(file);

  if (!fileExist) {
    logger.error('file not found');
    process.exit(1);
  }

  const ext = path.extname(file).substring(1);
  if (ext !== 'csv') {
    logger.error(`${ext} is not suported for enrichCSV. Required .csv`);
    process.exit(1);
  }

  const out = args.out || 'out.csv';

  const data = {
    type: 'csv',
    separator: ',',
  };

  if (args.separator) data.separator = args.separator;
  if (args.attributes) data.args = args.attributes;
  if (args.index) data.index = args.index;

  const stat = await fs.stat(args.file);

  const formData = new FormData();
  formData.append('file', fs.createReadStream(args.file));

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
    logger.error(`POST ${ezunpaywall.defaults.baseURL}/api/enrich/upload - ${err}`);
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
        'X-API-KEY': config.apikey,
      },
      responseType: 'json',
    });
  } catch (err) {
    console.log(err.response);
    logger.error(`POST ${ezunpaywall.defaults.baseURL}/api/enrich/job - ${err}`);
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
      url: `/api/enrich/enriched/${id}.csv`,
      responseType: 'stream',
    });
  } catch (err) {
    console.error(`GET ${ezunpaywall.defaults.baseURL}/api/enrich/enriched/${id}.csv - ${err}`);
    process.exit(1);
  }

  // TODO await this and use process.exit(0) after that
  const writer = fs.createWriteStream(out);
  enrichedFile.data.pipe(writer);
};

/**
 * start a jsonl file enrichment
 * @param {string} args.file -f --file <file> - file which must be enriched
 * @param {string} args.attributes -a --attributes <attributes> - attributes which must be enriched
 * in graphql format. By default, all attributes are added
 *
 * @param {string} args.out -o --out <out> - name of enriched file
 * @param {boolean} args.verbose -v --verbose - logs how much lines are enriched
 * @param {boolean} args.use -u --use <use> - pathfile of custom config
 */
const enrichJSON = async (args) => {
  const config = await getConfig(args.use);
  const ezunpaywall = await connection();

  if (!args.file) {
    logger.error('file expected');
    process.exit(1);
  }

  const file = path.resolve(args.file);
  const fileExist = await fs.pathExists(file);

  if (!fileExist) {
    logger.error('file not found');
    process.exit(1);
  }

  const ext = path.extname(file).substring(1);
  if (ext !== 'jsonl' && ext !== 'ndjson' && ext !== 'json') {
    logger.error(`${ext} is not suported for enrichJSON. What is require are .ndjson, .json, .jsonl`);
    process.exit(1);
  }

  const out = args.out || 'out.jsonl';

  const data = {
    type: 'jsonl',
  };

  if (args.attributes) data.args = args.attributes;
  if (args.index) data.index = args.index;

  const stat = await fs.stat(args.file);

  const formData = new FormData();
  formData.append('file', fs.createReadStream(args.file));

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
    logger.error(`POST ${ezunpaywall.defaults.baseURL}/api/enrich/upload - ${err}`);
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
        'X-API-KEY': config.apikey,
      },
      responseType: 'json',
    });
  } catch (err) {
    console.log(err.response.data);
    logger.error(`POST ${ezunpaywall.defaults.baseURL}/api/enrich/job - ${err}`);
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
      url: `/api/enrich/enriched/${id}.jsonl`,
      responseType: 'stream',
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/enrich/enriched/${id}.jsonl - ${err}`);
    process.exit(1);
  }

  const writer = fs.createWriteStream(out);
  enrichedFile.data.pipe(writer);
};

module.exports = {
  enrichCSV,
  enrichJSON,
};
