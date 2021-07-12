const axios = require('axios');
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
      port: '9200',
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

  console.log(JSON.stringify(config, null, 2));
  console.log(`configuration has been initialized in ${pathConfig}`);
};

module.exports = {
  connection: async (customPath) => {
    let configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
    if (!await fs.pathExists(configPath)) {
      setConfig();
    }

    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return axios.create({
      timeout: 3000,
      proxy: false,
      baseURL: `${config.ezunpaywall.protocol}://${config.ezunpaywall.host}${config.ezunpaywall.port ? `:${config.ezunpaywall.port}` : ''}`,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  },
};
