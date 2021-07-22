const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');

const { getConfig } = require('../../lib/config');
const { connection } = require('../../lib/ezunpaywall');
const logger = require('../../lib/logger');

/**
 * check if service is available
 *
 * @param {boolean} args.use -u --use - pathfile of custom config
 */
const ping = async (args) => {
  const config = await getConfig(args.use);

  const ezunpaywall = await connection();
  const ezmetaURL = `${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`;

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/graphql',
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/graphql - ${err}`);
    process.exit(1);
  }
  logger.info('ping graphql service: OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/update',
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/update - ${err}`);
    process.exit(1);
  }

  logger.info('ping update service: OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/enrich',
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/enrich - ${err}`);
    process.exit(1);
  }

  logger.info('ping enrich service: OK');

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
    logger.error(`${ezmetaURL}/ping`);
    process.exit(1);
  }

  if (ezmetaping?.statusCode !== 200) {
    logger.error(`${ezmetaURL} - ${ezmetaping?.statusCode}`);
    process.exit(1);
  }

  logger.info('ezmeta: OK');
  process.exit(0);
};

module.exports = {
  ping,
};
