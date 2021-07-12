require('chai');
const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');

const { reset } = require('./utils/config');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

// TODO use custom config
const customConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');

describe('Test: command config', async () => {
  before(async () => {
    await exec(`${ezu} config --set`);
  });

  describe('get the custom config', async () => {
    before(async () => {
      await reset();
    });

    it('Should display custom config', async () => {
      await exec(`${ezu} config`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });
  });

  describe('update custom config', async () => {
    beforeEach(async () => {
      await reset();
    });
    it('Should update ezunpaywallProtocol on custom config', async () => {
      await exec(`${ezu} config --ezunpaywallProtocol https`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'https',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezunpaywallHost on custom config', async () => {
      await exec(`${ezu} config --ezunpaywallHost localhost.test`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost.test',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezunpaywallPort on custom config', async () => {
      await exec(`${ezu} config --ezunpaywallPort 3000`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '3000',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmetaProtocol on custom config', async () => {
      await exec(`${ezu} config --ezmetaProtocol https`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'https',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmetaHost on custom config', async () => {
      await exec(`${ezu} config --ezmetaHost localhost.test`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost.test',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmetaPort on custom config', async () => {
      await exec(`${ezu} config --ezmetaPort 9201`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9201',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmetaUser on custom config', async () => {
      await exec(`${ezu} config --ezmetaUser UserTest`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'UserTest',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update ezmetaPassword on custom config', async () => {
      await exec(`${ezu} config --ezmetaPassword password`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'password',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });

    it('Should update apikey on custom config', async () => {
      await exec(`${ezu} config --apikey keykey`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'keykey',
      };

      expect(config).be.eql(config2);
    });

    it('Should set default config on custom config', async () => {
      await exec(`${ezu} config --set`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'http',
          host: 'localhost',
          port: '8080',
        },
        ezmeta: {
          protocol: 'http',
          host: 'localhost',
          port: '9200',
          user: 'elastic',
          password: 'changeme',
        },
        apikey: 'admin',
      };

      expect(config).be.eql(config2);
    });
  });
});
