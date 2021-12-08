const axios = require('axios');

const { getConfig } = require('./config');

const ezunpaywall = async () => {
  const config = await getConfig();

  const ezupw = axios.create({
    timeout: 3000,
    proxy: false,
    baseURL: config.baseURL,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  ezupw.baseURL = config.baseURL;

  return ezupw;
};

module.exports = ezunpaywall;
