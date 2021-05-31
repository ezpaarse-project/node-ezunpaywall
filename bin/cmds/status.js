const { connection, getConfig } = require('../../lib/axios');

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
      console.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    console.log(JSON.stringify(res.data, null, 2));
  },
};
