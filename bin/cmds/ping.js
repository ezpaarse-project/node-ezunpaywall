const axios = require('axios');

const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { getConfig } = require('../../lib/config');
const { connection } = require('../../lib/ezunpaywall');

/**
 * check if service is available
 *
 * @param {boolean} args.use -u --use - pathfile of custom config
 */
const ping = async (args) => {
  const config = await getConfig(args.use);

  const ezunpaywall = await connection();
  const ezmetaURL = `${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`;

  try {
    await ezunpaywall({
      method: 'GET',
      url: '/ping',
    });
  } catch (err) {
    console.error(`service unavailable ${ezunpaywall.defaults.baseURL}`);
    process.exit(1);
  }

  console.log('ping ezunpaywall: OK');

  const client = new Client({
    node: {
      url: new URL(`${config.ezmeta.protocol}://${config.ezmeta.host}:${config.ezmeta.port}`),
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
