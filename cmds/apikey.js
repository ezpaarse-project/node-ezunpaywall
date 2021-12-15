const joi = require('joi');

const logger = require('../lib/logger');

const connection = require('../lib/ezunpaywall');
const { getConfig } = require('../lib/config');

const availableAccess = ['update', 'enrich', 'graphql'];

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
 * Create apikey
 *
 * @param {String} option.keyname --keyname <keyname>, name of apikey
 * @param {String} option.access --access <access>, name of access services of apikey
 * seperated by a coma. By default it set at ['graphql']
 * @param {String} option.attributes --attributes <attributes>, unpaywall attributes seperated
 * of apikey seperated by a coma. By default it set at '*'
 * @param {Boolean} option.allowed --allowed , indicates if the key is authorized or not.
 * "true" or "false" only. By default it set at true
 */
const apiKeyCreate = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  const options = {
    name: option?.keyname,
    attributes: option?.attributes?.split(','),
    access: option?.access?.split(','),
    allowed: option?.allowed,
  };

  const { error, value } = joi.object({
    name: joi.string().trim().required(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql']),
    allowed: joi.string().default('true'),
  }).validate(options);

  if (error) {
    logger.error(error.details[0].message);
    process.exit(1);
  }

  let res;

  try {
    res = await ezunpaywall({
      method: 'POST',
      url: '/api/apikey/create',
      responseType: 'json',
      data: value,
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  console.log(JSON.stringify(res?.data, null, 2));
  process.exit(0);
};

/**
 * update apikey
 *
 * @param {String} option.apikey --apikey <apikey> | apikey
 * @param {String} option.keyname --keyname <keyname> | name of apikey
 * @param {String} option.access --access <access> | name of access services of apikey
 * seperated by comma.
 * @param {String} option.attributes --attributes <apikey> | unpaywall attributes
 * seperated apikey seperated by comma.
 * @param {Boolean} option.allowed --allowed <allowed> | iindicates if the key
 * is authorized or not. "true" or "false" only
 */
const apiKeyUpdate = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  const options = {
    apikey: option.apikey,
    name: option?.keyname,
    attributes: option?.attributes?.split(','),
    access: option?.access?.split(','),
    allowed: option?.allowed,
  };

  const { error, value } = joi.object({
    apikey: joi.string().required(),
    name: joi.string().trim(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql', 'enrich']),
    allowed: joi.boolean().default(true),
  }).validate(options);

  if (error) {
    logger.error(error.details[0].message);
    process.exit(1);
  }

  let res;

  try {
    res = await ezunpaywall({
      method: 'PUT',
      url: '/api/apikey/update',
      responseType: 'json',
      data: value,
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  console.log(JSON.stringify(res?.data, null, 2));
  process.exit(0);
};

/**
 * Delete apikey
 *
 * @param {String} option.apikey --apikey <apikey> | apikey
 */
const apiKeyDelete = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  const { error, value } = joi.string().required().validate(option.apikey);

  if (error) {
    logger.error(error.details[0].message);
    process.exit(1);
  }

  try {
    await ezunpaywall({
      method: 'DELETE',
      url: `/api/apikey/delete/${value}`,
      responseType: 'json',
      headers: {
        'redis-password': config.redisPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }
  logger.info(`apikey [${option.apikey}] is deleted successfully`);
  process.exit(0);
};

/**
 * get informations about one or all apikey
 *
 * @param {Boolean} option.all --all | get all informations about all apikey
 * @param {String} option.apikey --apikey <apikey> | get informations about this apikey
 */
const apiKeyGet = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  if (option.all) {
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
      logger.errorRequest(err);
      process.exit(1);
    }

    console.log(JSON.stringify(res?.data, null, 2));
    process.exit(0);
  }

  if (option.apikey) {
    let res;

    try {
      res = await ezunpaywall({
        method: 'GET',
        url: `/api/apikey/config/${option.apikey}`,
        responseType: 'json',
      });
    } catch (err) {
      logger.errorRequest(err);
      process.exit(1);
    }

    console.log(JSON.stringify(res?.data, null, 2));
    process.exit(0);
  }

  logger.error('use --all or --apikey <apikey> to get config');
  process.exit(1);
};

module.exports = {
  apiKeyCreate,
  apiKeyUpdate,
  apiKeyDelete,
  apiKeyGet,
};
