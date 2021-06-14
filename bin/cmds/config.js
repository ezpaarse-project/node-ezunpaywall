const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('../../lib/logger');

const setConfig = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
  const config = {
    url: 'http://localhost',
    port: 8080,
  };
  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    logger.error(err);
  }
  logger.info(`configuration has been initialized in ${pathConfig}`);
  logger.info(JSON.stringify(config, null, 2));
};

module.exports = {
  config: async (args) => {
    if (args.list) {
      logger.info('--url <url> ezunpaywall url');
      logger.info('--port <port> ezunpaywall port');
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

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (args.get) {
      logger.info(JSON.stringify(config, null, 2));
      logger.info(`from ${configPath}`);
      process.exit(0);
    }
    if (args.url) {
      const regexURL = /^(ftp|http|https):\/\/[^ "]+$/;
      const valideURL = regexURL.test(args.url);
      if (valideURL) {
        config.url = args.url;
      } else {
        logger.error(`'${args.url}' is not a valide URL`);
        process.exit(1);
      }
    }
    if (args.port) {
      if (Number.isNaN(args.port)) {
        logger.error(`${args.port} is not a number`);
        process.exit(1);
      }
      config.port = args.port;
    }

    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
      logger.error(err);
    }

    logger.info(JSON.stringify(config, null, 2));
    logger.info(`from ${configPath}`);
    process.exit(0);
  },
};
