/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const cliProgress = require('cli-progress');
const { connection } = require('../../lib/ezunpaywall');
const { getConfig } = require('../../lib/config');
const logger = require('../../lib/logger');

const createCliProgress = (percent, task, file) => {
  const bar = new cliProgress.SingleBar({
    format: `progress [{bar}] {percentage}% | {value}/{total} | ${task} - ${file}`,
  });
  bar.start(100, percent);
  return bar;
};

/**
 * get list of states in ezunpaywall
 * @returns {array<String>} array of name of snapshot
 */
const getState = async (file, latest) => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      params: {
        latest,
      },
      url: `/api/update/state${file ? `/${file}` : ''}`,
    });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/state`);
    logger.error(err);
    process.exit(1);
  }
  return res?.data?.state || res?.data;
};

const verbose = async () => {
  let index = 0;
  let state;
  state = await getState('', true);
  let { steps } = state;
  steps.forEach(async (step) => {
    if (step?.percent === 100) {
      createCliProgress(100, step?.task, step?.file);
      console.log('\r');
      index += 1;
    }
  });

  while (!state?.done) {
    state = await getState('', true);
    steps = state.steps;
    steps = steps.filter((x) => x.task !== 'askUnpaywall');
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
          state = await getState('', true);
        } catch (err) {
          logger.error('Cannot get state');
          logger.error(err);
        }
        steps = state?.steps;
        if (Array.isArray(steps)) {
          steps = steps.filter((x) => x.task !== 'askUnpaywall');
          latestStep = steps[index];
          bar.update(Number(latestStep.percent));
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log('\r');
      index += 1;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit(0);
  }
};

/**
 * get list of snapshot installed in ezunpaywall
 * @returns {array<String>} array of name of snapshot
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
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/snapshot`);
    logger.error(err);
    process.exit(1);
  }
  return res?.data || [];
};

/**
 *
 */
const getReport = async (filename, query) => {
  const ezunpaywall = await connection();
  let res;
  try {
    res = await ezunpaywall({
      method: 'GET',
      url: `/api/update/report/${filename}`,
      params: query,
    });
  } catch (err) {
    if (err?.response?.status === 404) {
      logger.warn(`Report ${filename ? `${filename}.json ` : ''}doesn't exist, use --force to force update`);
      process.exit(0);
    }
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/report${filename ? `/${filename}` : ''}`);
    logger.error(err);
    process.exit(1);
  }
  return res?.data?.report;
};

/**
 * get list of report in ezunpaywall
 * @returns {array<String>} array of name of snapshot
 */
const getReports = async () => {
  const ezunpaywall = await connection();
  let res;

  const allowNotFound = (status) => ((status >= 200 && status < 300) || status === 404);

  try {
    res = await ezunpaywall({
      method: 'GET',
      url: '/api/update/report',
      validateStatus: allowNotFound,
    });
  } catch (err) {
    if (err?.response?.status === 404) {
      logger.warn('No report available');
      process.exit(0);
    }
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/report`);
    logger.error(err);
    process.exit(1);
  }

  return res?.data;
};

/**
 * Starts an unpaywall data update process
 *
 * @param {String} option.file --file <file> | snapshot's file installed on ezunpaywall
 * @param {String} option.startDate --startDate <starteDate> | start date to download and insert
 * updates from unpaywall
 * @param {String} option.endDate --endDate <endDate> | end date to download
 * and insert updates from unpaywall
 * @param {String} option.offset --offset <offset> | line where processing will start
 * @param {String} option.limit --limit <limit> | line where processing will end
 * @param {String} option.interval --interval <interval> | interval of update (day or week)
 * @param {Boolean} option.list -L --list | list of snapshots installed on ezunpaywall
 * @param {Boolean} option.index -I --index | name of the index to which the data is inserted
 */
const updateJob = async (option) => {
  const config = await getConfig(option.use);
  const ezunpaywall = await connection();

  if (option.interval) {
    const intervals = ['week', 'day'];
    if (!intervals.includes(option.interval)) {
      logger.error(`${option.interval} is not accepted, only 'week' and 'day' are accepted`);
      process.exit(1);
    }
  }

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
    let latestSnapshotFromUnpaywall;

    try {
      latestSnapshotFromUnpaywall = await ezunpaywall({
        method: 'get',
        url: '/api/update/unpaywall/snapshot',
        params: {
          latest: true,
        },
      });
      latestSnapshotFromUnpaywall = latestSnapshotFromUnpaywall?.data;
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/unpaywall/snapshot`);
      logger.error(err);
      process.exit(1);
    }

    let snapshotsInstalled;

    try {
      snapshotsInstalled = await ezunpaywall({
        method: 'get',
        url: '/api/update/snapshot',
        params: {
          latest: true,
        },
      });
    } catch (err) {
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/unpaywall/snapshot`);
      logger.error(err);
      process.exit(1);
    }

    if (!snapshotsInstalled?.data) {
      logger.warn('No snapshots are installed in ezunpaywall, it is recommended to install the large snapshot available every 6 months before launching the updates');
      logger.warn('you can force the update with --force');
      process.exit(0);
    }

    const report = await getReport('', { latest: true });

    if (report) {
      const tasks = report.steps.filter((x) => x.task === 'insert');
      const [task] = tasks.reverse();
      if (task) {
        if (latestSnapshotFromUnpaywall.filename === task.file && !report.error) {
          logger.info(`No new update available from unpaywall, the last one has already been inserted at "${report.endAt}" with [${task.file}]`);
          logger.info('You can reload it with option --force');
          process.exit(0);
        }
      }
    }
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

  if (option.file) data.filename = option.file;
  if (option.offset) data.offset = option.offset;
  if (option.limit) data.limit = option.limit;
  if (option.startDate) data.startDate = option.startDate;
  if (option.endDate) data.endDate = option.endDate;
  if (option.index) data.index = option.index;
  if (option.interval) data.interval = option.interval;

  let res;

  try {
    res = await ezunpaywall({
      method: 'post',
      url: '/api/update/job',
      data,
      headers: {
        'x-api-key': config.apikey,
      },
    });
  } catch (err) {
    if (err?.response?.status === 409) {
      logger.warn(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/job - update in progress 409`);
      process.exit(0);
    }
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/job`);
    logger.error(err);
    process.exit(1);
  }
  logger.info(res?.data?.message);

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

  if (option.date) {
    if (new Date(option.date).getTime() > Date.now()) {
      logger.error('startDate cannot be in the futur');
      process.exit(1);
    }
    report = await getReport('', { date: option.date });
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
      method: 'get',
      url: '/api/update/status',
    });
  } catch (err) {
    logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/status`);
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
  updateJob,
  updateReport,
  updateStatus,
};
