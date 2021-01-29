const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('./logger');

module.exports = {
  connection: async (customPath) => {
    let configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
    if (!await fs.pathExists(configPath)) {
      logger.info('you do not set the default configuration');
      const config = {
        url: 'http://localhost',
        port: 8080,
      };
      try {
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      } catch (err) {
        logger.error(err);
      }
      logger.info(`it's initialized automaticaly at ${configPath}`);
      logger.info(JSON.stringify(config, null, 2));
    }

    if (customPath) {
      if (!await fs.pathExists(customPath)) {
        logger.error(`${customPath} does not exist`);
        process.exit(1);
      } else {
        configPath = customPath;
      }
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return axios.create({
      timeout: 30000,
      proxy: false,
      baseURL: `${config.url}:${config.port}`,
    });
  },

  getConfig: async (customPath) => {
    let configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
    if (customPath) {
      if (!await fs.pathExists(customPath)) {
        logger.error(`${customPath} does not exist`);
        process.exit(1);
      } else {
        configPath = customPath;
      }
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  },
};
