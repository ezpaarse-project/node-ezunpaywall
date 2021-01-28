const { connection, getConfig } = require('../../lib/axios');
const logger = require('../../lib/logger');

module.exports = {
  ping: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    let res;
    try {
      res = await axios({
        method: 'GET',
        url: '/ping',
      });
    } catch (err) {
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    if (res?.data?.data === 'pong') {
      logger.info(`service available ${config.url}:${config.port}`);
      process.exit(0);
    }
  },
};
