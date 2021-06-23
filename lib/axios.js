const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

module.exports = {
  connection: async (customPath) => {
    let configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
    if (!await fs.pathExists(configPath)) {
      const config = {
        url: 'http://localhost',
        port: 8080,
      };
      try {
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      } catch (err) {
        console.error(err);
      }
      console.log(`fileconfig it's initialized automaticaly at ${configPath}`);
      console.log(JSON.stringify(config, null, 2));
    }

    if (customPath) {
      if (!await fs.pathExists(customPath)) {
        console.error(`${customPath} does not exist`);
        process.exit(1);
      } else {
        configPath = customPath;
      }
    }

    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return axios.create({
      timeout: 30000,
      proxy: false,
      baseURL: `${config.url}:${config.port}`,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  },
};
