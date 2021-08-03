const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('../../lib/logger');

const reset = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

  const config = {
    baseURL: 'http://localhost',
    apikey: 'admin',
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
