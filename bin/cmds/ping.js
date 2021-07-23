const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');

const { getConfig } = require('../../lib/config');
const { connection } = require('../../lib/ezunpaywall');
const logger = require('../../lib/logger');

/**
 * check if service is available
 *
 * @param {boolean} options.use -u --use - pathfile of custom config
 */
const ping = async (options) => {
  const config = await getConfig(options.use);

  const ezunpaywall = await connection();

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/graphql',
    });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/graphql`);
    logger.error(err);
    process.exit(1);
  }
  logger.info('Ping graphql service: OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/update',
    });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update`);
    logger.error(err);
    process.exit(1);
  }

  logger.info('Ping update service: OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/enrich',
    });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/enrich`);
    logger.error(err);
    process.exit(1);
  }

  logger.info('Ping enrich service: OK');

  const client = new Client({
    node: {
      url: new URL(`${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`),
      auth: {
        username: config.ezmeta.user,
        password: config.ezmeta.password,
      },
    },
  });

  let ezmetaping;

  try {
    ezmetaping = await client.ping();
  } catch (err) {
    logger.error(`Cannot request ${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`);
    logger.error(err);
    process.exit(1);
  }

  if (ezmetaping?.statusCode !== 200) {
    logger.error(`Cannot request ${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`);
    logger.error(`code HTTP: ${ezmetaping?.statusCode}`);
    process.exit(1);
  }

  logger.info('ezmeta: OK');
  process.exit(0);
};

module.exports = ping;
