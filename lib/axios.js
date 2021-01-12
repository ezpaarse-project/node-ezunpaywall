const axios = require('axios');

module.exports = axios.create({
  timeout: 30000,
  proxy: false,
  baseURL: `${process.env.NODE_EZUNPAYWALL_URL}:${process.env.NODE_EZUNPAYWALL_PORT}`,
});
