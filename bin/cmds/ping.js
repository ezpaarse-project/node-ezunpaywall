const fs = require('fs-extra');
const path = require('path');

const axios = require('../../lib/axios');

const configPath = path.resolve(__dirname, '..', '..', '.ezunpaywallrc');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

module.exports = {
  ping: async () => {
    let res;
    try {
      res = await axios({
        method: 'GET',
        url: '/ping',
      });
    } catch (err) {
      console.log(`error: service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    if (res?.data.data === 'pong') {
      console.log(`service available ${config.url}:${config.port}`);
      process.exit(0);
    }
  },
};
