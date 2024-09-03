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
      url: '/api',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  logger.info('[graphql] ping - OK');

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/health/elastic',
    });
  } catch (err) {
    console.log(err);
    logger.errorRequest(err);
    process.exit(1);
  }

  if (!res?.data?.healthy) {
    logger.error('Cannot ping elastic: unhealthy');
    process.exit(1);
  }

  logger.info('[elastic] ping - OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/update',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  logger.info('[update] ping - OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/enrich',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  logger.info('[enrich] ping - OK');

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/api/apikey',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  logger.info('[apikey] ping - OK');

  let configApikey;

  try {
    configApikey = await ezunpaywall({
      method: 'GET',
      url: `/api/apikey/keys/${config.apikey}`,
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(0);
  }

  logger.info(`You have access to ${configApikey?.data?.access.join(', ')} service(s)`);

  process.exit(0);
};

module.exports = ping;
