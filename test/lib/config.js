const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('../../lib/logger');

const reset = async () => {
  const configDir = process.env.XDG_CONFIG_HOME || path.resolve(os.homedir(), '.config');
  const pathConfig = path.join(configDir, 'ezunpaywall.json');

  const config = {
    baseURL: 'http://localhost',
    adminPassword: 'changeme',
    apikey: 'changeme',
  };

  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${pathConfig}`);
    logger.error(err);
    process.exit(1);
  }
};

const setApikey = async () => {
  const configDir = process.env.XDG_CONFIG_HOME || path.resolve(os.homedir(), '.config');
  const pathConfig = path.join(configDir, 'ezunpaywall.json');

  const config = {
    baseURL: 'http://localhost',
    adminPassword: 'changeme',
    apikey: 'user',
  };

  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${pathConfig}`);
    logger.error(err);
    process.exit(1);
  }
};

module.exports = {
  reset,
  setApikey,
};
