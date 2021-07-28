const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../lib/logger');

chai.use(chaiHttp);



const ezunpaywallURL = 'https://localhost';

/**
 * get state of enrich process
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/api/enrich/state');
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywallURL}/api/enrich/state `);
    logger.error(err);
    process.exit(1);
  }
  return res?.body?.state;
};
module.exports = {
  getState,
};
