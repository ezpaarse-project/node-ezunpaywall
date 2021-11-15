const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const set = require('lodash.set');
const has = require('lodash.has');

const logger = require('../../lib/logger');

/**
 * create a config file in /$HOME/.config/.ezunpaywallrc
 * which contains the information to request on ezunpaywall
 */
const setConfig = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

  const config = {
    baseURL: 'http://localhost',
    apikey: 'admin',
    redisPassword: 'changeme',
  };

  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${pathConfig}`);
    logger.error(err);
    process.exit(1);
  }
  logger.info(`configuration has been initialized in ${pathConfig}`);
};

/**
 * config management command to establish the connection between the command and ezunpaywall
 *
 * @param {boolean} option.get -g --get - display configuration
 * @param {boolean} option.set -s --set - update configuration file in $HOME/.config
 * @param {boolean} option.list -l --list - list of attributes required for configuration
 */
const manageConfig = async (option) => {
  if (option.list) {
    console.log(`
      baseURL
      apikey
      redisPassword`.trim().replace(/^\s*/gm, ''));
    process.exit(0);
  }

  const configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

  if (!await fs.pathExists(configPath)) {
    await setConfig();
  }

  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

  if (option.get) {
    console.log(JSON.stringify(config, null, 2));
    logger.info(`from ${configPath}`);
    process.exit(0);
  }

  if (option.set === 'default') {
    console.log(JSON.stringify(config, null, 2));
    await setConfig();
    process.exit(0);
  }

  console.log(option.set);
  console.log(option.args[0]);

  if (option.set) {
    if (has(config, option.set)) {
      set(config, option.set, option.args[0]);
      console.log(config);
    } else {
      logger.error(`${option.set} doesn't exist on config`);
      process.exit(1);
    }
  }

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${config}`);
    logger.error(err);
    process.exit(1);
  }

  console.log(JSON.stringify(config, null, 2));
  logger.info(`from ${configPath}`);
  process.exit(0);
};

module.exports = {
  manageConfig,
  setConfig,
};
