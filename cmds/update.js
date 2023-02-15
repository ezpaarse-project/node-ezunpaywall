/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const { format } = require('date-fns');
const cliProgress = require('cli-progress');

const connection = require('../lib/ezunpaywall');
const { getConfig } = require('../lib/config');
const logger = require('../lib/logger');
const updateLib = require('../lib/update');

const createCliProgress = (percent, task, file) => {
  const bar = new cliProgress.SingleBar({
    format: `progress [{bar}] {percentage}% | {value}/{total} | ${task} - ${file}`,
  });
  bar.start(100, percent);
  return bar;
};

const verbose = async () => {
  let index = 0;
  let state = await updateLib.getLatestState();
  let { steps } = state;
  steps.forEach(async (step) => {
    if (step?.percent === 100) {
      createCliProgress(100, step?.task, step?.file);
      console.log();
      index += 1;
    }
  });

  while (!state?.done) {
    state = await updateLib.getLatestState();
    steps = state.steps;
    steps = steps.filter((x) => x.task !== 'getChangefiles');
    let latestStep = steps[index];

    let bar;
    if (latestStep?.task === 'insert' || latestStep?.task === 'download') {
      bar = createCliProgress(latestStep?.percent, latestStep?.task, latestStep?.file);
    }

    if (latestStep?.status === 'inProgress') {
      while (latestStep?.percent !== 100) {
        if (state?.error) {
          logger.error('process ended by error');
          process.exit(1);
        }
        try {
          state = await updateLib.getLatestState();
        } catch (err) {
          logger.error('Cannot get state');
          logger.error(err);
        }
        steps = state?.steps;
        if (Array.isArray(steps)) {
          steps = steps.filter((x) => x.task !== 'getChangefiles');
          latestStep = steps[index];
          bar.update(Number(latestStep.percent));
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log();
      index += 1;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit(0);
  }
};

const force = async () => {
  const ezunpaywall = await connection();
  let latestSnapshotFromUnpaywall;

  try {
    latestSnapshotFromUnpaywall = await ezunpaywall({
      method: 'GET',
      url: '/api/update/unpaywall/changefiles',
      params: {
        latest: true,
      },
    });
    latestSnapshotFromUnpaywall = latestSnapshotFromUnpaywall?.data;
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  let snapshotsInstalled;

  try {
    snapshotsInstalled = await ezunpaywall({
      method: 'GET',
      url: '/api/update/snapshot',
      params: {
        latest: true,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    process.exit(1);
  }

  if (!snapshotsInstalled?.data) {
    logger.warn('No snapshots are installed in ezunpaywall, it is recommended to install the large snapshot available every 6 months before launching the updates');
    logger.warn('you can force the update with --force');
    process.exit(0);
  }

  const report = await updateLib.getLatestReport();

  if (report) {
    const task = report.steps.filter((x) => x.task === 'insert').pop();
    if (task) {
      if (latestSnapshotFromUnpaywall.filename === task.file && !report.error) {
        logger.info(`No new update available from unpaywall, the last one has already been inserted at "${report.endAt}" with [${task.file}]`);
        logger.info('You can reload it with option --force');
        process.exit(0);
      }
    }
  }
};

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
    if (!/\.gz$/i.test(option.file)) {
      logger.error('Only ".gz" files are accepted');
      process.exit(1);
    }
  }

  if (option.limit && option.offset) {
    if (Number(option.limit) <= Number(option.offset)) {
      logger.error('Limit cannot be lower than offset or 0');
      process.exit(1);
    }
  }

  if (option.list) {
    const snapshots = await updateLib.getSnapshots();
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
        'x-api-key': config.adminPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
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
    logger.error('startDate cannot be in the future');
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
    logger.error('startDate is in wrong format, required YYYY-mm-dd');
    process.exit(1);
  }

  if (option.endDate && !pattern.test(option.endDate)) {
    logger.error('endDate is in wrong format, required YYYY-mm-dd');
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
        'x-api-key': config.adminPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
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

  const data = {};

  if (option.index) data.index = option.index;

  try {
    await ezunpaywall({
      method: 'POST',
      url: '/api/update/job/snapshot',
      data,
      headers: {
        'x-api-key': config.adminPassword,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
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
    const reports = await updateLib.getReports();
    if (!reports.length) {
      logger.info('No reports on ezunpaywall');
      process.exit(0);
    }
    const { files: filename } = await inquirer.prompt([{
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

    report = await updateLib.getReportByFilename(filename);
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (option.file) {
    report = await updateLib.getReportByFilename(option.file);
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (option.latest) {
    report = await updateLib.getLatestReport();
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
    logger.errorRequest(err);
    process.exit(1);
  }

  const status = res?.data?.inUpdate;
  if (!status) {
    logger.info('No update is in progress');
    logger.info('Use ezu update report --latest to see the latest report');
    process.exit(0);
  }

  logger.info('An update is in progress');

  if (option.verbose) {
    await verbose();
  } else {
    const state = await updateLib.getLatestState();
    console.log(JSON.stringify(state, null, 2));
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
