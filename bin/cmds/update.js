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
 * @returns {array<string>} array of name of snapshot
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
 * @returns {array<string>} array of name of snapshot
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
 * @param {string} options.file --file <file> - Snapshot's file installed on ezunpaywall
 * @param {boolean} options.list -L --list - List of snapshots installed on ezunpaywall
 * @param {string} options.startDate --startDate <starteDate> - Start date to download and insert
 * updates from unpaywall
 * @param {string} options.endDate -ed --endDate <endDate> - End date to download
 * and insert updates from unpaywall
 * @param {string} options.offset --offset <offset> - Line where processing will start
 * @param {string} options.limit --limit <limit> - Line where processing will end
 * @param {string} options.use -U --use <use> - Filepath of custom config
 */
const update = async (command, options) => {
  const config = await getConfig(options.use);
  const ezunpaywall = await connection();

  if (command === 'job') {
    if (options.interval) {
      const intervals = ['week', 'day'];
      if (!intervals.includes(options.interval)) {
        logger.error(`${options.interval} is not accepted, only 'week' and 'day' are accepted`);
        process.exit(1);
      }
    }

    if (options.file) {
      const pattern = /^[a-zA-Z0-9_.-]+(.gz)$/;
      if (!pattern.test(options.file)) {
        logger.error('Only ".gz" files are accepted');
        process.exit(1);
      }
    }

    if (options.limit && options.offset) {
      if (Number(options.limit) <= Number(options.offset)) {
        logger.error('Limit cannot be low than offset or 0');
        process.exit(1);
      }
    }

    if (new Date(options.startDate).getTime() > Date.now()) {
      logger.error('startDate cannot be in the futur');
      process.exit(1);
    }

    if (options.endDate && !options.startDate) {
      logger.error('startDate is missing');
      process.exit(1);
    }

    if (options.startDate && options.endDate) {
      if (new Date(options.endDate).getTime() < new Date(options.startDate).getTime()) {
        logger.error('endDate cannot be lower than startDate');
        process.exit(1);
      }
    }

    const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

    if (options.startDate && !pattern.test(options.startDate)) {
      logger.error('startDate are in wrong format, required YYYY-mm-dd');
      process.exit(1);
    }

    if (options.endDate && !pattern.test(options.endDate)) {
      logger.error('endDate are in wrong format, required YYYY-mm-dd');
      process.exit(1);
    }

    if (!options.force) {
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
            logger.info('You can reload it with options --force');
            process.exit(0);
          }
        }
      }
    }

    if (options.list) {
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
      options.file = snapshot.files;
    }

    const data = {};

    if (options.file) data.filename = options.file;
    if (options.offset) data.offset = options.offset;
    if (options.limit) data.limit = options.limit;
    if (options.startDate) data.startDate = options.startDate;
    if (options.endDate) data.endDate = options.endDate;
    if (options.index) data.index = options.index;
    if (options.interval) data.interval = options.interval;

    let res;

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
        logger.warn(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/job - update in progress 409`);
        process.exit(0);
      }
      logger.error(`Cannot request ${ezunpaywall.defaults.baseURL}/api/update/job`);
      logger.error(err);
      process.exit(1);
    }
    logger.info(res?.data?.message);

    if (options.verbose) {
      await verbose();
    }
  }

  if (command === 'report') {
    let report;

    if (options.list) {
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

    if (options.file) {
      report = await getReport(options.file, {});
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    }

    if (options.latest) {
      report = await getReport('', { latest: true });
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    }

    if (options.date) {
      if (new Date(options.date).getTime() > Date.now()) {
        logger.error('startDate cannot be in the futur');
        process.exit(1);
      }
      report = await getReport('', { date: options.date });
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    }
  }

  if (command === 'status') {
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
      if (options.verbose) {
        await verbose();
      } else {
        const state = await getState('', true);
        console.log(JSON.stringify(state, null, 2));
        process.exit(0);
      }
    }
  }
};

module.exports = update;
