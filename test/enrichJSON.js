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

const ezu = path.resolve(__dirname, '..', 'ezunpaywall');

describe('Test: enrichment with a json file', async () => {
  before(async () => {
    await ping();
    await createIndex('unpaywall-test', indexUnpawall);
    await insertDataUnpaywall();
    const ndData = await countDocuments('unpaywall-test');
    expect(ndData).eq(50);
  });

  describe('Do a enrichment of a json file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.jsonl');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.jsonl');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --index unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const reference = path.resolve(sourcesDir, 'enriched', 'jsonl', 'file1.jsonl');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file2.jsonl');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.jsonl');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'jsonl', 'file2.jsonl');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with { is_oa } attributes and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.jsonl');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.jsonl');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ is_oa }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'jsonl', 'file3.jsonl');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.jsonl');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.jsonl');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ best_oa_location { license } }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'jsonl', 'file4.jsonl');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { family } } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.jsonl');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.jsonl');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ z_authors { family } }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'jsonl', 'file5.jsonl');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const filepath = path.resolve(sourcesDir, 'mustBeEnrich', 'file1.jsonl');
      const enriched = path.resolve(sourcesDir, 'tmp', 'enriched.jsonl');

      await exec(`${ezu} enrich job --file ${filepath} --out ${enriched} --attributes "{ is_oa, best_oa_location { license }, z_authors{ family } }" --index unpaywall-test`);

      let state;
      do {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (!state?.done);

      const reference = path.resolve(sourcesDir, 'enriched', 'jsonl', 'file6.jsonl');

      const same = await compareFile(reference, enriched);
      expect(same).to.be.equal(true);
    });
  });
  after(async () => {
    await deleteIndex('unpaywall-test');
  });
});
