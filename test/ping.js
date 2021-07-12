require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  ping,
} = require('./utils/ping');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

const greenColor = ['\u001b[32m', '\u001b[39m'];
const info = `${greenColor[0]}info${greenColor[1]}`;

describe('Test: command ping', async () => {
  before(async () => {
    await ping();
  });

  it('Should display ping ezunpaywall and ping ezmeta', async () => {
    const res = await exec(`${ezu} ping`);

    expect(res?.stdout.trim()).to.be.equal(`${info}: ping ezunpaywall: OK
${info}: ping ezmeta: OK`);
  });
});
