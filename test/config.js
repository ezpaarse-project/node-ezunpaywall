require('chai');
const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');

const { reset } = require('./lib/config');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

// TODO use custom config
const customConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

describe('Test: command config', async () => {
  before(async () => {
    await exec(`${ezu} config --set default`);
  });

  describe('get the custom config', async () => {
    before(async () => {
      await reset();
    });

    it('Should set default config on custom config', async () => {
      await exec(`${ezu} config --set default`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://localhost:443',
          apikey: 'admin',
        },
        ezmeta: {
          baseURL: 'http://localhost:9200',
          user: 'elastic',
          password: 'changeme',
        },
      };

      expect(config).be.eql(config2);
    });

    it('Should display custom config', async () => {
      await exec(`${ezu} config`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://localhost:443',
          apikey: 'admin',
        },
        ezmeta: {
          baseURL: 'http://localhost:9200',
          user: 'elastic',
          password: 'changeme',
        },
      };

      expect(config).be.eql(config2);
    });
  });

  describe('update custom config', async () => {
    beforeEach(async () => {
      await reset();
    });
    it('Should update ezunpaywall.baseURL on custom config', async () => {
      await exec(`${ezu} config --set ezunpaywall.baseURL https://test.fr`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://test.fr',
          apikey: 'admin',
        },
        ezmeta: {
          baseURL: 'http://localhost:9200',
          user: 'elastic',
          password: 'changeme',
        },
      };

      expect(config).be.eql(config2);
    });

    it('Should update apikey on custom config', async () => {
      await exec(`${ezu} config --set ezunpaywall.apikey keykey`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://localhost:443',
          apikey: 'keykey',
        },
        ezmeta: {
          baseURL: 'http://localhost:9200',
          user: 'elastic',
          password: 'changeme',
        },
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmeta.baseURL on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.baseURL http://test.fr`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://localhost:443',
          apikey: 'admin',
        },
        ezmeta: {
          baseURL: 'http://test.fr',
          user: 'elastic',
          password: 'changeme',
        },
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmeta.user on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.user UserTest`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://localhost:443',
          apikey: 'admin',
        },
        ezmeta: {
          baseURL: 'http://localhost:9200',
          user: 'UserTest',
          password: 'changeme',
        },
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmeta.password on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.password password`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          baseURL: 'https://localhost:443',
          apikey: 'admin',
        },
        ezmeta: {
          baseURL: 'http://localhost:9200',
          user: 'elastic',
          password: 'password',
        },
      };

      expect(config).be.eql(config2);
    });
  });

  after(async () => {
    await reset();
  });
});
