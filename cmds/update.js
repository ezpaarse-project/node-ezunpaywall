/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const { format } = require('date-fns');
const connection = require('../lib/ezunpaywall');
const { getConfig } = require('../lib/config');
const logger = require('../lib/logger');

const {
  getState,
  verbose,
  getSnapshots,
  getReport,
  getReports,
  force,
} = require('../bin/update');

/**
 * Starts an unpaywall data update process
 *
 * @param {String} option.file --file <file> | snapshot's file installed on ezunpaywall
 * and insert updates from unpaywall
 * @param {String} option.offset --offset <offset> | line where processing will start
 * @param {String} option.limit --limit <limit> | line where processing will end
 * @param {Boolean} option.list -L --list | list of snapshots installed on ezunpaywall
 * @param {Boolean} option.index -I --index | name of the index to which the data is inserted
 */
const updateJobFile = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  if (option.file) {
    const pattern = /^[a-zA-Z0-9_.-]+(.gz)$/;
    if (!pattern.test(option.file)) {
      logger.error('Only ".gz" files are accepted');
      process.exit(1);
    }
  }

  if (option.limit && option.offset) {
    if (Number(option.limit) <= Number(option.offset)) {
      logger.error('Limit cannot be low than offset or 0');
      process.exit(1);
    }
  }

  if (!option.force) {
    await force();
  }

  if (option.list) {
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
    option.file = snapshot.files;
  }

  const data = {};

  if (option.offset) data.offset = option.offset;
  if (option.limit) data.limit = option.limit;
  if (option.index) data.index = option.index;

  try {
    await ezunpaywall({
      method: 'POST',
      url: `/api/update/job/changefile/${option.file}`,
      data,
      headers: {
        'x-api-key': config.apikey,
      },
    });
  } catch (err) {
    logger.errorRequest('POST', err?.response?.config, err?.response?.status);
    process.exit(1);
  }
  logger.info(`Insert "${option.file}"`);

  if (option.verbose) {
    await verbose();
  }
  process.exit(0);
};

/**
 * Starts an unpaywall changefile update period process
 *
 * @param {String} option.startDate --startDate <starteDate> | start date to download and insert
 * updates from unpaywall
 * @param {String} option.endDate --endDate <endDate> | end date to download
 * and insert updates from unpaywall
 * @param {String} option.interval --interval <interval> | interval of update (day or week)
 * @param {Boolean} option.list -L --list | list of snapshots installed on ezunpaywall
 * @param {Boolean} option.index -I --index | name of the index to which the data is inserted
 */
const updateJobPeriod = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  if (option.interval) {
    const intervals = ['week', 'day'];
    if (!intervals.includes(option.interval)) {
      logger.error(`${option.interval} is not accepted, only 'week' and 'day' are accepted`);
      process.exit(1);
    }
  }

  if (new Date(option.startDate).getTime() > Date.now()) {
    logger.error('startDate cannot be in the futur');
    process.exit(1);
  }

  if (option.endDate && !option.startDate) {
    logger.error('startDate is missing');
    process.exit(1);
  }

  if (option.startDate && option.endDate) {
    if (new Date(option.endDate).getTime() < new Date(option.startDate).getTime()) {
      logger.error('endDate cannot be lower than startDate');
      process.exit(1);
    }
  }

  const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

  if (option.startDate && !pattern.test(option.startDate)) {
    logger.error('startDate are in wrong format, required YYYY-mm-dd');
    process.exit(1);
  }

  if (option.endDate && !pattern.test(option.endDate)) {
    logger.error('endDate are in wrong format, required YYYY-mm-dd');
    process.exit(1);
  }

  if (!option.force) {
    await force();
  }

  const data = {};

  if (option.startDate) data.startDate = option.startDate;
  if (option.endDate) data.endDate = option.endDate;
  if (option.index) data.index = option.index;
  if (option.interval) data.interval = option.interval;

  try {
    await ezunpaywall({
      method: 'POST',
      url: '/api/update/job/period',
      data,
      headers: {
        'x-api-key': config.apikey,
      },
    });
  } catch (err) {
    logger.errorRequest('POST', err?.response?.config, err?.response?.status);
    process.exit(1);
  }

  if (option.interval === 'week' && !option.startDate) {
    const now = Date.now();
    const oneDay = (1 * 24 * 60 * 60 * 1000);
    const dateWeek = format(new Date(now - (8 * oneDay)), 'yyyy-MM-dd');
    logger.info(`Insert "${option.interval ? option.interval : 'day'}" changefiles between "${dateWeek}" and "${option.endDate ? option.endDate : format(new Date(), 'yyyy-MM-dd')}"`);
    process.exit(0);
  }
  logger.info(`Insert "${option.interval ? option.interval : 'day'}" changefiles between "${option.startDate ? option.startDate : format(new Date(), 'yyyy-MM-dd')}" and "${option.endDate ? option.endDate : format(new Date(), 'yyyy-MM-dd')}"`);

  if (option.verbose) {
    await verbose();
  }
  process.exit(0);
};

