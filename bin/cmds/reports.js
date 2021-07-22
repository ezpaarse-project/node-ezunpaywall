const inquirer = require('inquirer');

const { connection } = require('../../lib/ezunpaywall');
const { getConfig } = require('../../lib/config');
const logger = require('../../lib/logger');

/**
 * get list of report in ezunpaywall
 * @param {Stringng} ezunpaywall - ezunpaywallURL
 * @returns {array<string>} array of name of report
 */
const getReports = async (ezunpaywall) => {
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/report',
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/update/snapshot - ${err}`);
    process.exit(1);
  }

  return res?.data;
};

/**
 * get the content of report
 *
 * @param {string} args.file -f --file - report file installed on ezunpaywall
 * @param {boolean} args.list -l --list - list of reports generated by ezunpaywall
 * @param {boolean} args.latest -la --latest [latest]
 * @param {string} args.status -s --status <status> - status of report,
 * success and error only accepted
 * @param {boolean} args.use -u --use <use> - pathfile of custom config
 */
const report = async (args) => {
  const config = await getConfig(args.use);
  const ezunpaywall = await connection();

  // check list and latest, file,
  if (args.list && args.latest) {
    logger.error('option --latest is impossible to use with --list');
    process.exit(1);
  }
  if (args.list && args.file) {
    logger.error('option --file is impossible to use with --list');
    process.exit(1);
  }

  // check file and latest, status
  if (args.file && args.latest) {
    logger.error('option --latest is impossible to use with --file');
    process.exit(1);
  }
  if (args.file && args.status) {
    logger.error('option --status is impossible to use with --file');
    process.exit(1);
  }
  if (args.status) {
    if (args.status !== 'error' && args.status !== 'success') {
      logger.error('option --status only use <error> or <success>');
      process.exit(1);
    }
  }

  let res1;
  let url = '';
  let query = {};

  if (!args.status && !args.latest) query = null;
  if (args.status) query.status = args.status;

  if (args.list) {
    const reports = await getReports(ezunpaywall);
    if (!reports?.length) {
      logger.info('no reports available');
      process.exit(0);
    }
    const oneReport = await inquirer.prompt([{
      type: 'list',
      pageSize: 5,
      name: 'files',
      choices: reports,
      message: 'files',
      default: reports.slice(),
      source: (answersSoFar, input) => new Promise((resolve) => {
        const result = reports?.data
          .filter((file) => file.toLowerCase().includes(input.toLowerCase()));
        resolve(result);
      }),
    }]);
    args.file = oneReport.files;
  }

  if (args.file) url += `/${args.file}`;
  if (args.latest) query.latest = args.latest;

  try {
    res1 = await ezunpaywall({
      method: 'get',
      url: `/api/update/report${url}`,
      params: query,
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/update/report${url} - ${err} ${err?.response?.status}`);
    process.exit(1);
  }
  console.log(JSON.stringify(res1.data?.report, null, 2));
  process.exit(0);
};

module.exports = {
  report,
};
