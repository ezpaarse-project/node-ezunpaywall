const { getConfig } = require('../../lib/config');
const { connection } = require('../../lib/ezunpaywall');
const { logger } = require('../../lib/logger');

/**
 * Indicates if an update process is running
 *
 * @param {boolean} args.use -u --use - pathfile of custom config
 */
const getStatus = async (args) => {
  const config = await getConfig(args.use);
  const ezunpaywall = connection();

  let res;
  try {
    res = await ezunpaywall({
      method: 'get',
      url: '/update/status',
    });
  } catch (err) {
    logger.error(`${ezunpaywall.defaults.baseURL}/update/status - ${err}`);
    process.exit(1);
  }
  const status = res?.data?.inUpdate;
  if (!status) {
    logger.info('no update is in progress');
  } else {
    logger.info('an update is being done');
  }
};

module.exports = {
  getStatus,
};
