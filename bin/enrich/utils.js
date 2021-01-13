const fs = require('fs-extra');
const path = require('path');
const axios = require('../../lib/axios');

const configPath = path.resolve(__dirname, '..', '..', '.ezunpaywallrc');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

/**
 * fetch ez-unpaywall with array of dois and fetchAttributes
 * @param {*} tab array of line that we will enrich
 * @param {*} fetchAttributes attributes that we will enrich
 */
const fetchEzUnpaywall = async (tab, fetchAttributes) => {
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
        query: `query ($dois: [ID!]!) {getDataUPW(dois: $dois) { doi, ${fetchAttributes.toString()} }}`,
        variables: {
          dois,
        },
      },
    });
  } catch (err) {
    console.log(`error: service unavailable ${config.url}:${config.port}`);
    process.exit(1);
  }
  // TODO verif
  return response.data.data.getDataUPW;
};

module.exports = {
  fetchEzUnpaywall,
};
