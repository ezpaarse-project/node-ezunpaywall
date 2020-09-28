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

    let reports;
    if (opts.list) {
      try {
        reports = await axios({
          method: 'GET',
          url: '/reports',
        });
      } catch (err) {
        logger.error(err);
        console.error(err);
        process.exit(1);
      }
      if (!reports?.data?.files.length) {
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
    let res1;
    let res2;
    let url = '';
    let query = {};
    if (!opts.status && !opts.latest) query = null;
    if (opts.file) url += `/${opts.file}`;
    if (opts.status) query.status = opts.status;
    if (opts.latest) query.latest = opts.latest;
    try {
      res1 = await axios({
        method: 'get',
        url: `/reports${url}`,
        params: query,
      });
    } catch (err) {
      process.exit(1);
    }
    try {
      res2 = await axios({
        method: 'get',
        url: `/reports/${res1.data.files}`,
      });
    } catch (err) {
      process.exit(1);
    }
    console.log(res2);
  },
};
