/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

const client = require('../../lib/client');

chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost:8080';

const ping = async () => {
  // api ezunpaywall
  let res1;
  while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
    try {
      res1 = await chai.request(ezunpaywallURL).get('/ping');
    } catch (err) {
      console.error(`ezunpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait elastic started
  let res3;
  while (res3?.statusCode !== 200) {
    try {
      res3 = await client.ping();
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

module.exports = {
  ping,
};
