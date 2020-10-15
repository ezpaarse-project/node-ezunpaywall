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
    let readStream;
    try {
      readStream = fs.createReadStream(file);
    } catch (err) {
      console.log('error: impossible de read file');
    }
    if (getExtensionOfFile(file) === 'jsonl') {
      checkAttributesJSON(args.attributes);
      enrichmentFileJSON(readStream);
    }
    if (getExtensionOfFile(file) === 'csv') {
      checkAttributesCSV(args.attributes);
      enrichmentFileCSV(readStream);
    }
  },
};
