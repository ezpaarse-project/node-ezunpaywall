require('chai');
const fs = require('fs-extra');
const isEqual = require('lodash.isequal');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  load,
  deleteAll,
} = require('./lib/apikey');

const {
  ping,
} = require('./lib/ping');

const ezu = path.resolve(__dirname, '..', 'ezunpaywall');

const greenColor = ['\u001b[32m', '\u001b[39m'];
const info = `${greenColor[0]}info${greenColor[1]}`;

describe('Apikey: test apikey command', async () => {
  before(async () => {
    await ping();
  });
  describe('Apikey: create', async () => {
    before(async () => {
      await load();
      await deleteAll();
    });
    it('Should create apikey with all config', async () => {
      const res = await exec(`${ezu} apikey-create --keyname user-test1 --access graphql --attributes "*" --allowed true`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').to.not.equal(undefined);
      expect(key.config).have.property('name').equal('user-test1');
      expect(key.config).have.property('access').to.be.an('array').eql(['graphql']);
      expect(key.config).have.property('attributes').equal('*');
      expect(key.config).have.property('allowed').equal(true);
    });

    it('Should create apikey with only name', async () => {
      const res = await exec(`${ezu} apikey-create --keyname user-test2`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').to.not.equal(undefined);
      expect(key.config).have.property('name').equal('user-test2');
      expect(key.config).have.property('access').to.be.an('array').eql(['graphql']);
      expect(key.config).have.property('attributes').equal('*');
      expect(key.config).have.property('allowed').equal(true);
    });

    it('Shouldn\'t create apikey because it\'s already exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-create --keyname user-test1`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    it('Shouldn\'t create apikey because access "hello" doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-create --keyname test-user3 --access hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    it('Shouldn\'t create apikey because attributes "hello" doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-create --keyname user-test3 --attributes hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    it('Shouldn\'t create apikey because allowed are in wrong format', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-create --keyname user-test3 --allowed hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    after(async () => {
      await deleteAll();
      await load();
    });
  });

  describe('Apikey: update', async () => {
    beforeEach(async () => {
      await deleteAll();
      await load();
    });

    it('Should update config.name of apikey', async () => {
      const res = await exec(`${ezu} apikey-update --apikey user --keyname new-name`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('new-name');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').equal('*');
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.access of apikey', async () => {
      const res = await exec(`${ezu} apikey-update --apikey user --access update`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['update']);
      expect(key).have.property('attributes').equal('*');
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.attributes of apikey', async () => {
      const res = await exec(`${ezu} apikey-update --apikey user --attributes doi`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').equal('doi');
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.allowed to false of apikey', async () => {
      const res = await exec(`${ezu} apikey-update --apikey user --allowed false`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').equal('*');
      expect(key).have.property('allowed').equal(false);
    });

    it('Should update config.allowed to true of apikey', async () => {
      const res = await exec(`${ezu} apikey-update --apikey notAllowed --allowed true`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').equal('notAllowed');
      expect(key).have.property('name').equal('notAllowed');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').equal('*');
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.name and config.access of apikey', async () => {
      const res = await exec(`${ezu} apikey-update --apikey user --keyname new-name --access update`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('new-name');
      expect(key).have.property('access').to.be.an('array').eql(['update']);
      expect(key).have.property('attributes').equal('*');
      expect(key).have.property('allowed').equal(true);
    });

    it('Shouldn\'t update config.access because "hello" doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-update --apikey user --access hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    it('Shouldn\'t update config.attributes because "hello" doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-update --apikey user --attributes hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    it('Shouldn\'t update config.allowed because "hello" doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-update --apikey user --keyname new-name`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });
  });

  describe('Apikey: delete', async () => {
    before(async () => {
      await deleteAll();
      await load();
    });

    it('Should delete apikey', async () => {
      const res = await exec(`${ezu} apikey-delete --apikey user`);
      expect(res?.stdout.trim()).equal(`${info}: apikey [user] is deleted successfully`);
    });

    it('Shouldn\'t delete apikey because hello apikey doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-delete --apikey hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    after(async () => {
      await deleteAll();
      await load();
    });
  });

  describe('Apikey: get', async () => {
    before(async () => {
      await deleteAll();
      await load();
    });

    it('Should get config of apikey', async () => {
      const res = await exec(`${ezu} apikey-get --apikey user`);

      const key = JSON.parse(res?.stdout.trim());

      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').equal('*');
      expect(key).have.property('allowed').equal(true);
    });

    it('Should get all apikey', async () => {
      const res = await exec(`${ezu} apikey-get --all`);

      const keys = JSON.parse(res?.stdout.trim());

      let apikeyDev = await fs.readFile(path.resolve(__dirname, 'sources', 'apikey', 'apikey-dev.json'));
      apikeyDev = JSON.parse(apikeyDev);
      const equal = isEqual(keys, apikeyDev);

      expect(equal).equal(true);
    });

    it('Shouldn\'t get config of apikey because this apikey doesn\'t exist', async () => {
      let res;
      try {
        await exec(`${ezu} apikey-get --apikey hello`);
      } catch (err) {
        res = err;
      }
      expect(res).to.not.equal('undefined');
    });

    after(async () => {
      await deleteAll();
      await load();
    });
  });
});
