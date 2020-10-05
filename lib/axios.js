const axios = require('axios');

module.exports = axios.create({
  timeout: 30000,
  proxy: false,
  baseURL: `http://${process.env.NODE_EZPAYWALL_URL}:${process.env.NODE_EZPAYWALL_PORT}`,
});
