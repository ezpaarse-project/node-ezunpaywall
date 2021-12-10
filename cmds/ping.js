const connection = require('../lib/ezunpaywall');
const { getConfig } = require('../lib/config');

const logger = require('../lib/logger');

/**
 * check if service is available
 *
 * @param {boolean} option.use -u --use - filepath of custom config
 */
const ping = async () => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/',
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
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
      url: '/api/update/',
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
    process.exit(1);
  }

  logger.info('Ping update service: OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/enrich/',
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
    process.exit(1);
  }

  logger.info('Ping enrich service: OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/apikey/',
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
    process.exit(1);
  }

  logger.info('Ping apikey service: OK');

  let configApikey;

  try {
    configApikey = await ezunpaywall({
      method: 'GET',
      url: `/api/apikey/config/${config.apikey}`,
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
    process.exit(1);
  }

  logger.info(`You have access to ${configApikey?.data?.access.join(', ')} service(s)`);

  process.exit(0);
};

module.exports = ping;
