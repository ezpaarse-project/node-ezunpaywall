/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');

const { enrichmentFileCSV, checkAttributesCSV } = require('../enrich/csv');
const { enrichmentFileJSON, checkAttributesJSON } = require('../enrich/json');

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
    let out;
    let separator;
    if (!args.file) {
      console.log('error: file expected');
      process.exit(1);
    }
    const file = path.resolve(args.file);
    const ifFileExist = await fs.pathExists(file);
    if (!ifFileExist) {
      console.log('error: file not found');
      process.exit(1);
    }
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile !== 'csv') {
      console.log(`${typeOfFile} is not suported for enrichCSV. Required .csv`);
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

    let readStream;
    try {
      readStream = fs.createReadStream(file);
    } catch (err) {
      console.log('error: impossible de read file');
    }
    enrichmentFileCSV(out, separator, readStream, args.verbose, args.attributes);
  },

  enrichJSON: async (args) => {
    let out;

    if (!args.file) {
      console.log('error: file expected');
      process.exit(1);
    }
    const file = path.resolve(args.file);
    const ifFileExist = await fs.pathExists(file);
    if (!ifFileExist) {
      console.log('error: file not found');
      process.exit(1);
    }
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile !== 'jsonl' && typeOfFile !== 'ndjson' && typeOfFile !== 'json') {
      console.log(`${typeOfFile} is not suported for enrichJSON. What is require are .ndjson, .json, .jsonl`);
      process.exit(1);
    }

    if (args.out) {
      out = args.out;
    } else {
      out = `out.${typeOfFile}`;
    }

    let readStream;
    try {
      readStream = fs.createReadStream(file);
    } catch (err) {
      console.log('error: impossible de read file');
    }

    enrichmentFileJSON(out, readStream, args.verbose, args.attributes);
  },
};
