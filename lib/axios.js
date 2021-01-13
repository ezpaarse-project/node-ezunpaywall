const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const configPath = path.resolve(__dirname, '..', '.ezunpaywallrc');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

module.exports = axios.create({
  timeout: 30000,
  proxy: false,
  baseURL: `${config.url}:${config.port}`,
});
