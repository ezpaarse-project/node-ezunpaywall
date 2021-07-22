/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const { connection } = require('../../lib/ezunpaywall');
const { getConfig } = require('../../lib/config');
const logger = require('../../lib/logger');

/**
 * get list of snapshot installed in ezunpaywall
 * @param {object} axios - axios
 * @param {object} config - config
 * @returns {array<string>} array of name of snapshot
 */
const getSnapshots = async () => {
  const ezunpaywall = await connection();

  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/snapshot',
    });
  } catch (err) {
    logger.error(`GET ${ezunpaywall.defaults.baseURL}/api/update/snapshot - ${err}`);
    process.exit(1);
  }
  return res?.data || [];
};

/**
 * Starts an unpaywall data update process
 *
 * @param {string} args.file -f --file <file> - snapshot's file installed on ezunpaywall
 * @param {boolean} args.list -l --list - list of snapshot installed on ezunpaywall
 * @param {string} args.startDate -sd --startDate <starteDate> - start date to download and insert
 * updates from unpaywall
 * @param {string} args.endDate -ed --endDate <endDate> - end date to download
 * and insert updates from unpaywall
 * @param {string} args.offset -of --offset <offset> - line where processing will start
 * @param {string} args.limit -li --limit <limit> - line where processing will end
 * @param {string} args.use -u --use <use> - pathfile of custom config
 */
const update = async (args) => {
  const config = await getConfig(args.use);
  const ezunpaywall = await connection();

  if (args.list) {
    if (args.startDate) {
      logger.error('option --startDate is impossible to use with --list');
      process.exit(1);
    }
    if (args.endDate) {
      logger.error('option --endDate is impossible to use with --list');
      process.exit(1);
    }
    if (args.file) {
      logger.error('option --list is impossible to use with --file');
      process.exit(1);
    }
  }

  // check files and dates
  if (args.file) {
    if (args.startDate) {
      logger.error('option --startDate is impossible to use with --file');
      process.exit(1);
    }
    if (args.endDate) {
      logger.error('option --endDate is impossible to use with --file');
      process.exit(1);
    }
  }

  // check date and lines limiter
  if (args.offset && args.startDate) {
    logger.error('option --offset is impossible to use with --startDate');
    process.exit(1);
  }
  if (args.offset && args.endDate) {
    logger.error('option --offset is impossible to use with --endDate');
    process.exit(1);
  }
  if (args.limit && args.startDate) {
    logger.error('option --endDate is impossible to use with --limit');
    process.exit(1);
  }
  if (args.limit && args.endDate) {
    logger.error('option --startDate is impossible to use with --limit');
    process.exit(1);
  }

  // check if only endDate
  if (args.endDate && !args.startDate) {
    logger.error('option --endDate is impossible to use without --startDate');
    process.exit(1);
  }

  // check format Date
  const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  if (args.startDate && !pattern.test(args.startDate)) {
    logger.error('startDate are in bad format, expected YYYY-mm-dd');
    process.exit(1);
  }
  if (args.endDate && !pattern.test(args.endDate)) {
    logger.error('endDate are in bad format, expected YYYY-mm-dd');
    process.exit(1);
  }
  if (args.startDate && args.endDate) {
    if (new Date(args.endDate).getTime() < new Date(args.startDate).getTime()) {
      logger.error('end date is lower than start date');
      process.exit(1);
    }
  }
  if (new Date(args.startDate).getTime() > Date.now()) {
    logger.error('startDate is in the futur');
    process.exit(1);
  }

  let res;

  if (!args.force) {
    let latestSnapshotFromUnpaywall;

    try {
      latestSnapshotFromUnpaywall = await ezunpaywall({
        method: 'get',
        url: '/api/update/unpaywall/snapshot',
        params: {
          latest: true,
        },
        headers: {
          api_key: config.apikey,
        },
      });
      latestSnapshotFromUnpaywall = latestSnapshotFromUnpaywall?.data;
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/unpaywall/snapshot`);
      logger.error(err);
      process.exit(1);
    }

    let report;
    try {
      report = await ezunpaywall({
        method: 'get',
        url: '/api/update/report',
        params: {
          latest: true,
        },
        headers: {
          api_key: config.apikey,
        },
      });
      report = report?.data?.report;
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/state`);
      logger.error(err);
      process.exit(1);
    }

    const task = report.steps.find((x) => x.task === 'insert');

    if (latestSnapshotFromUnpaywall.filename === task.file && !report.error) {
      logger.info(`No new update available from unpaywall, the last one has already been inserted at "${report.endAt}" with [${task.file}]`);
      logger.info('You can reload it with args --force');
      process.exit(0);
    }
  }

  if (args.status) {
    try {
      res = await ezunpaywall({
        method: 'get',
        url: '/api/update/state',
        headers: {
          api_key: config.apikey,
        },
      });
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/state`);
      logger.error(err);
      process.exit(1);
    }
    console.log(JSON.stringify(res?.data, null, 2));
    logger.info('latest state');
    process.exit(0);
  }

  const data = {};

  if (args.list) {
    const snapshots = await getSnapshots();
    if (!snapshots.length) {
      logger.info('No snapshots on ezunpaywall');
      process.exit(0);
    }
    const snapshot = await inquirer.prompt([{
      type: 'list',
      pageSize: 5,
      name: 'files',
      choices: snapshots,
      message: 'files',
      default: snapshots.slice(),
      source: (answersSoFar, input) => new Promise((resolve) => {
        const result = snapshots.files
          .filter((file) => file.toLowerCase().includes(input.toLowerCase()));
        resolve(result);
      }),
    }]);
    args.file = snapshot.files;
  }

  if (args.file) data.filename = args.file;
  if (args.offset) data.offset = args.offset;
  if (args.limit) data.limit = args.limit;
  if (args.startDate) data.startDate = args.startDate;
  if (args.endDate) data.endDate = args.endDate;
  if (args.index) data.index = args.index;

  try {
    res = await ezunpaywall({
      method: 'post',
      url: '/api/update/job',
      data,
      headers: {
        'X-API-KEY': config.apikey,
      },
    });
  } catch (err) {
    if (err?.response?.status === 409) {
      logger.warn(`POST ${ezunpaywall.defaults.baseURL}/api/update/job - update in progress 409`);
      process.exit(1);
    }
    logger.error(`POST ${ezunpaywall.defaults.baseURL}/api/update/job - ${err}`);
    process.exit(1);
  }
  logger.info(res.data.message);
};

module.exports = {
  update,
};
