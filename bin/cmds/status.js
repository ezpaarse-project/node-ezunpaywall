const { connection, getConfig } = require('../../lib/axios');
const logger = require('../../lib/logger');

module.exports = {
  getTask: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    let res;
    try {
      res = await axios({
        method: 'get',
        url: '/task',
      });
    } catch (err) {
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    logger.info(JSON.stringify(res.data, null, 2));
  },
};
