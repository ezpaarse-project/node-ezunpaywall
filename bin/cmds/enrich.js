/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');

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
      console.error('file expected');
      process.exit(1);
    }
    const file = path.resolve(args.file);
    const fileExist = await fs.pathExists(file);
    if (!fileExist) {
      console.error('file not found');
      process.exit(1);
    }
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile !== 'csv') {
      console.error(`${typeOfFile} is not suported for enrichCSV. Required .csv`);
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

    const id = uuid.v4();
    const stat = await fs.stat(args.file);
    try {
      await axios({
        method: 'POST',
        url: `/enrich/csv/${id}`,
        params: {
          args: args.attributes,
          separator,
        },
        data: fs.createReadStream(args.file),
        headers: {
          'Content-Type': 'text/csv',
          'Content-length': stat.size,
        },
        responseType: 'json',
      });
    } catch (err) {
      console.error(`/enrich/csv/${id} ${err}`);
      process.exit(1);
    }

    let res2;
    while (!res2?.data?.state?.done) {
      res2 = await axios({
        method: 'GET',
        url: `/enrich/state/${id}`,
        responseType: 'json',
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    let res3;
    try {
      res3 = await axios({
        method: 'GET',
        url: `/enrich/${id}.csv`,
        responseType: 'stream',
      });
    } catch (err) {
      console.error(`/enrich/${id}.csv - ${err}`);
      process.exit(1);
    }

    const writer = fs.createWriteStream(out);
    res3.data.pipe(writer);
  },

  enrichJSON: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    let out;

    if (!args.file) {
      console.error('file expected');
      process.exit(1);
    }
    const file = path.resolve(args.file);
    const fileExist = await fs.pathExists(file);
    if (!fileExist) {
      console.error('file not found');
      process.exit(1);
    }
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile !== 'jsonl' && typeOfFile !== 'ndjson' && typeOfFile !== 'json') {
      console.error(`${typeOfFile} is not suported for enrichJSON. What is require are .ndjson, .json, .jsonl`);
      process.exit(1);
    }

    if (args.out) {
      out = args.out;
    } else {
      out = `out.${typeOfFile}`;
    }

    const id = uuid.v4();
    const stat = await fs.stat(args.file);
    try {
      await axios({
        method: 'POST',
        url: `/enrich/json/${id}`,
        params: {
          args: args.attributes,
        },
        data: fs.createReadStream(args.file),
        headers: {
          'Content-Type': 'application/json',
          'Content-length': stat.size,
        },
        responseType: 'json',
      });
    } catch (err) {
      console.error(`/enrich/json - ${err}`);
      process.exit(1);
    }

    let res2;
    while (!res2?.data?.state?.done) {
      res2 = await axios({
        method: 'GET',
        url: `/enrich/state/${id}`,
        responseType: 'json',
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    let res3;
    try {
      res3 = await axios({
        method: 'GET',
        url: `/enrich/${id}.jsonl`,
        responseType: 'stream',
      });
    } catch (err) {
      console.error(`/enrich/${id}.jsonl - ${err}`);
      process.exit(1);
    }

    const writer = fs.createWriteStream(out);

    res3.data.pipe(writer);
  },
};
