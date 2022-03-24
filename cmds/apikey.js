const joi = require('joi');
const fs = require('fs-extra');

const logger = require('../lib/logger');

const apikeyLib = require('../lib/apikey');

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

  const res = await apikeyLib.create(value);

  console.log(JSON.stringify(res, null, 2));
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
  let { apikey } = option;

  const options = {
    name: option?.keyname,
    attributes: option?.attributes?.split(','),
    access: option?.access?.split(','),
    allowed: option?.allowed,
  };

  const checkApikey = joi.string().trim().required().validate(apikey);

  if (checkApikey?.error) {
    logger.error(checkApikey.details[0].message);
    process.exit(1);
  }

  apikey = checkApikey?.value;

  const checkConfig = joi.object({
    name: joi.string().trim(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql', 'enrich']),
    allowed: joi.boolean().default(true),
  }).validate(options);

  if (checkConfig?.error) {
    logger.error(checkConfig?.error.details[0].message);
    process.exit(1);
  }

  const data = checkConfig?.value;

  const res = await apikeyLib.update(apikey, data);

  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
};

/**
 * Delete apikey
 *
 * @param {String} option.apikey --apikey <apikey> | apikey
 */
const apiKeyDelete = async (option) => {
  const { error, value } = joi.string().required().validate(option.apikey);

  if (error) {
    logger.error(error.details[0].message);
    process.exit(1);
  }

  await apikeyLib.del(value);

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
  if (option.all) {
    const res = await apikeyLib.getAll();
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  if (option.apikey) {
    const res = await apikeyLib.get(option.apikey);
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  logger.error('use --all or --apikey <apikey> to get config');
  process.exit(1);
};

/**
 * load apikey with json file
 *
 * @param {String} option.file --file | json file with apikey and config
 */
const apiKeyLoad = async (option) => {
  const { error, value } = joi.string().required().validate(option?.file);

  if (error) {
    logger.error(error.details[0].message);
    process.exit(1);
  }

  const filepath = value;

  let data;
  try {
    const content = await fs.readFile(filepath);
    data = JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.error(`[${filepath}] not found`);
    } else {
      logger.error(err);
    }
    process.exit(1);
  }

  await apikeyLib.load(data);

  logger.info('Your apikey file are loaded successfully');
  process.exit(0);
};

module.exports = {
  apiKeyCreate,
  apiKeyUpdate,
  apiKeyDelete,
  apiKeyGet,
  apiKeyLoad,
};
