const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('../../lib/logger');

const reset = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

  const config = {
    ezunpaywall: {
      baseURL: 'https://localhost:443',
      apikey: 'admin',
    },
    ezmeta: {
      baseURL: 'http://localhost:9200',
      user: 'elastic',
      password: 'changeme',
    },
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
};
