const axios = require('axios');

module.exports = axios.create({
  timeout: 30000,
  proxy: false,
  baseURL: 'http://localhost:8080/',
});
