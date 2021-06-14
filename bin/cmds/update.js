/* eslint-disable no-param-reassign */
const inquirer = require('inquirer');
const { connection } = require('../../lib/axios');
const { getConfig } = require('../../lib/config');

const getFiles = async (axios, config) => {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: '/update/snapshot',
    });
  } catch (err) {
    console.error(`service unavailable ${config.url}:${config.port}`);
    process.exit(1);
  }
  return res?.data;
};

/**
 * Starts an unpaywall data update process
 * @param {Object} args commander arguments
 * @param -f --file <file> - snapshot\'s file installed on ezunpaywall
 * @param -l --list - list of snapshot installed on ezunpaywall
 * @param -sd --startDate <starteDate> - start date to download and insert updates from unpaywall
 * @param -ed --endDate <endDate> - end date to download and insert updates from unpaywall
 * @param -of --offset <offset> - line where processing will start
 * @param -li --limit <limit> - line where processing will end
 * @param -u --use <use> - use a custom config
 */
const update = async (args) => {
  const axios = await connection(args.use);
  const config = await getConfig(args.use);
  // check date and list
  if (args.list) {
    if (args.startDate) {
      console.error('option --startDate is impossible to use with --list');
      process.exit(1);
    }
    if (args.endDate) {
      console.error('option --endDate is impossible to use with --list');
      process.exit(1);
    }
    if (args.file) {
      console.error('option --list is impossible to use with --file');
      process.exit(1);
    }
  }

  // check files and dates
  if (args.file) {
    if (args.startDate) {
      console.error('option --startDate is impossible to use with --file');
      process.exit(1);
    }
    if (args.endDate) {
      console.error('option --endDate is impossible to use with --file');
      process.exit(1);
    }
  }

  // check date and lines limiter
  if (args.offset && args.startDate) {
    console.error('option --offset is impossible to use with --startDate');
    process.exit(1);
  }
  if (args.offset && args.endDate) {
    console.error('option --offset is impossible to use with --endDate');
    process.exit(1);
  }
  if (args.limit && args.startDate) {
    console.error('option --endDate is impossible to use with --limit');
    process.exit(1);
  }
  if (args.limit && args.endDate) {
    console.error('option --startDate is impossible to use with --limit');
    process.exit(1);
  }

  // check if only endDate
  if (args.endDate && !args.startDate) {
    console.error('option --endDate is impossible to use without --startDate');
    process.exit(1);
  }

  // check format Date
  const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  if (args.startDate && !pattern.test(args.startDate)) {
    console.error('startDate are in bad format, expected YYYY-mm-dd');
    process.exit(1);
  }
  if (args.endDate && !pattern.test(args.endDate)) {
    console.error('endDate are in bad format, expected YYYY-mm-dd');
    process.exit(1);
  }
  if (args.startDate && args.endDate) {
    if (new Date(args.endDate).getTime() < new Date(args.startDate).getTime()) {
      console.error('end date is lower than start date');
      process.exit(1);
    }
  }
  if (new Date(args.startDate).getTime() > Date.now()) {
    console.error('startDate is in the futur');
    process.exit(1);
  }

  let url = '';
  const query = {};

  if (args.list) {
    const snapshots = await getFiles(axios, config);
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

  if (args.file) url += `/${args.file}`;
  if (args.offset) query.offset = args.offset;
  if (args.limit) query.limit = args.limit;
  if (args.startDate) query.startDate = args.startDate;
  if (args.endDate) query.endDate = args.endDate;
  if (args.index) query.index = args.index;
  let res;
  try {
    res = await axios({
      method: 'post',
      url: `/update${url}`,
      params: query,
      headers: {
        api_key: config.apikey,
      },
    });
  } catch (err) {
    if (err?.response?.status === 409) {
      console.log('process in progress');
      process.exit(1);
    }
    console.error(`service unavailable ${config.url}:${config.port}`);
    process.exit(1);
  }
  console.log(res.data.message);
};

module.exports = {
  update,
};
