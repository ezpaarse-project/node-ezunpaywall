const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const set = require('lodash.set');
const has = require('lodash.has');

const logger = require('../lib/logger');
const { setConfig } = require('../lib/config');

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
      adminPassword
      apikey`.trim().replace(/^\s*/gm, ''));
    process.exit(0);
  }

  const configPath = path.resolve(os.homedir(), '.config', 'ezunpaywall.json');

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

  if (option.set) {
    if (has(config, option.set)) {
      set(config, option.set, option.args[0]);
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
