/* eslint-disable no-restricted-syntax */
const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');

const { URL } = require('url');

chai.use(chaiHttp);

const { Client } = require('@elastic/elasticsearch');
const logger = require('../../lib/logger');

const client = new Client({
  node: {
    url: new URL('http://localhost:9200'),
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
  },
});

/**
 * check if index exit
 * @param {string} name Name of index
 * @returns {boolean} if exist
 */
const checkIfIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    logger.error(`Cannot verify if ${name} index exist`);
    logger.error(err);
    process.exit(1);
  }
  return res.body;
};

/**
 * delete index if it exist
 * @param {string} name Name of index
 */
const deleteIndex = async (name) => {
  const exist = await checkIfIndexExist(name);
  if (exist) {
    try {
      await client.indices.delete({
        index: name,
      });
    } catch (err) {
      logger.error(`Cannot delete index ${name} exist`);
      logger.error(err);
      process.exit(1);
    }
  }
};

/**
 * create index if it doesn't exist
 * @param {string} name Name of index
 * @param {JSON} index index in JSON format
 */
const createIndex = async (name, index) => {
  const exist = await checkIfIndexExist(name);
  if (!exist) {
    try {
      await client.indices.create({
        index: name,
        body: index,
      });
    } catch (err) {
      logger.error(`Cannot create index ${name} exist`);
      logger.error(err);
      process.exit(1);
    }
  }
};

/**
 * count how many documents there are in an index
 * @param {string} name Name of index
 * @returns {number} number of document
 */
const countDocuments = async (name) => {
  const exist = await checkIfIndexExist(name);
  let data;
  if (exist) {
    try {
      data = await client.count({
        index: name,
      });
    } catch (err) {
      logger.error(`Cannot count documents on ${name} index`);
      logger.error(err);
      process.exit(1);
    }
  }
  return data.body.count ? data.body.count : 0;
};

const insertDataUnpaywall = async () => {
  const filepath = path.resolve(__dirname, '..', 'sources', 'data', 'fake1.jsonl');
  let readStream;
  try {
    readStream = await fs.createReadStream(filepath);
  } catch (err) {
    logger.error(`Cannot readstream ${filepath}`);
    logger.error(err);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  const data = [];

  for await (const line of rl) {
    data.push(JSON.parse(line));
  }

  const body = data.flatMap((doc) => [{ index: { _index: 'unpaywall-test', _id: doc.doi } }, doc]);

  try {
    await client.bulk({ refresh: true, body });
  } catch (err) {
    logger.error('Cannot bulk');
    logger.error(err);
    process.exit(1);
  }
};

module.exports = {
  createIndex,
  deleteIndex,
  countDocuments,
  checkIfIndexExist,
  insertDataUnpaywall,
  client,
};
