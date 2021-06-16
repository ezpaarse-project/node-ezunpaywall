const { connection } = require('../../lib/axios');
const { getConfig } = require('../../lib/config');

/**
 * Indicates if an update process is running
 * @param {Object} args commander arguments
 * @param -u --use <use> - use a custom config
 */
const getStatus = async (args) => {
  const axios = await connection(args.use);
  const config = await getConfig(args.use);
  let res;
  try {
    res = await axios({
      method: 'get',
      url: '/update/status',
    });
  } catch (err) {
    console.error(`service unavailable ${config.url}:${config.port}`);
    process.exit(1);
  }
  const status = res?.data?.inUpdate;
  if (!status) {
    console.log('no update is in progress');
  } else {
    console.log('an update is being done');
  }
};

module.exports = {
  getStatus,
};
