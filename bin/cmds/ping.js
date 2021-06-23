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

  const ezunpaywall = `${config.ezunpaywallURL}:${config.ezunpaywallPort}`;
  const ezmeta = `${config.ezmetaURL}:${config.ezmetaPort}`;

  try {
    await axios({
      method: 'GET',
      url: `${ezunpaywall}/ping`,
    });
  } catch (err) {
    console.error(`service unavailable ${ezunpaywall}`);
    process.exit(1);
  }

  console.log('ping ezunpaywall: OK');

  const client = new Client({
    node: {
      url: new URL(ezmeta),
      auth: {
        username: config.ezmetaUser,
        password: config.ezmetaPassword,
      },
    },
  });

  let ezmetaping;

  try {
    ezmetaping = await client.ping();
  } catch (err) {
    console.error(`service unavailable ${ezmeta}`);
    process.exit(1);
  }

  if (!ezmetaping?.statusCode !== 200) {
    console.error(`service unavailable ${ezmeta}`);
    process.exit(1);
  }

  console.log('ping ezmeta: OK');
  process.exit(0);
};

module.exports = {
  ping,
};
