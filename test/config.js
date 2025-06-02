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
const configDir = process.env.XDG_CONFIG_HOME || path.resolve(os.homedir(), '.config');
const customConfig = path.join(configDir, 'ezunpaywall.json');

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
        adminPassword: 'changeme',
        apikey: 'changeme',
      };

      expect(config).be.eql(config2);
    });

    it('Should display custom config', async () => {
      await exec(`${ezu} config`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'http://localhost',
        adminPassword: 'changeme',
        apikey: 'changeme',
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
        adminPassword: 'changeme',
        apikey: 'changeme',
      };

      expect(config).be.eql(config2);
    });

    it('Should update adminPassword on custom config', async () => {
      await exec(`${ezu} config --set adminPassword password`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'http://localhost',
        adminPassword: 'password',
        apikey: 'changeme',
      };

      expect(config).be.eql(config2);
    });

    it('Should update apikey on custom config', async () => {
      await exec(`${ezu} config --set apikey password`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        baseURL: 'http://localhost',
        adminPassword: 'changeme',
        apikey: 'password',
      };

      expect(config).be.eql(config2);
    });
  });

  after(async () => {
    await reset();
  });
});
