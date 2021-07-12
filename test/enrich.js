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
  compareFile,
} = require('./utils/file');

const {
  createIndex,
  countDocuments,
  checkIfInUpdate,
  addSnapshot,
  resetAll,
} = require('./utils/update');

const {
  getState,
} = require('./utils/enrich');

const enrichDir = path.resolve(__dirname, 'sources');

const ezu = path.resolve(__dirname, '..', 'bin', 'ezunpaywall');

describe('Test: command enrich', async () => {
  before(async () => {
    await ping();
    await resetAll();
    await createIndex('unpaywall-test', indexUnpawall);
    await addSnapshot('fake1.jsonl.gz');
    await exec(`${ezu} update -f fake1.jsonl.gz -I unpaywall-test`);

    // wait for the update to finish
    let isUpdate = true;
    while (isUpdate) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      isUpdate = await checkIfInUpdate();
    }
    const count = await countDocuments('unpaywall-test');
    expect(count).to.equal(50);
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file1.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file2.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file2.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with some unpaywall attributes (is_oa, best_oa_location.license, z_authors.family)', () => {
    it('Should enrich the file on 3 lines with args {is_oa} and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -a "{is_oa}" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file3.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -a "{ best_oa_location { license } }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file4.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { given } } and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -a "{ z_authors { given } }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file5.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -a "{ is_oa, best_oa_location { license }, z_authors{ family } }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file6.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });

  describe('Do a enrichment of a csv file with all unpaywall attributes and with semi colomn separator', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.csv');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      await exec(`${ezu} enrichCSV -f ${filepath} -o ${out} -s ";" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'csv', 'file7.csv');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.csv');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });
  describe('Don\'t do a enrichment of a csv file because the arguments doesn\'t exist on ezunpaywall index', () => {
    // TODO
  });
  after(async () => {
    await resetAll();
  });
});

describe('Test: enrichment with a json file (command ezu)', async () => {
  before(async () => {
    await ping();
    await resetAll();
    await createIndex('unpaywall-test', indexUnpawall);
    await addSnapshot('fake1.jsonl.gz');

    await exec(`${ezu} update -f fake1.jsonl.gz -I unpaywall-test`);

    // wait for the update to finish
    let isUpdate = true;
    while (isUpdate) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      isUpdate = await checkIfInUpdate();
    }
    const count = await countDocuments('unpaywall-test');
    expect(count).to.equal(50);
  });

  describe('Do a enrichment of a json file with all unpaywall attributes', () => {
    it('Should enrich the file on 3 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      await exec(`${ezu} enrichJSON -f ${filepath} -o ${out} -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file1.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 2 lines with all unpaywall attributes and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file2.jsonl');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      await exec(`${ezu} enrichJSON -f ${filepath} -o ${out} -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file2.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with is_oa attributes and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      await exec(`${ezu} enrichJSON -f ${filepath} -o ${out} -a "{ is_oa }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file3.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { best_oa_location { license } } and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      await exec(`${ezu} enrichJSON -f ${filepath} -o ${out} -a "{ best_oa_location { license } }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file4.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { z_authors { family } } and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      await exec(`${ezu} enrichJSON -f ${filepath} -o ${out} -a "{ z_authors { family } }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file5.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });

    it('Should enrich the file on 3 lines with args { is_oa, best_oa_location { license }, z_authors{ family } } and download it', async () => {
      const filepath = path.resolve(enrichDir, 'mustBeEnrich', 'file1.jsonl');
      const out = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      await exec(`${ezu} enrichJSON -f ${filepath} -o ${out} -a "{ is_oa, best_oa_location { license }, z_authors{ family } }" -I unpaywall-test`);

      let state;
      while (!state?.done) {
        state = await getState();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const reference = path.resolve(enrichDir, 'enriched', 'jsonl', 'file6.jsonl');
      const fileEnriched = path.resolve(enrichDir, 'enriched', 'enriched.jsonl');

      const same = await compareFile(reference, fileEnriched);
      expect(same).to.be.equal(true);
    });
  });
  describe('Don\'t do a enrichment of a json file because the arguments doesn\'t exist on ezunpaywall index', () => {
    // TODO
  });
  after(async () => {
    await resetAll();
  });
});
