const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const snapshotsDir = path.resolve(__dirname, '..', 'sources', 'snapshots');

const ezunpaywallURL = 'https://localhost';
const fakeUnpaywall = 'http://localhost:12000';

/**
 * delete a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be delete on ezunpaywall
 */
const deleteSnapshot = async (filename) => {
  try {
    await chai.request(ezunpaywallURL)
      .delete(`/api/update/snapshot/${filename}`);
  } catch (err) {
    console.error(`deleteSnapshot: ${err}`);
  }
};

/**
 * add a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be add on ezunpaywall
 */
const addSnapshot = async (filename) => {
  try {
    await chai.request(ezunpaywallURL)
      .post('/api/update/snapshot')
      .set('X-API-KEY', 'admin')
      .attach('file', path.resolve(snapshotsDir, filename), filename);
  } catch (err) {
    console.error(`addSnapshot: ${err}`);
  }
};

/**
 *
 */
const updateChangeFile = async () => {
  try {
    await chai.request(fakeUnpaywall)
      .patch('/changefiles');
  } catch (err) {
    console.error(`updateChangeFile: ${err}`);
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
    console.error(`checkIfInUpdate : ${err}`);
  }
  return res?.body?.inUpdate;
};

/**
 * get state of update
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/api/update/state');
  } catch (err) {
    console.error(`getState : ${err}`);
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
