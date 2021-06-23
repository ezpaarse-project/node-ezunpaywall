const axios = require('axios');

const { getConfig } = require('../../lib/config');

/**
 * Indicates if an update process is running
 * @param {Object} args commander arguments
 * @param -u --use <use> - use a custom config
 */
const getStatus = async (args) => {
  const config = await getConfig(args.use);

  const ezunpaywall = `${config.ezunpaywallURL}:${config.ezunpaywallPort}`;

  let res;
  try {
    res = await axios({
      method: 'get',
      url: `${ezunpaywall}/update/status`,
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
