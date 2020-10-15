/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const get = require('lodash.get');

const { fetchEzUnpaywall } = require('./enricher');

let enricherAttributesJSON = [
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
  enricherAttributesJSON.forEach((attr) => {
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
const checkAttributesJSON = (attributes) => {
  if (!attributes?.length) {
    createFetchAttributes();
    return;
  }
  attributes.forEach((attr) => {
    if (!enricherAttributesJSON.includes(attr)) {
      console.log(`error: attribut ${attr} doesn't on unpaywall data`);
      process.exit(1);
    }
  });
  enricherAttributesJSON = attributes;
  createFetchAttributes();
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
    el = Object.assign(el, data);
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
      const response = await fetchEzUnpaywall(tab, fetchAttributes);
      enricherTab(tab, response);
      await writeInFileJSON(tab);
      tab = [];
    }
  }
  // last insertion
  if (tab.length !== 0) {
    const response = await fetchEzUnpaywall(tab, fetchAttributes);
    enricherTab(tab, response);
    await writeInFileJSON(tab);
  }
};

module.exports = {
  enrichmentFileJSON,
  checkAttributesJSON,
};
