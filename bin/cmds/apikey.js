const fs = require('fs-extra');
const path = require('path');

const logger = require('../../lib/logger');
const { connection } = require('../../lib/ezunpaywall');
const { getConfig } = require('../../lib/config');

const unpaywallAttrs = [
  '*',
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
  'best_oa_location.evidence',
  'best_oa_location.host_type',
  'best_oa_location.is_best',
  'best_oa_location.license',
  'best_oa_location.oa_date',
  'best_oa_location.pmh_id',
  'best_oa_location.updated',
  'best_oa_location.url',
  'best_oa_location.url_for_landing_page',
  'best_oa_location.url_for_pdf',
  'best_oa_location.version',
  'oa_locations.evidence',
  'oa_locations.host_type',
  'oa_locations.is_best',
  'oa_locations.license',
  'oa_locations.oa_date',
  'oa_locations.pmh_id',
  'oa_locations.updated',
  'oa_locations.url',
  'oa_locations.url_for_landing_page',
  'oa_locations.url_for_pdf',
  'oa_locations.version',
  'first_oa_location.evidence',
  'first_oa_location.host_type',
  'first_oa_location.is_best',
  'first_oa_location.license',
  'first_oa_location.oa_date',
  'first_oa_location.pmh_id',
  'first_oa_location.updated',
  'first_oa_location.url',
  'first_oa_location.url_for_landing_page',
  'first_oa_location.url_for_pdf',
  'first_oa_location.version',
  'z_authors.family',
  'z_authors.given',
  'z_authors.ORCID',
  'z_authors.authentificated-orcid',
  'z_authors.affiliation',
];

/**
 * manage apikey in apikey service
 *
 * @param {string} options.keyname
 * @param {string} options.access
 * @param {string} options.attributes
 * @param {string} options.allowed
 * @param {string} options.apikey
 * @param {string} options.all
 */
