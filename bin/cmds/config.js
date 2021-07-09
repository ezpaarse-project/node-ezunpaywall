const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * create a config file in /$HOME/.config/.ezunpaywallrc
 * which contains the information to request on ezunpaywall
 */
const setConfig = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

  const config = {
    ezunpaywall: {
      protocol: 'http',
      host: 'localhost',
      port: '8080',
    },
    ezmeta: {
      protocol: 'http',
      host: 'localhost',
      port: '8080',
      user: 'elastic',
      password: 'changeme',
    },
    apikey: 'admin',
  };

  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
  }

  console.log(`configuration has been initialized in ${pathConfig}`);
  console.log(JSON.stringify(config, null, 2));
};

/**
 * config management command to establish the connection between the command and ezunpaywall
 *
 * @param {boolean} args.get -g --get - display the configuration
 * @param {boolean} args.set -s --set - initialize the configuration file in $HOME/.config
 * @param {string} args.ezunpaywallURL --ezunpaywallURL <ezunpaywallURL> - ezunpaywall url
 * @param {number} args.ezunpaywallPort --ezunpaywallPort <ezunpaywallPort> - ezunpaywall port
 * @param {string} args.ezmetaURL --ezmetalURL <ezmetalURL> - ezmetal url
 * @param {number} args.ezmetaPort --ezmetalPort <ezmetalPort> - ezmetal port
 * @param {string} args.apikey --apikey <apikey> - admin apikey
 * @param {boolean} args.list -l --list - list of attributes required for configuration
 */
const manageConfig = async (args) => {
  if (args.list) {
    console.log('--ezunpaywallProtocol <ezunpaywallProtocol> ezunpaywall protocol');
    console.log('--ezunpaywallHost <ezunpaywallHost> ezunpaywall host');
    console.log('--ezunpaywallPort <ezunpaywallPort> ezunpaywall port');
    console.log('--ezmetaHost <ezmetaHost> ezmeta host');
    console.log('--ezmetaURL <ezmetaURL> ezmeta url');
    console.log('--ezmetaPort <ezmetaPort> ezmeta port');
    console.log('--ezmetaUser <ezmetaUser> ezmeta user');
    console.log('--ezmetaPassword <ezmetaPassword> ezmeta password');
    console.log('-k --apikey <apikey> admin apikey');
    process.exit(0);
  }

  const configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

  if (!await fs.pathExists(configPath)) {
    await setConfig();
  }

  if (args.set) {
    await setConfig();
    process.exit(0);
  }

  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

  if (args.get) {
    console.log(JSON.stringify(config, null, 2));
    console.log(`from ${configPath}`);
    process.exit(0);
  }

  if (args.ezunpaywallProtocol) {
    config.ezunpaywall.protocol = args.ezunpaywallProtocol;
  }

  if (args.ezunpaywallHost) {
    config.ezunpaywall.host = args.ezunpaywallHost;
  }

  if (args.ezunpaywallPort) {
    config.ezunpaywall.port = args.ezunpaywallPort;
  }

  if (args.ezmetaProtocol) {
    config.ezmeta.protocol = args.ezmetaProtocol;
  }

  if (args.ezmetaHost) {
    config.ezmeta.host = args.ezmetaHost;
  }

  if (args.ezmetaPort) {
    config.ezmeta.port = args.ezmetaPort;
  }

  if (args.ezmetaUser) {
    config.ezmeta.user = args.ezmetaUser;
  }

  if (args.ezmetaPassword) {
    config.ezmeta.password = args.ezmetaPassword;
  }

  if (args.apikey) {
    config.apikey = args.apikey;
  }

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
  }

  console.log(JSON.stringify(config, null, 2));
  console.log(`from ${configPath}`);
  process.exit(0);
};

module.exports = {
  manageConfig,
};