/**
 * Starts an unpaywall changefile update period process
 *
 * @param {String} option.startDate --startDate <starteDate> | start date to download and insert
 * updates from unpaywall
 * @param {String} option.endDate --endDate <endDate> | end date to download
 * and insert updates from unpaywall
 * @param {String} option.interval --interval <interval> | interval of update (day or week)
 * @param {Boolean} option.list -L --list | list of snapshots installed on ezunpaywall
 * @param {Boolean} option.index -I --index | name of the index to which the data is inserted
 */
const updateJobSnapshot = async (option) => {
  const ezunpaywall = await connection();
  const config = await getConfig();

  if (!option.force) {
    await force();
  }

  const data = {};

  if (option.index) data.index = option.index;

  try {
    await ezunpaywall({
      method: 'POST',
      url: '/api/update/job/period',
      data,
      headers: {
        'x-api-key': config.apikey,
      },
    });
  } catch (err) {
    logger.errorRequest('POST', err?.response?.config, err?.response?.status);
    process.exit(1);
  }
  logger.info('Insert current snapshot');

  if (option.verbose) {
    await verbose();
  }
  process.exit(0);
};

/**
 * get report of update process
 *
 * @param {String} option.file --file <file> | report filename on ezunpaywall
 * @param {Boolean} option.latest --latest | latest report on ezunpaywall
 * @param {String} option.date --date | date of report on ezunpaywall
 * @param {Boolean} option.list -L --list | list of report on ezunpaywall
 */
const updateReport = async (option) => {
  let report;

  if (option.list) {
    const reports = await getReports();
    if (!reports.length) {
      logger.info('No reports on ezunpaywall');
      process.exit(0);
    }
    let filename;
    filename = await inquirer.prompt([{
      type: 'list',
      pageSize: 5,
      name: 'files',
      choices: reports,
      message: 'files',
      default: reports.slice(),
      source: (answersSoFar, input) => new Promise((resolve) => {
        const result = reports.files
          .filter((file) => file.toLowerCase().includes(input.toLowerCase()));
        resolve(result);
      }),
    }]);
    filename = filename.files;

    report = await getReport(filename, {});
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (option.file) {
    report = await getReport(option.file, {});
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (option.latest) {
    report = await getReport('', { latest: true });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }
  process.exit(0);
};

/**
 * get status of update process
 * @param {Boolean} option.verbose --verbose | show loading bar
 *
 */
const updateStatus = async (option) => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/status',
    });
  } catch (err) {
    logger.errorRequest('GET', err?.response?.config, err?.response?.status);
    process.exit(1);
  }

  const status = res?.data?.inUpdate;
  if (!status) {
    logger.info('No update is in progress');
    logger.info('Use ezu update report --latest to see the latest report');
    process.exit(0);
  } else {
    logger.info('An update is being done');
    if (option.verbose) {
      await verbose();
    } else {
      const state = await getState('', true);
      console.log(JSON.stringify(state, null, 2));
      process.exit(0);
    }
  }
  process.exit(0);
};

module.exports = {
  updateJobFile,
  updateJobPeriod,
  updateJobSnapshot,
  updateReport,
  updateStatus,
};
