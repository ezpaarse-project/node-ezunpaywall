/* eslint-disable no-await-in-loop */
require('chai');
const { expect } = require('chai');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const indexUnpawall = require('./sources/index/unpaywall.json');

const {
  ping,
} = require('./utils/ping');

const {
  createIndex,
  countDocuments,
  checkIfInUpdate,
  addSnapshot,
  resetAll,
} = require('./utils/update');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

describe('Test: insert the content of a file already installed on ezunpaywall', async () => {
  before(async () => {
    await ping();
  });

  describe('Do a classic insertion of a file already installed', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update -f fake1.jsonl.gz`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal('start upsert with fake1.jsonl.gz');
    });

    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(50);
    });

    after(async () => {
      await resetAll();
    });
  });

  describe('Do a classic insertion of a file already installed with parameter limit=10', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update -f fake1.jsonl.gz --limit 10`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal('start upsert with fake1.jsonl.gz');
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(10);
    });

    after(async () => {
      await resetAll();
    });
  });

  after(async () => {
    await resetAll();
  });

  describe('Do a classic insertion of a file already installed offset=40', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
      await addSnapshot('fake1.jsonl.gz');
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update -f fake1.jsonl.gz --offset 40`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal('start upsert with fake1.jsonl.gz');
    });

    it('Should insert 10 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(10);
    });

    after(async () => {
      await resetAll();
    });
  });

  after(async () => {
    await resetAll();
  });
});

describe('Test: weekly update', async () => {
  before(async () => {
    await ping();
  });

  describe('Do a classic weekly update', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal('weekly update has begun, list of task has been created on elastic');
    });

    it('Should insert 50 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(50);
    });

    after(async () => {
      await resetAll();
    });
  });
  after(async () => {
    await resetAll();
  });
});

describe('Test: download and insert file from unpaywall between a period', async () => {
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  // create date in a format (YYYY-mm-dd) to be use by ezunpaywall
  const dateNow = new Date(now).toISOString().slice(0, 10);
  // yersterday
  const date1 = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  // yersterday - one week
  const date2 = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  // yersterday - two weeks
  const date3 = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
  // theses dates are for test between a short period
  const date4 = new Date(now - (4 * oneDay)).toISOString().slice(0, 10);
  const date5 = new Date(now - (5 * oneDay)).toISOString().slice(0, 10);
  const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);

  before(async () => {
    await ping();
  });

  describe(`Do a download and insert between ${date2} and ${dateNow}`, async () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update --startDate ${date2}`);
      } catch (err) {
        console.log(err);
      }
      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal(`insert snapshot beetween ${date2} and ${dateNow} has begun, list of task has been created on elastic`);
    });

    it('Should insert 150 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(150);
    });

    after(async () => {
      await resetAll();
    });
  });

  describe(`Do a download and insert between ${date3} and ${date2}`, () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update --startDate ${date3} --endDate ${date2}`);
      } catch (err) {
        console.log(err);
      }

      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal(`insert snapshot beetween ${date3} and ${date2} has begun, list of task has been created on elastic`);
    });

    it('Should insert 2100 data', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(2100);
    });

    after(async () => {
      await resetAll();
    });
  });

  describe(`Don't download and insert between ${date5} and ${date4} because there is no file between these dates in ezunpaywall`, () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return the process start', async () => {
      let res;
      try {
        res = await exec(`${ezu} update --startDate ${date5} --endDate ${date4}`);
      } catch (err) {
        console.log(err);
      }

      expect(res?.stderr).equal('');
      expect(res?.stdout.trim()).equal(`insert snapshot beetween ${date5} and ${date4} has begun, list of task has been created on elastic`);
    });

    it('Should insert nothing', async () => {
      // wait for the update to finish
      let isUpdate = true;
      while (isUpdate) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        isUpdate = await checkIfInUpdate();
      }
      const count = await countDocuments('unpaywall');
      expect(count).to.equal(0);
    });

    after(async () => {
      await resetAll();
    });
  });

  describe(`Don't do a download and insert with endDate=${date1} only`, () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update --endDate ${date1}`);
      } catch (res) {
        expect(res?.stderr.trim()).equal('option --endDate is impossible to use without --startDate');
        expect(res?.stdout).equal('');
      }
    });

    after(async () => {
      await resetAll();
    });
  });

  describe('Don\'t do a download and insert with startDate in the wrong format', () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update --startDate LookAtMyDab`);
      } catch (res) {
        expect(res?.stderr.trim()).equal('startDate are in bad format, expected YYYY-mm-dd');
        expect(res?.stdout).equal('');
      }
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update --startDate 01-01-2000`);
      } catch (res) {
        expect(res?.stderr.trim()).equal('startDate are in bad format, expected YYYY-mm-dd');
        expect(res?.stdout).equal('');
      }
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update --startDate 2000-50-50`);
      } catch (res) {
        expect(res?.stderr.trim()).equal('startDate are in bad format, expected YYYY-mm-dd');
        expect(res?.stdout).equal('');
      }
    });

    after(async () => {
      await resetAll();
    });
  });

  describe(`Don't download and insert between ${date2} and ${date3} because startDate=${date2} is superior than endDate=${date3}`, () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update --startDate ${date2} --endDate ${date3}`);
      } catch (res) {
        expect(res?.stderr.trim()).equal('end date is lower than start date');
        expect(res?.stdout).equal('');
      }
    });

    after(async () => {
      await resetAll();
    });
  });

  describe(`Don't download and insert with startDate=${tomorrow} because there can be no futuristic file`, () => {
    before(async () => {
      await resetAll();
      await createIndex('unpaywall', indexUnpawall);
    });

    it('Should return a error message', async () => {
      try {
        await exec(`${ezu} update --startDate ${tomorrow}`);
      } catch (res) {
        expect(res?.stderr.trim()).equal('startDate is in the futur');
        expect(res?.stdout).equal('');
      }
    });

    after(async () => {
      await resetAll();
    });
  });

  after(async () => {
    await resetAll();
  });
});
