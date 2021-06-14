const { connection } = require('../../lib/axios');
const { getConfig } = require('../../lib/config');

/**
 * check if service is available
 * @param {*} args commander arguments
 * @param -u --use <use> - use a custom config
 */
const ping = async (args) => {
  const axios = await connection(args.use);
  const config = await getConfig(args.use);
  try {
    await axios({
      method: 'GET',
      url: '/ping',
    });
  } catch (err) {
    console.error(`service unavailable ${config.url}:${config.port}`);
    process.exit(1);
  }
  console.log(`service available ${config.url}:${config.port}`);
  process.exit(0);
};

module.exports = {
  ping,
};
