const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const { setConfig } = require('../bin/cmds/config');

module.exports = {
  connection: async (customPath) => {
    let configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
    if (!await fs.pathExists(configPath)) {
      setConfig();
    }

    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return axios.create({
      timeout: 60000,
      proxy: false,
      baseURL: config.baseURL,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  },
};
