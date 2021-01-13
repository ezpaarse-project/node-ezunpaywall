const fs = require('fs-extra');
const path = require('path');

const configPath = path.resolve(__dirname, '..', '..', '.ezunpaywallrc');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

module.exports = {
  config: async (args) => {
    if (args.url) {
      config.url = args.url;
    }
    if (args.port) {
      config.port = args.port;
    }

    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
      console.log(err);
    }
  },
};
