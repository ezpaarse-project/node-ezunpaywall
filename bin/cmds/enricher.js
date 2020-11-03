/* eslint-disable camelcase */
const fs = require('fs-extra');
const path = require('path');

const { enrichmentFileCSV, checkAttributesCSV } = require('../utils/enricherCSV');
const { enrichmentFileJSON, checkAttributesJSON } = require('../utils/enricherJSON');

const getExtensionOfFile = (file) => {
  const basename = file.split(/[\\/]/).pop();
  const pos = basename.lastIndexOf('.');
  if (basename === '' || pos < 1) {
    return '';
  }
  return basename.slice(pos + 1);
};

module.exports = {
  enricher: async (args) => {
    let out;
    let separator;
    const file = path.resolve(args.file);
    if (!args.file) {
      console.log('error: file expected');
      process.exit(1);
    }
    const ifFileExist = await fs.pathExists(file);
    if (!ifFileExist) {
      console.log('error: file not found');
      process.exit(1);
    }
    const typeOfFile = getExtensionOfFile(file);
    if (typeOfFile === 'csv') {
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
    }
    if (typeOfFile === 'jsonl') {
      if (args.out) {
        out = args.out;
      } else {
        out = 'out.json';
      }
    }

    let readStream;
    try {
      readStream = fs.createReadStream(file);
    } catch (err) {
      console.log('error: impossible de read file');
    }
    if (typeOfFile === 'jsonl') {
      checkAttributesJSON(args.attributes);
      enrichmentFileJSON(out, readStream);
    }
    if (typeOfFile === 'csv') {
      checkAttributesCSV(args.attributes);
      enrichmentFileCSV(out, separator, readStream);
    }
  },
};
