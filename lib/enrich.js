const connection = require('./ezunpaywall');
const { getConfig } = require('./config');
const logger = require('./logger');

const upload = async (data) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'POST',
      url: '/api/enrich/upload',
      responseType: 'json',
      data,
      headers: { ...data.getHeaders(), 'x-api-key': config.apikey },
      timeout: 60000,
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  return res?.data;
};

const job = async (id, data, size) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    await ezunpaywall({
      method: 'POST',
      url: `/api/enrich/job/${id}`,
      data,
      headers: {
        'Content-length': size,
        'x-api-key': config.apikey,
      },
      responseType: 'json',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  return res?.data;
};

const getState = async (id) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: `/api/enrich/states/${id}.json`,
      headers: {
        'x-api-key': config.apikey,
      },
      responseType: 'json',
    });
  } catch (err) {
    logger.errorRequest(err);
  }

  return res?.data;
};

const download = async (id, type) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  let res;

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: `/api/enrich/enriched/${id}.${type}`,
      responseType: 'stream',
      headers: {
        'x-api-key': config.apikey,
      },
      timeout: 60000,
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  return res?.data;
};

module.exports = {
  upload,
  job,
  getState,
  download,
};
