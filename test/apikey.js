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

const sourcesDir = path.resolve(__dirname, 'sources');

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
      let res;
      try {
        res = await exec(`${ezu} apikey-create --keyname user-test1 --access graphql --attributes "*" --allowed true`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout?.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').to.not.equal(undefined);
      expect(key.config).have.property('name').equal('user-test1');
      expect(key.config).have.property('access').to.be.an('array').eql(['graphql']);
      expect(key.config).have.property('attributes').to.be.an('array').eql(['*']);
      expect(key.config).have.property('allowed').equal(true);
    });

    it('Should create apikey with only name', async () => {
      let res;
      try {
        res = await exec(`${ezu} apikey-create --keyname user-test2`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').to.not.equal(undefined);
      expect(key.config).have.property('name').equal('user-test2');
      expect(key.config).have.property('access').to.be.an('array').eql(['graphql']);
      expect(key.config).have.property('attributes').to.be.an('array').eql(['*']);
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
      let res;
      try {
        res = await exec(`${ezu} apikey-update --apikey user --keyname new-name`);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('new-name');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').to.be.an('array').eql(['*']);
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.access of apikey', async () => {
      let res;
      try {
        res = await exec(`${ezu} apikey-update --apikey user --access update`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['update']);
      expect(key).have.property('attributes').to.be.an('array').eql(['*']);
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.attributes of apikey', async () => {
      let res;

      try {
        res = await exec(`${ezu} apikey-update --apikey user --attributes doi`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').to.be.an('array').eql(['doi']);
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.attributes of apikey', async () => {
      let res;

      try {
        res = await exec(`${ezu} apikey-update --apikey user --attributes doi,is_oa`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').to.be.an('array').eql(['doi', 'is_oa']);
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.allowed to false of apikey', async () => {
      let res;

      try {
        res = await exec(`${ezu} apikey-update --apikey user --allowed false`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').to.be.an('array').eql(['*']);
      expect(key).have.property('allowed').equal(false);
    });

    it('Should update config.allowed to true of apikey', async () => {
      let res;

      try {
        res = await exec(`${ezu} apikey-update --apikey notAllowed --allowed true`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('notAllowed');
      expect(key).have.property('name').equal('notAllowed');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').to.be.an('array').eql(['*']);
      expect(key).have.property('allowed').equal(true);
    });

    it('Should update config.name and config.access of apikey', async () => {
      let res;
      try {
        res = await exec(`${ezu} apikey-update --apikey user --keyname new-name --access update`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('apikey').equal('user');
      expect(key).have.property('name').equal('new-name');
      expect(key).have.property('access').to.be.an('array').eql(['update']);
      expect(key).have.property('attributes').to.be.an('array').eql(['*']);
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
      let res;

      try {
        res = await exec(`${ezu} apikey-delete --apikey user`);
      } catch (err) {
        console.error(err);
      }

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
      let res;
      try {
        res = await exec(`${ezu} apikey-get --apikey user`);
      } catch (err) {
        console.error(err);
      }

      let key;

      try {
        key = JSON.parse(res?.stdout.trim());
      } catch (err) {
        console.error(err);
      }

      expect(key).have.property('name').equal('user');
      expect(key).have.property('access').to.be.an('array').eql(['graphql', 'enrich']);
      expect(key).have.property('attributes').to.be.an('array').eql(['*']);
      expect(key).have.property('allowed').equal(true);
    });

    it('Should get all apikey', async () => {
      let res;

      try {
        res = await exec(`${ezu} apikey-get --all`);
      } catch (err) {
        console.error(err);
      }

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

  describe('Apikey: update', async () => {
    it('Should load apikey file', async () => {
      const keysPath = path.resolve(sourcesDir, 'apikey', 'keys.json');

      let res;
      try {
        await exec(`${ezu} apikey-load --file ${keysPath}`);
      } catch (err) {
        res = err;
      }

      // TODO test apikey are present
      expect(res).to.not.equal('undefined');
    });
  });

  after(async () => {
    await deleteAll();
    await load();
  });
});
