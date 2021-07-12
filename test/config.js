require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

const customConfig = path.resolve(os.homedir(), '.config', '.ezunpaywallrc');
// TODO use custom config
// const customConfig = path.resolve(__dirname, 'sources', 'customConfigrc');

describe('Test: command config', async () => {
  before(async () => {
    try {
      await exec(`${ezu} config --set`);
    } catch (err) {
      console.log(err);
    }
  });
  describe('Display all arguments', () => {
    it('Should display all arguments', async () => {
      let res;
      try {
        res = await exec(`${ezu} config -L`);
      } catch (err) {
        console.log(err);
      }

      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
        --ezunpaywallProtocol <ezunpaywallProtocol> ezunpaywall protocol
        --ezunpaywallHost <ezunpaywallHost> ezunpaywall host
        --ezunpaywallPort <ezunpaywallPort> ezunpaywall port
        --ezmetaHost <ezmetaHost> ezmeta host
        --ezmetaURL <ezmetaURL> ezmeta url
        --ezmetaPort <ezmetaPort> ezmeta port
        --ezmetaUser <ezmetaUser> ezmeta user
        --ezmetaPassword <ezmetaPassword> ezmeta password
        --apikey <apikey> admin apikey`.trim().replace(/^\s*/gm, ''));
    });
  });

  describe('get the custom config', async () => {
    it('Should display custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config`);
      } catch (err) {
        console.log(err);
      }

      // TODO put customConfig path for from
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "http",
          "host": "localhost",
          "port": "8080"
        },
        "ezmeta": {
          "protocol": "http",
          "host": "localhost",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });
  });

  describe('update custom config', async () => {
    it('Should update ezunpaywallProtocol on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezunpaywallProtocol https`);
      } catch (err) {
        console.log(err);
      }

      // TODO put relative "from"
      // TODO fix indent
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost",
          "port": "8080"
        },
        "ezmeta": {
          "protocol": "http",
          "host": "localhost",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezunpaywallHost on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezunpaywallHost localhost.test`);
      } catch (err) {
        console.log(err);
      }

      // TODO put relative "from"
      // TODO fix indent
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "8080"
        },
        "ezmeta": {
          "protocol": "http",
          "host": "localhost",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezunpaywallPort on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezunpaywallPort 3000`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "http",
          "host": "localhost",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezmetaProtocol on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezmetaProtocol https`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "https",
          "host": "localhost",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezmetaHost on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezmetaHost localhost.test`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezmetaPort on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezmetaPort 9201`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "9201",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezmetaUser on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezmetaUser UserTest`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "9201",
          "user": "UserTest",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update ezmetaPassword on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --ezmetaPassword password`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "9201",
          "user": "UserTest",
          "password": "password"
        },
        "apikey": "admin"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should update apikey on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --apikey keykey`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`
      {
        "ezunpaywall": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "3000"
        },
        "ezmeta": {
          "protocol": "https",
          "host": "localhost.test",
          "port": "9201",
          "user": "UserTest",
          "password": "password"
        },
        "apikey": "keykey"
      }
      from ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });

    it('Should set default config on custom config', async () => {
      let res;
      try {
        res = await exec(`${ezu} config --set`);
      } catch (err) {
        console.log(err);
      }

      expect(res?.stdout.trim().replace(/^\s*/gm, '')).equal(`{
        "ezunpaywall": {
          "protocol": "http",
          "host": "localhost",
          "port": "8080"
        },
        "ezmeta": {
          "protocol": "http",
          "host": "localhost",
          "port": "9200",
          "user": "elastic",
          "password": "changeme"
        },
        "apikey": "admin"
      }
      configuration has been initialized in ${customConfig}`.trim().replace(/^\s*/gm, ''));
    });
  });
});
