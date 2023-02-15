const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const logger = require('../../lib/logger');

const snapshotsDir = path.resolve(__dirname, '..', 'sources', 'snapshots');

const ezunpaywallURL = 'http://localhost';
const fakeUnpaywall = 'http://localhost:59799';

/**
 * delete a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be delete on ezunpaywall
 */
const deleteSnapshot = async (filename) => {
  try {
    await chai.request(ezunpaywallURL)
      .delete(`/api/update/snapshots/${filename}`);
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/api/update/snapshots/${filename} - ${err?.response?.status}`);
    process.exit(1);
  }
};

/**
 * add a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be add on ezunpaywall
 */
const addSnapshot = async (filename) => {
  try {
    await chai.request(ezunpaywallURL)
      .post('/api/update/snapshots')
      .set('x-api-key', 'changeme')
      .attach('file', path.resolve(snapshotsDir, filename), filename);
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/api/update/snapshots - ${err?.response?.status}`);
    process.exit(1);
  }
};

/**
 *
 */
const updateChangeFile = async (interval) => {
  try {
    await chai.request(fakeUnpaywall)
      .patch('/changefiles')
      .query({ interval });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/changefiles - ${err?.response?.status}`);
    process.exit(1);
  }
};

/**
 * checks if an update process is being processed
 * @returns {boolean} if in update
 */
const checkIfInUpdate = async () => {
  let res = true;
  try {
    res = await chai.request(ezunpaywallURL).get('/api/update/status');
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/api/update/status - ${err?.response?.status}`);
    process.exit(1);
  }
  return res?.body;
};

/**
 * get state of update
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/api/update/states');
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/api/update/states - ${err?.response?.status}`);
    process.exit(1);
  }
  return res?.body?.state;
};

module.exports = {
  addSnapshot,
  deleteSnapshot,
  updateChangeFile,
  checkIfInUpdate,
  getState,
};
