/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('../../lib/logger');
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
      logger.err(`Cannot ping ${ezunpaywallURL}/api/graphql/`);
      logger.err(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // update service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/update/');
    } catch (err) {
      logger.err(`Cannot ping ${ezunpaywallURL}/api/update/`);
      logger.err(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // enrich service
  while (res?.status !== 200) {
    try {
      res = await chai.request(ezunpaywallURL).get('/api/enrich/');
    } catch (err) {
      logger.err(`Cannot ping ${ezunpaywallURL}/api/enrich/`);
      logger.err(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // fakeUnpaywall service
  while (res?.status !== 200) {
    try {
      res = await chai.request(fakeUnpaywallURL).get('/');
    } catch (err) {
      logger.err(`Cannot ping ${fakeUnpaywallURL}/`);
      logger.err(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  res = '';

  // elastic service
  while (res?.statusCode !== 200) {
    try {
      res = await client.ping();
    } catch (err) {
      logger.err('Cannot ping elatic');
      logger.err(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

module.exports = {
  ping,
};
