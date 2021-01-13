const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const axios = require('../../lib/axios');

const configPath = path.resolve(__dirname, '..', '..', '.ezunpaywallrc');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

module.exports = {
  startProcess: async (args) => {
    const opts = args;
    // check date and list
    if (opts.list && opts.startDate) {
      console.log('error: option --startDate is impossible to use with --list');
      process.exit(1);
    }
    if (opts.list && opts.endDate) {
      console.log('error: option --endDate is impossible to use with --list');
      process.exit(1);
    }

    // check files and dates
    if (opts.file && opts.startDate) {
      console.log('error: option --startDate is impossible to use with --file');
      process.exit(1);
    }
    if (opts.file && opts.endDate) {
      console.log('error: option --endDate is impossible to use with --file');
      process.exit(1);
    }

    // check file and list
    if (opts.file && opts.list) {
      console.log('error: option --list is impossible to use with --file');
      process.exit(1);
    }

    // check date and lines limiter
    if (opts.offset && opts.startDate) {
      console.log('error: option --offset is impossible to use with --startDate');
      process.exit(1);
    }
    if (opts.offset && opts.endDate) {
      console.log('error: option --offset is impossible to use with --endDate');
      process.exit(1);
    }
    if (opts.limit && opts.startDate) {
      console.log('error: option --endDate is impossible to use with --limit');
      process.exit(1);
    }
    if (opts.limit && opts.endDate) {
      console.log('error: option --startDate is impossible to use with --limit');
      process.exit(1);
    }

    // check if only endDate
    if (opts.endDate && !opts.startDate) {
      console.log('error: option --endDate is impossible to use without --startDate');
      process.exit(1);
    }

    // check format Date
    const pattern = /^[0-9]*-[0-9]{2}-[0-9]{2}$/;
    if (opts.startDate && !pattern.test(opts.startDate)) {
      console.log('error: startDate are in bad format, expected YYYY-mm-dd');
      process.exit(1);
    }
    if (opts.endDate && !pattern.test(opts.endDate)) {
      console.log('error: endDate are in bad format, expected YYYY-mm-dd');
      process.exit(1);
    }
    if (opts.startDate && opts.endDate) {
      if (new Date(opts.endDate).getTime() < new Date(opts.startDate).getTime()) {
        console.log('error: end date is lower than start date');
        process.exit(1);
      }
    }

    // check if file exist
    if (opts.file) {
      try {
        await axios({
          method: 'GET',
          url: `/download/${opts.file}`,
        });
      } catch (err) {
        if (err?.responses?.status === 404) {
          console.log(`error: file "${opts.file}" doesn't exist`);
          process.exit(1);
        }
        console.log(`error: service unavailable ${config.url}:${config.port}`);
        process.exit(1);
      }
    }
    let snapshots;
    let url = '';
    const query = {};
    if (opts.list) {
      try {
        snapshots = await axios({
          method: 'GET',
          url: '/download',
          params: query,
        });
      } catch (err) {
        console.log(`error: service unavailable ${config.url}:${config.port}`);
        process.exit(1);
      }
      const snapshot = await inquirer.prompt([{
        type: 'list',
        pageSize: 10,
        name: 'files',
        choices: snapshots.data.files,
        message: 'files',
        default: snapshots.data.files.slice(),
        source: (answersSoFar, input) => new Promise((resolve) => {
          const result = snapshots.data.files
            .filter((file) => file.toLowerCase().includes(input.toLowerCase()));
          resolve(result);
        }),
      }]);
      opts.file = snapshot.files;
    }
    if (opts.file) url += `/${opts.file}`;
    if (opts.offset) query.offset = opts.offset;
    if (opts.limit) query.limit = opts.limit;
    if (opts.startDate) query.startDate = opts.startDate;
    if (opts.endDate) query.endDate = opts.endDate;
    let res;
    try {
      res = await axios({
        method: 'post',
        url: `/update${url}`,
        params: query,
      });
    } catch (err) {
      if (err?.response?.status === 409) {
        console.log('info: process in progress');
        process.exit(1);
      }
      console.log(`error: service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    console.log(res.data.message);
  },
};
