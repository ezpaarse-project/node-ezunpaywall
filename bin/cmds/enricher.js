const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const Papa = require('papaparse');
const axios = require('../../lib/axios');

let tabAttributes = [
  'data_standard',
  'doi',
  'doi_url',
  'genre',
  'is_paratext',
  'is_oa',
  'journal_is_in_doaj',
  'journal_is_oa',
  'journal_issns',
  'journal_issn_l',
  'journal_name',
  'oa_status',
  'published_date',
  'publisher',
  'title',
  'updated',
  'year',
];

let headers = [];
let i = '';

const getExtension = (file) => {
  const basename = file.split(/[\\/]/).pop();
  const pos = basename.lastIndexOf('.');
  if (basename === '' || pos < 1) {
    return '';
  }
  return basename.slice(pos + 1);
};

const fetchEzUnpaywall = async (tab) => {
  let dois = [];
  let response = [];
  // contain index of doi
  const map1 = await tab.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  try {
    response = await axios({
      method: 'post',
      url: '/graphql',
      data: {
        query: `query ($dois: [ID!]!) {getDatasUPW(dois: $dois) { doi, ${tabAttributes.toString()} }}`,
        variables: {
          dois,
        },
      },
    });
  } catch (err) {
    if (!err.response) {
      console.log('error: url server incorrect');
    }
    process.exit(1);
  }
  // TODO verif
  return response.data.data.getDatasUPW;
};

const enricherTab = (tab, response) => {
  const results = new Map();
  // index on doi
  response.forEach((el) => {
    if (el.doi) {
      results.set(el.doi, el);
    }
  });
  // enricher
  tab.forEach((el) => {
    if (!el.doi) {
      return;
    }
    const data = results.get(el.doi);
    if (!data) {
      return;
    }
    tabAttributes.forEach((attr) => {
      if (attr !== 'doi') {
        el[attr] = data[attr];
      }
    });
  });
};

const writeInFileJSON = async (tab) => {
  try {
    const stringTab = tab.map((el) => JSON.stringify(el)).join('\n');
    await fs.appendFile('out.json', stringTab);
  } catch (err) {
    console.error(err);
  }
};

const readFileJSON = async (readStream) => {
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  let tab = [];
  let parsedLine;

  // eslint-disable-next-line no-restricted-syntax
  for await (const line of rl) {
    parsedLine = JSON.parse(line);
    if (tab.length !== 100) {
      tab.push(parsedLine);
    }
    if (tab.length === 100) {
      const response = await fetchEzUnpaywall(tab);
      enricherTab(tab, response);
      await writeInFileJSON(tab);
      tab = [];
    }
  }
  // last insertion
  if (tab.length !== 0) {
    const response = await fetchEzUnpaywall(tab);
    enricherTab(tab, response);
    await writeInFileJSON(tab);
  }
};

const writeInFileCSV = async (tab) => {
  try {
    const val = await Papa.unparse(tab, {
      header: false,
      delimiter: ',',
      columns: headers,
    });
    // TODO passé par un stream d'écriture writeFileStream
    await fs.appendFile('out.csv', `${val}\r\n`);
  } catch (err) {
    console.error(err);
  }
};

const enricherHeaderCSV = async (header) => {
  // delete attribute already in header
  await header.forEach((el) => {
    if (tabAttributes.includes(el)) {
      const index = tabAttributes.indexOf(el);
      tabAttributes.splice(index, 1);
    }
  });

  // enricher header
  return header.concat(tabAttributes);
};

const writeHeaderCSV = async (header) => {
  try {
    // TODO passé par un stream d'écriture writeFileStream
    await fs.appendFile('out.csv', `${header}\r\n`);
  } catch (err) {
    console.log(err);
  }
};

const readFileCSV = (readStream) => {
  let tab = [];
  let head = true;
  Papa.parse(readStream, {
    delimiter: ',',
    header: true,
    transformHeader: (header) => {
      headers.push(header.trim());
      return header.trim();
    },
    step: async (results, parser) => {
      // first step: write enriched header
      if (head) {
        head = false;
        await parser.pause();
        headers = await enricherHeaderCSV(headers);
        await writeHeaderCSV(headers);
        await parser.resume();
      }
      if (tab.length !== 100) {
        tab.push(results.data);
      }
      if (tab.length === 100) {
        const needEnriched = tab;
        tab = [];
        await parser.pause();
        const response = await fetchEzUnpaywall(needEnriched);
        enricherTab(needEnriched, response);
        await writeInFileCSV(needEnriched);
        await parser.resume();
      }
    },
  });
};

const checkAttributes = (attributes) => {
  if (attributes?.length) {
    attributes.forEach((attr) => {
      if (!tabAttributes.includes(attr)) {
        console.log(`error: attribut ${attr} doesn't on unpaywall data`);
        process.exit(1);
      }
    });
    tabAttributes = attributes;
  }
};

module.exports = {
  enricher: async (args) => {
    const file = path.resolve(args.file);
    if (!args.file) {
      console.log('error: file expected');
      process.exit(1);
    }
    const ifFileExist = await fs.pathExists(file);
    if (!ifFileExist) {
      console.log('error: file not found');
      process.exit(1);
    }
    checkAttributes(args.attributes);
    let readStream;
    try {
      readStream = fs.createReadStream(file);
    } catch (err) {
      console.log('error: impossible de read file');
    }
    if (getExtension(file) === 'jsonl') {
      readFileJSON(readStream);
    }
    if (getExtension(file) === 'csv') {
      readFileCSV(readStream);
    }
  },
};
