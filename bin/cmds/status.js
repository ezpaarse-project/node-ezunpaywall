const fs = require('fs-extra');
const path = require('path');

const configPath = path.resolve(__dirname, '..', '..', '.ezunpaywallrc');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
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
      console.log(`error: service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    console.log(res.data);
  },
};
