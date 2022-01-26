require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const indexUnpawall = require('./sources/index/unpaywall.json');

const {
  ping,
} = require('./lib/ping');

const {
  deleteSnapshot,
  checkIfInUpdate,
  updateChangeFile,
} = require('./lib/update');

const {
  createIndex,
  countDocuments,
  deleteIndex,
} = require('./lib/elastic');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

const greenColor = ['\u001b[32m', '\u001b[39m'];
const info = `${greenColor[0]}info${greenColor[1]}`;

const redColor = ['\x1B[31m', '\x1B[39m'];
const error = `${redColor[0]}error${redColor[1]}`;

describe('Update: test snapshot update', async () => {
  before(async () => {
    await ping();
  });
  describe('Update: do snapshot update', () => {
    before(async () => {
      await updateChangeFile('day');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update job --index unpaywall-test --snapshot --force`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim()).equal(`${info}: Big update started`);
    });

    it('Should insert 2150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(2150);
    });

    it('Should get report with all informations from the insertion', async () => {
      // wait for the update to finish
      let res;
      try {
        res = await exec(`${ezu} update report --latest`);
      } catch (err) {
        console.log(err);
      }

      const report = JSON.parse(res?.stdout.trim());

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('download');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');
      expect(report.steps[1]).have.property('file').equal('unpaywall-2021-11-30.jsonl.gz');

      expect(report.steps[1]).have.property('task').equal('insert');
      expect(report.steps[1]).have.property('index').equal('unpaywall-test');
      expect(report.steps[1]).have.property('file').equal('unpaywall-2021-11-30.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('linesRead').equal(2150);
      expect(report.steps[1]).have.property('insertedDocs').equal(2150);
      expect(report.steps[1]).have.property('updatedDocs').equal(0);
      expect(report.steps[1]).have.property('failedDocs').equal(0);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');
    });
  });
});
