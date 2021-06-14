const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost:8080';

/**
 * get state of enrich process
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/enrich/state');
  } catch (err) {
    console.error(`getState : ${err}`);
  }
  return res?.body?.state;
};
module.exports = {
  getState,
};
