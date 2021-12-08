const connection = require('../lib/ezunpaywall');
const logger = require('../lib/logger');

/**
 * Indicates if an update process is running
 */
const getStatus = async () => {
  const ezunpaywall = await connection();

  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/update/status',
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
    process.exit(1);
  }
  const status = res?.data;
  if (!status) {
    logger.info('no update is in progress');
  } else {
    logger.info('an update is being done');
  }
};

module.exports = {
  getStatus,
};
