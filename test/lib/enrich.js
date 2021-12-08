const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../lib/logger');

chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost';

/**
 * get state of enrich process
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/api/enrich/state').query({ latest: true });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/api/enrich/state - ${err?.response?.status}`);
    process.exit(1);
  }
  return res?.body;
};
module.exports = {
  getState,
};
