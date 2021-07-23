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
    ezunpaywall: {
      protocol: 'https',
      host: 'localhost',
      port: '443',
      apikey: 'admin',
    },
    ezmeta: {
      protocol: 'http',
      host: 'localhost',
      port: '9200',
      user: 'elastic',
      password: 'changeme',
    },
  };

  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(config, null, 2)} in ${pathConfig}`);
    logger.error(err);
  }

  logger.info(JSON.stringify(config, null, 2));
  logger.info(`configuration has been initialized in ${pathConfig}`);
};

/**
 * config management command to establish the connection between the command and ezunpaywall
 *
 * @param {boolean} args.get -g --get - display configuration
 * @param {boolean} args.set -s --set - update configuration file in $HOME/.config
 * @param {boolean} args.list -l --list - list of attributes required for configuration
 */
const manageConfig = async (args) => {
  if (args.list) {
    console.log(`
      ezunpaywall.protocol
      ezunpaywall.host
      ezunpaywall.port
      ezunpaywall.apikey
      ezmeta.protocol
      ezmeta.host
      ezmeta.port
      ezmeta.user
      ezmeta.password`.trim().replace(/^\s*/gm, ''));
    process.exit(0);
  }

  const configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

  if (!await fs.pathExists(configPath)) {
    await setConfig();
  }

  if (args.get) {
    console.log(JSON.stringify(config, null, 2));
    logger.info(`from ${configPath}`);
    process.exit(0);
  }

  if (args.set === 'default') {
    await setConfig();
    process.exit(0);
  }

  if (args.set) {
    if (has(config, args.set)) {
      set(config, args.set, ...args.args);
    } else {
      logger.error(`${args.set} doesn't exist on config`);
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

module.exports = manageConfig;
