require('chai');
const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

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
    it('Should update ezunpaywall.protocol on custom config', async () => {
      await exec(`${ezu} config --set ezunpaywall.protocol https`);

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

    it('Should update ezunpaywall.host on custom config', async () => {
      await exec(`${ezu} config --set ezunpaywall.host localhost.test`);

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

    it('Should update ezunpaywal.port on custom config', async () => {
      await exec(`${ezu} config --set ezunpaywall.port 3000`);

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

    it('Should update ezmeta.protocol on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.protocol https`);

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

    it('Should update ezmeta.host on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.host localhost.test`);

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

    it('Should update ezmeta.port on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.port 9201`);

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

    it('Should update ezmeta.user on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.user UserTest`);

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

    it('Should update ezmeta.password on custom config', async () => {
      await exec(`${ezu} config --set ezmeta.password password`);

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
      await exec(`${ezu} config --set apikey keykey`);

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
      await exec(`${ezu} config --set default`);

      // TODO put customConfig path for from
      const config = JSON.parse(await fs.readFile(customConfig, 'utf-8'));

      const config2 = {
        ezunpaywall: {
          protocol: 'https',
          host: 'localhost',
          port: '443',
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
