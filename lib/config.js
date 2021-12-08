const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('./logger');

const configPath = path.resolve(os.homedir(), '.config', 'ezunpaywall.json');

/**
 * create a config file in /$HOME/.config/ezunpaywall.json
 * which contains the information to request on ezunpaywall
 */
const setConfig = async () => {
  const config = {
    baseURL: 'http://localhost',
    apikey: 'admin',
    redisPassword: 'changeme',
  };

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${configPath}`);
    logger.error(err);
    process.exit(1);
  }
  logger.info(`Configuration has been initialized in ${configPath}`);
};

const getConfig = async () => {
  let config;

  if (!await fs.pathExists(configPath)) {
    await setConfig();
  }

  try {
    config = await fs.readFile(configPath, 'utf-8');
  } catch (err) {
    logger.error(`Cannot read [${configPath}]`);
    process.exit(1);
  }

  try {
    config = JSON.parse(config);
  } catch (err) {
    logger.error(`Cannot parse in json "${config}"`);
    process.exit(1);
  }

  return config;
};

module.exports = {
  setConfig,
  getConfig,
};
