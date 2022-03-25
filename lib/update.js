const connection = require('./ezunpaywall');
const { getConfig } = require('./config');
const logger = require('./logger');

const getStateByFilename = async (filename) => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'POST',
      url: `/api/update/states/${filename}`,
    });
  } catch (err) {
    logger.errorRequest(err);
    logger.error(err);
    process.exit(1);
  }
  return res?.data?.state || res?.data;
};

const getLatestState = async () => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'POST',
      url: '/api/update/states',
      params: {
        latest: true,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    logger.error(err);
    process.exit(1);
  }
  return res?.data?.state || res?.data;
};

const getStates = async () => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'POST',
      url: '/api/update/states',
    });
  } catch (err) {
    logger.errorRequest(err);
    logger.error(err);
    process.exit(1);
  }
  return res?.data?.state || res?.data;
};

const getReportByFilename = async (filename) => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: `/api/update/reports/${filename}`,
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
};

const getLatestReport = async () => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/reports',
      params: {
        latest: true,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
};

const getReports = async () => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/reports',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
};

const getSnapshots = async () => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/snapshots',
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data || [];
};

module.exports = {
  getStateByFilename,
  getLatestState,
  getStates,
  getSnapshots,
  getReportByFilename,
  getLatestReport,
  getReports,
};
