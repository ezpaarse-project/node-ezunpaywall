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
  compareFile,
} = require('./lib/file');

const {
  createIndex,
  deleteIndex,
  countDocuments,
  insertDataUnpaywall,
} = require('./lib/elastic');

const {
  getState,
} = require('./lib/enrich');

const sourcesDir = path.resolve(__dirname, 'sources');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

describe('Test: enrichment with a CSV file', async () => {
  before(async () => {
    await ping();
    await createIndex('unpaywall-test', indexUnpawall);
    await insertDataUnpaywall();

    const ndData = await countDocuments('unpaywall-test');
    expect(ndData).eq(50);
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file1.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file2.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file2.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with args { is_oa } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{is_oa}" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file3.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ best_oa_location { license } }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file4.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ z_authors { given } }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file5.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ is_oa, best_oa_location { license }, z_authors{ family } }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file6.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.csv');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.csv');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --separator ";" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'csv', 'file7.csv');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });
  });
  describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
    // TODO
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
  });
});
