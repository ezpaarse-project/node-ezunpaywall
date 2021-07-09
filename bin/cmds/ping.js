const axios = require('axios');
const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { getConfig } = require('../../lib/config');

/**
 * check if service is available
 *
 * @param {boolean} args.use -u --use - pathfile of custom config
 */
const ping = async (args) => {
  const config = await getConfig(args.use);

  const ezunpaywallURL = `${config.ezunpaywall.protocol}://${config.ezunpaywall.host}:${config.ezunpaywall.port}`;
  const ezmetaURL = `${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`;

  try {
    await axios({
      method: 'GET',
      url: `${ezunpaywallURL}/ping`,
    });
  } catch (err) {
    console.error(`service unavailable ${ezunpaywallURL}`);
    process.exit(1);
  }

  console.log('ping ezunpaywall: OK');

  const client = new Client({
    node: {
      url: new URL(ezmetaURL),
      auth: {
        username: config.ezmeta.user,
        password: config.ezmeta.password,
      },
    },
  });

  let ezmetaping;

  try {
    ezmetaping = await client.ping();
  } catch (err) {
    console.error(`service unavailable ${ezmetaURL}`);
    process.exit(1);
  }

  if (ezmetaping?.statusCode !== 200) {
    console.error(`service unavailable ${ezmetaURL}`);
    process.exit(1);
  }

  console.log('ping ezmeta: OK');
  process.exit(0);
};

module.exports = {
  ping,
};
