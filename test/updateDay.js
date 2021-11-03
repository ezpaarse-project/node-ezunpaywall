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

describe('Update: test day update', async () => {
  before(async () => {
    await ping();
  });
  describe('Update: Do daily update', () => {
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
        res = await exec(`${ezu} update job --index unpaywall-test --interval day --force`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim()).equal(`${info}: Daily update started`);
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
        res = await exec(`${ezu} update report --latest`);
      } catch (err) {
        console.log(err);
      }

      const report = JSON.parse(res?.stdout.trim());

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').be.equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').be.equal('success');

      expect(report.steps[1]).have.property('task').be.equal('download');
      expect(report.steps[1]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[1]).have.property('percent').be.equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').be.equal('success');

      expect(report.steps[2]).have.property('task').be.equal('insert');
      expect(report.steps[2]).have.property('file').be.equal('fake1.jsonl.gz');
      expect(report.steps[2]).have.property('percent').be.equal(100);
      expect(report.steps[2]).have.property('linesRead').be.equal(50);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').be.equal('success');
    });
  });
});

describe('Update: download and insert file from unpaywall between a period', async () => {
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  const dateNow = new Date(now).toISOString().slice(0, 10);
  // yersterday
  const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  // 2 days before
  const date2 = new Date(now - (2 * oneDay)).toISOString().slice(0, 10);

  // these dates are for test with dates on which no update file has been published from unpaywall
  const date3 = new Date(now - (6 * oneDay)).toISOString().slice(0, 10);
  const date4 = new Date(now - (7 * oneDay)).toISOString().slice(0, 10);
  const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);

  describe(`Update: do a download and insert between ${date2} and ${dateNow}`, async () => {
    before(async () => {
      await updateChangeFile('day');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      const res = await exec(`${ezu} update job --startDate ${date1} --index unpaywall-test --interval day --force`);
      expect(res?.stdout.trim()).equal(`${info}: Download and insert snapshot from unpaywall from ${date1} and ${dateNow}`);
    });

    it('Should insert 150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(150);
    });

    it('Should get report with all informations from the insertion', async () => {
      // wait for the update to finish
      const res = await exec(`${ezu} update report --latest`);

      const report = JSON.parse(res?.stdout.trim());

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('download');
      expect(report.steps[1]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');

      expect(report.steps[2]).have.property('task').equal('insert');
      expect(report.steps[2]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[2]).have.property('percent').equal(100);
      expect(report.steps[2]).have.property('linesRead').equal(100);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').equal('success');

      expect(report.steps[3]).have.property('task').equal('download');
      expect(report.steps[3]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[3]).have.property('percent').equal(100);
      expect(report.steps[3]).have.property('took').to.not.equal(undefined);
      expect(report.steps[3]).have.property('status').equal('success');

      expect(report.steps[4]).have.property('task').equal('insert');
      expect(report.steps[4]).have.property('file').equal('fake1.jsonl.gz');
      expect(report.steps[4]).have.property('percent').equal(100);
      expect(report.steps[4]).have.property('linesRead').equal(50);
      expect(report.steps[4]).have.property('took').to.not.equal(undefined);
      expect(report.steps[4]).have.property('status').equal('success');
    });
  });

  describe(`Update: do a download and insert between ${date3} and ${date2}`, () => {
    before(async () => {
      await updateChangeFile('day');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      const res = await exec(`${ezu} update job --startDate ${date2} --endDate ${date1} --index unpaywall-test --interval day --force`);
      expect(res?.stdout.trim()).equal(`${info}: Download and insert snapshot from unpaywall from ${date2} and ${date1}`);
    });

    it('Should insert 2100 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(2100);
    });

    it('Should get report with all informations from the insertion', async () => {
      // wait for the update to finish
      const res = await exec(`${ezu} update report --latest`);

      const report = JSON.parse(res?.stdout.trim());

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('askUnpaywall');
      expect(report.steps[0]).have.property('took').to.not.equal(undefined);
      expect(report.steps[0]).have.property('status').equal('success');

      expect(report.steps[1]).have.property('task').equal('download');
      expect(report.steps[1]).have.property('file').equal('fake3.jsonl.gz');
      expect(report.steps[1]).have.property('percent').equal(100);
      expect(report.steps[1]).have.property('took').to.not.equal(undefined);
      expect(report.steps[1]).have.property('status').equal('success');

      expect(report.steps[2]).have.property('task').equal('insert');
      expect(report.steps[2]).have.property('file').equal('fake3.jsonl.gz');
      expect(report.steps[2]).have.property('percent').equal(100);
      expect(report.steps[2]).have.property('linesRead').equal(2000);
      expect(report.steps[2]).have.property('took').to.not.equal(undefined);
      expect(report.steps[2]).have.property('status').equal('success');

      expect(report.steps[3]).have.property('task').equal('download');
      expect(report.steps[3]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[3]).have.property('percent').equal(100);
      expect(report.steps[3]).have.property('took').to.not.equal(undefined);
      expect(report.steps[3]).have.property('status').equal('success');

      expect(report.steps[4]).have.property('task').equal('insert');
      expect(report.steps[4]).have.property('file').equal('fake2.jsonl.gz');
      expect(report.steps[4]).have.property('percent').equal(100);
      expect(report.steps[4]).have.property('linesRead').equal(100);
      expect(report.steps[4]).have.property('took').to.not.equal(undefined);
      expect(report.steps[4]).have.property('status').equal('success');
    });
  });

  describe(`Update: don't download and insert between ${date4} and ${date3} because there is no file between these dates in ezunpaywall`, () => {
    before(async () => {
      await updateChangeFile('day');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      const res = await exec(`${ezu} update job --startDate ${date4} --endDate ${date3} --interval day --force`);
      expect(res?.stdout.trim()).equal(`${info}: Download and insert snapshot from unpaywall from ${date4} and ${date3}`);
    });

    it('Should insert nothing', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall-test');
      expect(count).to.equal(0);
    });
  });

  describe(`Update: don't do a download and insert with endDate=${date1} only`, () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update job --endDate ${date1} --interval day`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate is missing`);
      }
    });
  });

  describe('Update: don\'t do a download and insert with startDate in the wrong format', () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update job --startDate LookAtMyDab --interval day`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate are in wrong format, required YYYY-mm-dd`);
      }
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update job --startDate 01-01-2000 --interval day`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate are in wrong format, required YYYY-mm-dd`);
      }
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update job --startDate 2000-50-50 --interval day`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate are in wrong format, required YYYY-mm-dd`);
      }
    });
  });

  describe(`Update: don't download and insert between ${date2} and ${date3} because startDate=${date2} is superior than endDate=${date3}`, () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update job --startDate ${date2} --endDate ${date3} --interval day`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: endDate cannot be lower than startDate`);
      }
    });
  });

  describe(`Update: don't download and insert with startDate=${tomorrow} because there can be no futuristic file`, () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update job --startDate ${tomorrow} --interval day`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate cannot be in the futur`);
      }
    });
  });
});
