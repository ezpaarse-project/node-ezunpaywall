/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { client } = require('./elastic');

chai.use(chaiHttp);



const ezunpaywallURL = 'https://localhost';
const fakeUnpaywallURL = 'http://localhost:12000';

const ping = async () => {
  let res;

  // graphql service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/graphql/');
    } catch (err) {
      console.error(`graphql service ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // update service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/update/');
    } catch (err) {
      console.error(`update service ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // enrich service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/enrich/');
    } catch (err) {
      console.error(`enrich service ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // fakeUnpaywall service
  while (res?.status !== 200) {
    try {
      res = await chai.request(fakeUnpaywallURL).get('/');
    } catch (err) {
      console.error(`fakeUnpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log('ping fakeUnpaywall: OK');

  res = '';

  // elastic service
  while (res?.statusCode !== 200) {
    try {
      res = await client.ping();
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

module.exports = {
  ping,
};
