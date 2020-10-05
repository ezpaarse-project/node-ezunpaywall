const inquirer = require('inquirer');
const axios = require('../../lib/axios');
const logger = require('../../lib/logger');

module.exports = {
  getReports: async (args) => {
    const opts = args;
    // check list and latest, file,
    if (opts.list && opts.latest) {
      console.log('error: option --latest is impossible to use with --list');
      process.exit(1);
    }
    if (opts.list && opts.file) {
      console.log('error: option --file is impossible to use with --list');
      process.exit(1);
    }
    // check file and latest, status
    if (opts.file && opts.latest) {
      console.log('error: option --latest is impossible to use with --file');
      process.exit(1);
    }
    if (opts.file && opts.status) {
      console.log('error: option --status is impossible to use with --file');
      process.exit(1);
    }
    if (opts.status) {
      if (opts.status !== 'error' && opts.status !== 'success') {
        console.log('error: option --status only use <error> or <success>');
        process.exit(1);
      }
    }

    let reports;
    let res1;
    let url = '';
    let query = {};
    if (!opts.status && !opts.latest) query = null;
    if (opts.status) query.status = opts.status;
    // if -l --list
    if (opts.list) {
      try {
        reports = await axios({
          method: 'GET',
          url: '/reports',
          params: query,
        });
      } catch (err) {
        console.log('error: service unavailable');
        process.exit(1);
      }
      if (!reports?.data?.files?.length) {
        console.log('no reports available');
        process.exit(0);
      }
      const { files: report } = await inquirer.prompt([{
        type: 'list',
        pageSize: 10,
        name: 'files',
        choices: reports.data.files,
        message: 'files',
        default: reports.data.files.slice(),
        source: (answersSoFar, input) => new Promise((resolve) => {
          const result = reports?.data
            .filter((file) => file.toLowerCase().includes(input.toLowerCase()));
          resolve(result);
        }),
      }]);
      opts.file = report;
    }

    if (opts.file) url += `/${opts.file}`;
    if (opts.latest) query.latest = opts.latest;
    // if -f --file -l --latest
    try {
      res1 = await axios({
        method: 'get',
        url: `/reports${url}`,
        params: query,
      });
    } catch (err) {
      if (res1?.response?.status === 404) {
        console.log('file doesn\'t exist');
        process.exit(1);
      }
      console.log('error: service unavailable');
      process.exit(1);
    }
    console.log(res1.data);
  },
};
