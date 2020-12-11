const axios = require('../../lib/axios');

module.exports = {
  getTasks: async () => {
    let res;
    try {
      res = await axios({
        method: 'get',
        url: '/tasks',
      });
    } catch (err) {
      console.log('error: service unavailable');
      process.exit(1);
    }
    console.log(res.data);
  },
};
