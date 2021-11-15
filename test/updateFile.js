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
  addSnapshot,
  checkIfInUpdate,
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

describe('Update: test insert the content of a file already installed on ezunpaywall', async () => {
  before(async () => {
    await ping();
  });

  describe('Update: do insertion of a file already installed', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update-job --file fake1.jsonl.gz --index unpaywall-test --interval day --force`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim()).equal(`${info}: Update with fake1.jsonl.gz`);
    });

    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(50);
    });

    it('Should get report with all informations from the insertion', async () => {
      // wait for the update to finish
      let res;
      try {
        res = await exec(`${ezu} update-report --latest`);
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

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });
  });

  describe('Update: do insertion of a file already installed with parameter limit=10', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update-job --file fake1.jsonl.gz --limit 10 --index unpaywall-test --interval day --force`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim()).equal(`${info}: Update with fake1.jsonl.gz`);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    it('Should get report with all informations from the insertion', async () => {
      // wait for the update to finish
      let res;
      try {
        res = await exec(`${ezu} update-report --latest`);
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

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(10);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });
  });

  describe('Update: do insertion of a file already installed offset=40', () => {
    before(async () => {
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update-job --file fake1.jsonl.gz --offset 40 --index unpaywall-test --interval day --force`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim()).equal(`${info}: Update with fake1.jsonl.gz`);
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(10);
    });

    it('Should get report with all informations from the insertion', async () => {
      // wait for the update to finish
      let res;
      try {
        res = await exec(`${ezu} update-report --latest`);
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

      expect(report.steps[0]).have.property('task').equal('insert');
      expect(report.steps[0]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[0]).have.property('percent').equal(100);
      expect(report.steps[0]).have.property('linesRead').equal(50);
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');
    });
  });
});
