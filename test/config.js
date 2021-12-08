require('chai');
const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');

const { reset } = require('./lib/config');

const ezu = path.resolve(__dirname, '..', 'ezunpaywall');

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
        baseURL: 'http://localhost',
        apikey: 'admin',
        redisPassword: 'changeme',
      };

      expect(config).be.eql(config2);
    });

    it('Should display custom config', async () => {
      await exec(`${ezu} config`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'http://localhost',
        apikey: 'admin',
        redisPassword: 'changeme',
      };

      expect(config).be.eql(config2);
    });
  });

  describe('update custom config', async () => {
    beforeEach(async () => {
      await reset();
    });
    it('Should update baseURL on custom config', async () => {
      await exec(`${ezu} config --set baseURL https://test.fr`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'https://test.fr',
        apikey: 'admin',
        redisPassword: 'changeme',
      };

      expect(config).be.eql(config2);
    });

    it('Should update apikey on custom config', async () => {
      await exec(`${ezu} config --set apikey keykey`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'http://localhost',
        apikey: 'keykey',
        redisPassword: 'changeme',
      };

      expect(config).be.eql(config2);
    });

    it('Should update apikey on custom config', async () => {
      await exec(`${ezu} config --set redisPassword password`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'http://localhost',
        apikey: 'admin',
        redisPassword: 'password',
      };

      expect(config).be.eql(config2);
    });
  });

  after(async () => {
    await reset();
  });
});
