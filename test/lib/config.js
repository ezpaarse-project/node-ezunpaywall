const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const reset = async () => {
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
};

module.exports = {
  reset,
};
