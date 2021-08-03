const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');

const { getConfig } = require('../../lib/config');
const { connection } = require('../../lib/ezunpaywall');

const logger = require('../../lib/logger');

/**
 * check if service is available
 *
 * @param {boolean} options.use -u --use - filepath of custom config
 */
const ping = async (options) => {
  const config = await getConfig(options.use);
  const ezunpaywall = await connection();

  let res;

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api',
    });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api`);
    logger.error(err);
    process.exit(1);
  }
  logger.info('Ping graphql service: OK');

  if (res?.data?.elastic !== 'Alive') {
    logger.error('Cannot request elastic');
    process.exit(1);
  }

  logger.info('ezmeta: OK');

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
  process.exit(0);
};

module.exports = ping;
