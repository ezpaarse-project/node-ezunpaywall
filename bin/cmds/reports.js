const inquirer = require('inquirer');
const logger = require('../../lib/logger');

const { connection, getConfig } = require('../../lib/axios');

module.exports = {
  getReports: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    // check list and latest, file,
    if (args.list && args.latest) {
      logger.error('option --latest is impossible to use with --list');
      process.exit(1);
    }
    if (args.list && args.file) {
      logger.error('option --file is impossible to use with --list');
      process.exit(1);
    }
    // check file and latest, status
    if (args.file && args.latest) {
      logger.error('option --latest is impossible to use with --file');
      process.exit(1);
    }
    if (args.file && args.status) {
      logger.error('option --status is impossible to use with --file');
      process.exit(1);
    }
    if (args.status) {
      if (args.status !== 'error' && args.status !== 'success') {
        logger.error('option --status only use <error> or <success>');
        process.exit(1);
      }
    }

    let reports;
    let res1;
    let url = '';
    let query = {};
    if (!args.status && !args.latest) query = null;
    if (args.status) query.status = args.status;
    // if -l --list
    if (args.list) {
      try {
        reports = await axios({
          method: 'GET',
          url: '/reports',
          params: query,
        });
      } catch (err) {
        logger.error(`service unavailable ${config.url}:${config.port}`);
        process.exit(1);
      }
      if (!reports?.data?.files?.length) {
        logger.info('no reports available');
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
      args.file = report;
    }

    if (args.file) url += `/${args.file}`;
    if (args.latest) query.latest = args.latest;
    // if -f --file -l --latest
    try {
      res1 = await axios({
        method: 'get',
        url: `/reports${url}`,
        params: query,
      });
    } catch (err) {
      if (res1?.response?.status === 404) {
        logger.error('file does not exist');
        process.exit(1);
      }
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    logger.info(JSON.stringify(res1.data, null, 2));
  },
};
