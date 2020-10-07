const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const axios = require('../../lib/axios');

const fetchEzUnpaywall = async (tab) => {
  let dois = [];
  let unpaywallRes;
  // map1 contain index of doi
  const map1 = tab.map((elem) => elem?.doi);

  // dois contain only doi to request ezunpaywall
  dois = map1.filter((elem) => elem !== undefined);
  try {
    unpaywallRes = await axios({
      method: 'post',
      url: '/graphql',
      data: {
        query: 'query ($dois: [ID!]!) {getDatasUPW(dois: $dois) { doi, data_standard, genre, is_paratext, journal_issns, journal_issn_l, journal_name, published_date, publisher, title, year}}',
        variables: {
          dois,
        },
      },
    });
  } catch (err) {
    console.log(err.response.error);
    process.exit(1);
  }
  dois = [];
  return unpaywallRes;
};

const enricher = (tab, unpaywallRes) => {
  let found;
  // enricher datas
  tab.forEach((elem1) => {
    if (elem1?.doi) {
      found = unpaywallRes.data.data.getDatasUPW.find((elem2) => elem2.doi === elem1.doi);
      if (found) {
        elem1.upw = found;
      }
    }
  });
};

const writeInFile = (tab) => {
  try {
    tab.forEach(async (enrichedData) => {
      await fs.appendFile('test.jsonl', `${JSON.stringify(enrichedData)}\n`);
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  enricher: async (args) => {
    if (!args.file) {
      console.log('error: file expected');
      process.exit(1);
    }
    const ifFileExist = await fs.pathExists(path.resolve(args.file));
    if (!ifFileExist) {
      console.log('error: file not found');
      process.exit(1);
    }
    let readStream;
    try {
      readStream = fs.createReadStream(path.resolve(args.file));
    } catch (err) {
      console.log(err);
    }

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    let tab = [];
    let unpaywallRes;

    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      const parsedLine = JSON.parse(line);
      if (tab.length !== 100) {
        tab.push(parsedLine);
      }
      if (tab.length === 100) {
        unpaywallRes = await fetchEzUnpaywall(tab);
        enricher(tab, unpaywallRes);
        writeInFile(tab);
        tab = [];
      }
    }
    // if data
    if (tab.length !== 0) {
      unpaywallRes = await fetchEzUnpaywall(tab);
      enricher(tab, unpaywallRes);
      writeInFile(tab);
    }
  },
};
