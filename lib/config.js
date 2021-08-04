const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('./logger');

const getConfig = async (customPath) => {
  let configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
  if (customPath) {
    if (!await fs.pathExists(customPath)) {
      logger.error(`File ${customPath} does not exist`);
      process.exit(1);
    } else {
      configPath = customPath;
    }
  }
  return JSON.parse(await fs.readFile(configPath, 'utf-8'));
};

module.exports = {
  getConfig,
};
