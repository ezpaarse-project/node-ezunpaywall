/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const Papa = require('papaparse');
const get = require('lodash.get');
const axios = require('../../lib/axios');

let enricherAttributes = [
  'oa_locations.evidence',
  'oa_locations.host_type',
  'oa_locations.is_best',
  'oa_locations.license',
  'oa_locations.pmh_id',
  'oa_locations.updated',
  'oa_locations.url',
  'oa_locations.url_for_landing_page',
  'oa_locations.url_for_pdf',
  'oa_locations.version',
  'best_oa_location.evidence',
  'best_oa_location.host_type',
  'best_oa_location.is_best',
  'best_oa_location.license',
  'best_oa_location.pmh_id',
  'best_oa_location.updated',
  'best_oa_location.url',
  'best_oa_location.url_for_landing_page',
  'best_oa_location.url_for_pdf',
  'best_oa_location.version',
  'z_authors.family',
  'z_authors.given',
  'z_authors.sequence',
  'data_standard',
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

const fetchAttributes = [];

let headers = [];

const getExtensionOfFile = (file) => {
  const basename = file.split(/[\\/]/).pop();
  const pos = basename.lastIndexOf('.');
  if (basename === '' || pos < 1) {
    return '';
  }
  return basename.slice(pos + 1);
};

/**
 * fetch ez-unpaywall with array of dois and fetchAttributes
 * @param {*} tab array of line that we will enrich
 * @param {*} fetchAttributes attributes that we will enrich
 */
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
        query: `query ($dois: [ID!]!) {getDatasUPW(dois: $dois) { doi, ${fetchAttributes.toString()} }}`,
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

/**
 * @param {*} tab array of line that we will enrich
 * @param {*} response response from ez-unpaywall
 */
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
    enricherAttributes.forEach((attr) => {
      // if complex attribute (like best_oa_location.url)
      if (attr.includes('.')) {
        let enrich;
        const str = attr.split('.');
        // array attributes
        if (Array.isArray(data[str[0]])) {
          const arrayAttributes = [];
          // TODO use map
          data[str[0]].forEach((a) => {
            arrayAttributes.push(a[str[1]]);
          });
          enrich = arrayAttributes.join(',');
        } else {
          enrich = get(data, str, 0, str, 1);
        }
        el[attr] = enrich;
        return;
      }
      // simple attributes
      el[attr] = data[attr];
    });
  });
};

/**
 * write the array of line enriched in a out file JSON
 * @param {*} tab array of line enriched
 */
const writeInFileJSON = async (tab) => {
  try {
    const stringTab = tab.map((el) => JSON.stringify(el)).join('\n');
    await fs.appendFile('out.json', stringTab);
  } catch (err) {
    console.error(err);
  }
};

/**
 * starts the enrichment process for files JSON
 * @param {*} readStream read the stream of the file you want to enrich
 */
const enrichmentFileJSON = async (readStream) => {
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

/**
 * write the array of line enriched in a out file CSV
 * @param {*} tab array of line enriched
 */
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

/**
 * enrich the header with enricherAttributes
 * @param {*} header header will be enrich
 */
const enricherHeaderCSV = async (header) => {
  // delete attributes already in header
  await header.forEach((el) => {
    if (enricherAttributes.includes(el)) {
      const index = enricherAttributes.indexOf(el);
      enricherAttributes.splice(index, 1);
    }
  });
  // enricher header
  return header.concat(enricherAttributes);
};

/**
 * first writing on CSV file: the header enriched
 * @param {*} header header enriched
 */
const writeHeaderCSV = async (header) => {
  try {
    // TODO passé par un stream d'écriture writeFileStream
    await fs.appendFile('out.csv', `${header}\r\n`);
  } catch (err) {
    console.log('error: write stream bug');
    process.exit(1);
  }
};

/**
 * starts the enrichment process for files CSV
 * @param {*} readStream read the stream of the file you want to enrich
 */
const enrichmentFileCSV = (readStream) => {
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

/**
 * parse the complexes attributes so that they can be used in the graphql query
 * @param {*} name name of param
 * @param {*} attribute attributes of param
 */
const stringifyAttributes = (name, attributes) => {
  let res;
  if (attributes.length !== 0) {
    res = attributes.join(',');
  }
  res = `${name}{${res}}`;
  return res;
};

/**
 * parse the attributes so that they can be used in the graphql query
 */
const createFetchAttributes = () => {
  let best_oa_location = [];
  let oa_locations = [];
  let z_authors = [];
  enricherAttributes.forEach((attr) => {
    // complexe attributes (like best_oa_location.license)
    if (attr.includes('.')) {
      const str = attr.split('.');
      if (str[0] === 'best_oa_location') {
        best_oa_location.push(str[1]);
        return;
      }
      if (str[0] === 'oa_locations') {
        oa_locations.push(str[1]);
        return;
      }
      if (str[0] === 'z_authors') {
        z_authors.push(str[1]);
        return;
      }
    }
    // simple attributes (like is_oa)
    fetchAttributes.push(attr);
  });

  if (best_oa_location.length !== 0) {
    best_oa_location = stringifyAttributes('best_oa_location', best_oa_location);
    fetchAttributes.push(best_oa_location);
  }
  if (oa_locations.length !== 0) {
    oa_locations = stringifyAttributes('oa_locations', oa_locations);
    fetchAttributes.push(oa_locations);
  }
  if (z_authors.length !== 0) {
    z_authors = stringifyAttributes('z_authors', z_authors);
    fetchAttributes.push(z_authors);
  }
};

/**
 * checks if the attributes entered by the command are related to the unpaywall data model
 * @param {*} attributes array of attributes
 */
const checkAttributes = (attributes) => {
  if (!attributes?.length) {
    createFetchAttributes();
    return;
  }
  attributes.forEach((attr) => {
    if (!enricherAttributes.includes(attr)) {
      console.log(`error: attribut ${attr} doesn't on unpaywall data`);
      process.exit(1);
    }
  });
  enricherAttributes = attributes;
  createFetchAttributes();
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
    if (getExtensionOfFile(file) === 'jsonl') {
      enrichmentFileJSON(readStream);
    }
    if (getExtensionOfFile(file) === 'csv') {
      enrichmentFileCSV(readStream);
    }
  },
};
