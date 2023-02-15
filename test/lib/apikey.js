const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const apikeyURL = process.env.AUTH_URL || 'http://localhost:59704';

/**
 * load default dev apikey
 */
const load = async () => {
  try {
    await chai.request(apikeyURL)
      .post('/keys/loadDev')
      .query({ dev: true })
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
};

/**
 * delete all apikey from redis
 */
const deleteAll = async () => {
  try {
    await chai.request(apikeyURL)
      .delete('/keys')
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
};

module.exports = {
  load,
  deleteAll,
};
