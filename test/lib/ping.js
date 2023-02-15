/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const nginxHost = 'http://localhost';
const fakeUnpaywallHost = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:59799';
const elasticHost = process.env.UPDATE_HOST || 'http://elastic:changeme@localhost:9200';

const ping = async () => {
  const nginx = await chai.request(nginxHost).get('/api/ping');
  if (nginx.status !== 204) {
    throw new Error(`[graphql] Bad status : ${nginx?.status}`);
  }

  const update = await chai.request(nginxHost).get('/api/update/ping');
  if (update.status !== 204) {
    throw new Error(`[update] Bad status : ${nginx?.status}`);
  }

  const enrich = await chai.request(nginxHost).get('/api/enrich/ping');
  if (enrich.status !== 204) {
    throw new Error(`[enrich] Bad status : ${nginx?.status}`);
  }

  const apikey = await chai.request(nginxHost).get('/api/apikey/ping');
  if (apikey.status !== 204) {
    throw new Error(`[apikey] Bad status : ${nginx?.status}`);
  }

  const fakeUnpaywall = await chai.request(fakeUnpaywallHost).get('/ping');
  if (fakeUnpaywall?.status !== 204) {
    throw new Error(`[fakeUnpaywall] Bad status : ${fakeUnpaywall?.status}`);
  }

  const elastic = await chai.request(elasticHost).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic] Bad status : ${elastic?.status}`);
  }
};

module.exports = ping;
