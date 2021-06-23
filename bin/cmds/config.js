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
    ezunpaywallURL: 'http://localhost',
    ezunpaywallPort: 8080,
    ezmetaURL: 'http://localhost',
    ezmetaPort: 9200,
    ezmetaUser: 'elastic',
    ezmetaPassword: 'changeme',
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
    console.log('--ezunpaywallURL <ezunpaywallURL> ezunpaywall url');
    console.log('--ezunpaywallPort <ezunpaywallPort> ezunpaywall port');
    console.log('--ezmetaURL <ezmetaURL> ezmeta url');
    console.log('--ezmetaPort <ezmetaPort> ezmeta port');
    console.log('--ezmetaUser <ezmetaUser> ezmeta port');
    console.log('--ezmetaPassword <ezmetaPassword> ezmeta port');
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

  if (args.ezunpaywallURL) {
    const regexURL = /^(http|https):\/\/[^ "]+$/;
    const valideURL = regexURL.test(args.url);
    if (valideURL) {
      config.ezunpaywallURL = args.ezunpaywallURL;
    } else {
      console.error(`'${args.ezunpaywallURL}' is not a valide URL`);
      process.exit(1);
    }
  }

  if (args.ezmetaURL) {
    const regexURL = /^(http|https):\/\/[^ "]+$/;
    const valideURL = regexURL.test(args.url);
    if (valideURL) {
      config.ezmetaURL = args.ezmetaURL;
    } else {
      console.error(`'${args.ezmetaURL}' is not a valide URL`);
      process.exit(1);
    }
  }

  if (args.ezunpaywallPort) {
    if (Number.isNaN(args.ezunpaywallPort)) {
      console.error(`${args.ezunpaywallPort} is not a number`);
      process.exit(1);
    }
    config.ezunpaywallPort = args.ezunpaywallPort;
  }

  if (args.ezmetaPort) {
    if (Number.isNaN(args.ezmetaPort)) {
      console.error(`${args.ezmetaPort} is not a number`);
      process.exit(1);
    }
    config.ezmetaPort = args.ezmetaPort;
  }

  if (args.ezmetaUser) {
    config.ezmetaUser = args.ezmetaUser;
  }

  if (args.ezmetaPassword) {
    config.ezmetaPassword = args.ezmetaPassword;
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
