const { connection, getConfig } = require('../../lib/axios');

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
      console.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    if (res?.data?.data === 'pong') {
      console.log(`service available ${config.url}:${config.port}`);
      process.exit(0);
    }
  },
};
