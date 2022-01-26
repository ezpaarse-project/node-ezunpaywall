/* eslint-disable no-param-reassign */
const cliProgress = require('cli-progress');

const connection = require('../lib/ezunpaywall');

const logger = require('../lib/logger');

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
      method: 'POST',
      url: `/api/update/state${file ? `/${file}` : ''}`,
      params: {
        latest,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
    logger.error(err);
    process.exit(1);
  }
  return res?.data?.state || res?.data;
};

const verbose = async () => {
  let index = 0;
  let state = await getState('', true);
  let { steps } = state;
  steps.forEach(async (step) => {
    if (step?.percent === 100) {
      createCliProgress(100, step?.task, step?.file);
      console.log();
      index += 1;
    }
  });

  while (!state?.done) {
    state = await getState('', true);
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
          state = await getState('', true);
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
    logger.errorRequest(err);
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
    logger.errorRequest(err);
    process.exit(1);
  }
  return res?.data;
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
    logger.errorRequest(err);
    logger.error(err);
    process.exit(1);
  }

  return res?.data;
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

  const report = await getReport('', { latest: true });

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

module.exports = {
  getState,
  verbose,
  getSnapshots,
  getReport,
  getReports,
  force,
};
