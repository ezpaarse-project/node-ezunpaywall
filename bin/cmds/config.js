const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const setConfig = async () => {
  const pathConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
  const config = {
    url: 'http://localhost',
    port: 8080,
  };
  try {
    await fs.writeFile(pathConfig, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
  }
  console.log(`configuration has been initialized in ${pathConfig}`);
  console.log(JSON.stringify(config, null, 2));
};

module.exports = {
  config: async (args) => {
    if (args.list) {
      console.log('--url <url> ezunpaywall url');
      console.log('--port <port> ezunpaywall port');
      process.exit(0);
    }
    const configPath = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
    if (!await fs.pathExists(configPath)) {
      await setConfig();
    }
    if (args.set) {
      await setConfig();
      process.exit(0);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (args.get) {
      console.log(JSON.stringify(config, null, 2));
      console.log(`from ${configPath}`);
      process.exit(0);
    }
    if (args.url) {
      const regexURL = /^(ftp|http|https):\/\/[^ "]+$/;
      const valideURL = regexURL.test(args.url);
      if (valideURL) {
        config.url = args.url;
      } else {
        console.error(`'${args.url}' is not a valide URL`);
        process.exit(1);
      }
    }
    if (args.port) {
      if (Number.isNaN(args.port)) {
        console.error(`${args.port} is not a number`);
        process.exit(1);
      }
      config.port = args.port;
    }

    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
      console.error(err);
    }

    console.log(JSON.stringify(config, null, 2));
    console.log(`from ${configPath}`);
    process.exit(0);
  },
};
