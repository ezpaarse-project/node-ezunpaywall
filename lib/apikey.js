const connection = require('./ezunpaywall');
const { getConfig } = require('./config');
const logger = require('./logger');

const get = async (apikey) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: `/api/apikey/keys/${apikey}`,
      responseType: 'json',
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  return res?.data;
};

const getAll = async () => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/apikey/keys',
      responseType: 'json',
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    console.log(err.response);
    logger.errorRequest(err);
    process.exit(1);
  }

  return res?.data;
};

const create = async (data) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'POST',
      url: '/api/apikey/keys',
      responseType: 'json',
      data,
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
};

const update = async (apikey, data) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'PUT',
      url: `/api/apikey/keys/${apikey}`,
      responseType: 'json',
      data,
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
};

const del = async (apikey) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    await ezunpaywall({
      method: 'DELETE',
      url: `/api/apikey/keys/${apikey}`,
      responseType: 'json',
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
};

const load = async (data) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'POST',
      url: '/api/apikey/keys/load',
      responseType: 'json',
      headers: {
        'redis-password': config.redisPassword,
      },
      data,
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  return res?.data;
};

module.exports = {
  get,
  getAll,
  create,
  update,
  del,
  load,
};