const manageApiKey = async (command, options) => {
  const config = await getConfig(options.use);
  const ezunpaywall = await connection();

  if (command === 'create') {
    if (!options.keyname) {
      logger.error('name expected');
      process.exit(1);
    }

    let access;
    if (options.access) {
      const availableAccess = ['update', 'enrich', 'graphql', 'apikey'];
      access = options.access.split(',');
      access.forEach((e) => {
        if (!availableAccess.includes(e)) {
          logger.error(`argument "access" [${e}] doesn't exist`);
          process.exit(1);
        }
      });
    }

    if (options.attributes) {
      const attrs = options.attributes.split(',');
      attrs.forEach((attr) => {
        if (!unpaywallAttrs.includes(attr)) {
          logger.error(`argument "attributes" [${attr}] doesn't exist`);
          process.exit(1);
        }
      });
    }

    let allowed;

    if (options.allowed) {
      if (options.allowed !== 'true' && options.allowed !== 'false') {
        logger.error(`argument "allowed" [${options.allowed}] is in bad format`);
        process.exit(1);
      }
    }

    if (options.allowed === 'true') allowed = true;
    if (options.allowed === 'false') allowed = false;

    const configApiKey = {
      name: options.keyname,
      access,
      attributes: options.attributes,
      allowed,
    };

    if (!configApiKey?.access) configApiKey.access = ['graphql'];
    if (!configApiKey?.attributes) configApiKey.attributes = '*';
    if (!configApiKey?.allowed) configApiKey.allowed = true;

    let res;

    try {
      res = await ezunpaywall({
        method: 'POST',
        url: '/api/apikey/create',
        responseType: 'json',
        data: configApiKey,
        headers: {
          'redis-password': config.redisPassword,
        },
      });
    } catch (err) {
      if (err.response.status === 403) {
        logger.error(`[${options.keyname}] already exist`);
        process.exit(1);
      }
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/apikey/create`);
      logger.error(err);
      process.exit(1);
    }

    console.log(JSON.stringify(res?.data, null, 2));
    process.exit(0);
  }

  if (command === 'update') {
    if (!options.apikey) {
      logger.error('apikey expected');
      process.exit(1);
    }

    let access;
    if (options.access) {
      const availableAccess = ['update', 'enrich', 'graphql', 'apikey'];
      access = options.access.split(',');
      access.forEach((e) => {
        if (!availableAccess.includes(e)) {
          logger.error(`argument "access" [${e}] doesn't exist`);
          process.exit(1);
        }
      });
    }

    if (options.attributes) {
      const attrs = options.attributes.split(',');
      attrs.forEach((attr) => {
        if (!unpaywallAttrs.includes(attr)) {
          logger.error(`argument "attributes" [${attr}] doesn't exist`);
          process.exit(1);
        }
      });
    }

    let allowed;
    if (options.allowed) {
      if (options.allowed !== 'true' && options.allowed !== 'false') {
        logger.error(`argument "allowed" [${options.allowed}] is in bad format`);
        process.exit(1);
      }
    }

    if (options.allowed === 'true') allowed = true;
    if (options.allowed === 'false') allowed = false;

    let res;

    try {
      res = await ezunpaywall({
        method: 'GET',
        url: '/api/apikey/config',
        responseType: 'json',
        headers: {
          'x-api-key': options.apikey,
        },
      });
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/apikey/config`);
      logger.error(err);
      process.exit(1);
    }

    const configApiKey = res.data;

    if (options.keyname) configApiKey.name = options.keyname;
    if (access) configApiKey.access = access;
    if (options.attributes) configApiKey.attributes = options.attributes;
    if (options.allowed) configApiKey.allowed = allowed;

    try {
      res = await ezunpaywall({
        method: 'PUT',
        url: '/api/apikey/update',
        responseType: 'json',
        data: {
          apikey: options.apikey,
          config: configApiKey,
        },
        headers: {
          'redis-password': config.redisPassword,
        },
      });
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/apikey/config`);
      logger.error(err);
      process.exit(1);
    }

    console.log(JSON.stringify(res?.data, null, 2));
    process.exit(0);
  }

  if (command === 'delete') {
    if (!options.apikey) {
      logger.error('apikey expected');
      process.exit(1);
    }

    try {
      await ezunpaywall({
        method: 'DELETE',
        url: '/api/apikey/delete',
        responseType: 'json',
        data: {
          apikey: options.apikey,
        },
        headers: {
          'redis-password': config.redisPassword,
        },
      });
    } catch (err) {
      if (err.response.status === 404) {
        logger.error(`[${options.apikey}] apikey doesn't exist`);
        process.exit(1);
      }
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/apikey/delete`);
      logger.error(err);
      process.exit(1);
    }
    logger.info(`apikey [${options.apikey}] is deleted successfully`);
    process.exit(0);
  }

  if (command === 'get') {
    if (options.all) {
      let res;

      try {
        res = await ezunpaywall({
          method: 'GET',
          url: '/api/apikey/all',
          responseType: 'json',
          headers: {
            'redis-password': config.redisPassword,
          },
        });
      } catch (err) {
        logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/apikey/all`);
        logger.error(err);
        process.exit(1);
      }

      console.log(JSON.stringify(res?.data?.keys, null, 2));
      process.exit(0);
    }

    if (options.apikey) {
      let res;

      try {
        res = await ezunpaywall({
          method: 'GET',
          url: '/api/apikey/config',
          responseType: 'json',
          headers: {
            'x-api-key': options.apikey,
          },
        });
      } catch (err) {
        if (err.response.status === 404) {
          logger.error(`[${options.apikey}] apikey doesn't exist`);
          process.exit(1);
        }
        logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/apikey/all`);
        logger.error(err);
        process.exit(1);
      }

      console.log(JSON.stringify(res?.data, null, 2));
      process.exit(0);
    }

    logger.error('use --all or --apikey <apikey> to get config');
    process.exit(1);
  }
  logger.error(`command [${command}] doesn't exist`);
  process.exit(1);
};

module.exports = manageApiKey;
