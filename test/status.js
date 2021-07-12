require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  ping,
} = require('./utils/ping');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

describe('Test: command status', async () => {
  before(async () => {
    await ping();
  });

  it('Should display no update in progress', async () => {
    let res;
    try {
      res = await exec(`${ezu} status`);
    } catch (err) {
      console.log(err);
    }

    expect(res?.stdout.trim()).to.be.equal('no update is in progress');
  });
});
