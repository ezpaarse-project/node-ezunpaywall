/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../lib/logger');
const { client } = require('./elastic');

chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost';
const fakeUnpaywallURL = 'http://localhost:12000';

const ping = async () => {
  let res;

  // graphql service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/');
    } catch (err) {
      logger.error(`Cannot ping ${ezunpaywallURL}/api/graphql/`);
      logger.error(err);
    }
    console.log(ezunpaywallURL + '/api/');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // update service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/update/');
    } catch (err) {
      logger.error(`Cannot ping ${ezunpaywallURL}/api/update/`);
      logger.error(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // enrich service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/enrich/');
    } catch (err) {
      logger.error(`Cannot ping ${ezunpaywallURL}/api/enrich/`);
      logger.error(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // fakeUnpaywall service
  while (res?.status !== 200) {
    try {
      res = await chai.request(fakeUnpaywallURL).get('/');
    } catch (err) {
      logger.error(`Cannot ping ${fakeUnpaywallURL}/`);
      logger.error(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // elastic service
  while (res?.statusCode !== 200) {
    try {
      res = await client.ping();
    } catch (err) {
      logger.error('Cannot ping elatic');
      logger.error(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

module.exports = {
  ping,
};
