require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  ping,
} = require('./utils/ping');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

describe('Test: command ping', async () => {
  before(async () => {
    await ping();
  });

  it('Should display ping ezunpaywall and ping ezmeta', async () => {
    let res;
    try {
      res = await exec(`${ezu} ping`);
    } catch (err) {
      console.log(err);
    }

    expect(res?.stdout.trim()).to.be.equal(`ping ezunpaywall: OK
ping ezmeta: OK`);
  });
});
