/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');

const logger = require('../../lib/logger');
const { connection, getConfig } = require('../../lib/axios');

const getExtensionOfFile = (file) => {
  const basename = file.split(/[\\/]/).pop();
  const pos = basename.lastIndexOf('.');
  if (basename === '' || pos < 1) {
    return '';
  }
  return basename.slice(pos + 1);
};

module.exports = {
  enrichCSV: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    let out;
    let separator;
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
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile !== 'csv') {
      logger.error(`${typeOfFile} is not suported for enrichCSV. Required .csv`);
      process.exit(1);
    }

    if (args.separator) {
      separator = args.separator;
    } else {
      separator = ',';
    }

    if (args.out) {
      out = args.out;
    } else {
      out = 'out.csv';
    }

    if (!args.attributes) {
      args.attributes = '';
    }

    let res1;

    try {
      res1 = await axios({
        method: 'POST',
        url: `/enrich/csv/?args=${args.attributes}&separator=${separator}`,
        data: fs.createReadStream(args.file),
        headers: {
          'Content-Type': 'text/csv',
        },
        responseType: 'json',
      });
    } catch (err) {
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }

    let res2;
    try {
      res2 = await axios({
        method: 'GET',
        url: `/enrich/${res1.data.file}`,
        responseType: 'stream',
      });
    } catch (err) {
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }

    const writer = fs.createWriteStream(out);

    res2.data.pipe(writer);
  },

  enrichJSON: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    let out;

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
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile !== 'jsonl' && typeOfFile !== 'ndjson' && typeOfFile !== 'json') {
      logger.error(`${typeOfFile} is not suported for enrichJSON. What is require are .ndjson, .json, .jsonl`);
      process.exit(1);
    }

    if (args.out) {
      out = args.out;
    } else {
      out = `out.${typeOfFile}`;
    }

    let res1;

    try {
      res1 = await axios({
        method: 'POST',
        url: '/enrich/json',
        params: {
          args: args.attributes,
        },
        data: fs.createReadStream(args.file),
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'json',
      });
    } catch (err) {
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }

    let res2;
    try {
      res2 = await axios({
        method: 'GET',
        url: `/enrich/${res1.data.file}`,
        responseType: 'stream',
      });
    } catch (err) {
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }

    const writer = fs.createWriteStream(out);

    res2.data.pipe(writer);
  },
};
