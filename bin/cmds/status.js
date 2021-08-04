const axios = require('axios');

const { getConfig } = require('../../lib/config');

/**
 * Indicates if an update process is running
 *
 * @param {boolean} args.use -u --use - pathfile of custom config
 */
const getStatus = async (args) => {
  const config = await getConfig(args.use);

  const ezunpaywallURL = `${config.ezunpaywall.protocol}://${config.ezunpaywall.host}:${config.ezunpaywall.port}`;

  let res;
  try {
    res = await axios({
      method: 'get',
      url: `${ezunpaywallURL}/update/status`,
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
