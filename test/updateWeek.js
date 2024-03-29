require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { format } = require('date-fns');
const indexUnpawall = require('./sources/index/unpaywall.json');

const ping = require('./lib/ping');

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

const ezu = path.resolve(__dirname, '..', 'ezunpaywall');

const greenColor = ['\u001b[32m', '\u001b[39m'];
const info = `${greenColor[0]}info${greenColor[1]}`;

const redColor = ['\x1B[31m', '\x1B[39m'];
const error = `${redColor[0]}error${redColor[1]}`;

const now = Date.now();
const oneDay = (1 * 24 * 60 * 60 * 1000);

// create date in a format (YYYY-mm-dd) to be use by ezunpaywall
const dateNow = format(new Date(now), 'yyyy-MM-dd');
// yersterday
const date1 = format(new Date(now - (1 * oneDay)), 'yyyy-MM-dd');
// yersterday - one week
const date2 = format(new Date(now - (8 * oneDay)), 'yyyy-MM-dd');
// yersterday - two weeks
const date3 = format(new Date(now - (15 * oneDay)), 'yyyy-MM-dd');
// theses dates are for test between a short period
const date4 = format(new Date(now - (4 * oneDay)), 'yyyy-MM-dd');
const date5 = format(new Date(now - (5 * oneDay)), 'yyyy-MM-dd');
const tomorrow = format(new Date(now + (1 * oneDay)), 'yyyy-MM-dd');

describe('Update: test week update', async () => {
  before(async () => {
    await ping();
  });

  describe('Update: Do weekly update', () => {
    before(async () => {
      await updateChangeFile('week');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update-job-period --index unpaywall-test --interval week --force`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stdout.trim()).equal(`${info}: Insert "week" changefiles between "${date2}" and "${dateNow}"`);
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

      expect(report).have.property('done');
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').be.equal('getChangefiles');
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
  describe(`Update: do a download and insert between ${date2} and ${dateNow}`, async () => {
    before(async () => {
      await updateChangeFile('week');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      const res = await exec(`${ezu} update-job-period --startDate ${date2} --index unpaywall-test --interval week --force`);
      expect(res?.stdout.trim()).equal(`${info}: Insert "week" changefiles between "${date2}" and "${dateNow}"`);
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
      const res = await exec(`${ezu} update-report --latest`);

      const report = JSON.parse(res?.stdout.trim());

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('getChangefiles');
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
      await updateChangeFile('week');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      const res = await exec(`${ezu} update-job-period --startDate ${date3} --endDate ${date2} --index unpaywall-test --interval week --force`);
      expect(res?.stdout.trim()).equal(`${info}: Insert "week" changefiles between "${date3}" and "${date2}"`);
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
      const res = await exec(`${ezu} update-report --latest`);

      const report = JSON.parse(res?.stdout.trim());

      expect(report).have.property('done').equal(true);
      expect(report).have.property('createdAt').to.not.equal(undefined);
      expect(report).have.property('endAt').to.not.equal(undefined);
      expect(report).have.property('steps').to.be.an('array');
      expect(report).have.property('error').equal(false);
      expect(report).have.property('took').to.not.equal(undefined);

      expect(report.steps[0]).have.property('task').equal('getChangefiles');
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

  describe(`Update: don't download and insert between ${date5} and ${date4} because there is no file between these dates in ezunpaywall`, () => {
    before(async () => {
      await updateChangeFile('week');
      await deleteSnapshot('fake1.jsonl.gz');
      await deleteSnapshot('fake2.jsonl.gz');
      await deleteSnapshot('fake3.jsonl.gz');
      await deleteIndex('unpaywall-test', indexUnpawall);
      await createIndex('unpaywall-test', indexUnpawall);
    });

    it('Should return the process start', async () => {
      const res = await exec(`${ezu} update-job-period --startDate ${date5} --endDate ${date4} --interval week --force`);
      expect(res?.stdout.trim()).equal(`${info}: Insert "week" changefiles between "${date5}" and "${date4}"`);
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
        await exec(`${ezu} update-job-period --endDate ${date1} --interval week`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate is missing`);
      }
    });
  });

  describe('Update: don\'t do a download and insert with startDate in the wrong format', () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update-job-period --startDate LookAtMyDab --interval week`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate is in wrong format, required YYYY-mm-dd`);
      }
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update-job-period --startDate 01-01-2000 --interval week`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate is in wrong format, required YYYY-mm-dd`);
      }
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update-job-period --startDate 2000-50-50 --interval week`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate is in wrong format, required YYYY-mm-dd`);
      }
    });
  });

  describe(`Update: don't download and insert between ${date2} and ${date3} because startDate=${date2} is superior than endDate=${date3}`, () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update-job-period --startDate ${date2} --endDate ${date3} --interval week`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: endDate cannot be lower than startDate`);
      }
    });
  });

  describe(`Update: don't download and insert with startDate=${tomorrow} because there can be no futuristic file`, () => {
    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update-job-period --startDate ${tomorrow} --interval week`);
      } catch (err) {
        expect(err?.stdout.trim()).equal(`${error}: startDate cannot be in the future`);
      }
    });
  });
});
