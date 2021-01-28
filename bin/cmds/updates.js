const inquirer = require('inquirer');
const { connection, getConfig } = require('../../lib/axios');
const logger = require('../../lib/logger');

module.exports = {
  startProcess: async (args) => {
    const axios = await connection(args.use);
    const config = await getConfig(args.use);
    // check date and list
    if (args.list && args.startDate) {
      logger.error('option --startDate is impossible to use with --list');
      process.exit(1);
    }
    if (args.list && args.endDate) {
      logger.error('option --endDate is impossible to use with --list');
      process.exit(1);
    }

    // check files and dates
    if (args.file && args.startDate) {
      logger.error('option --startDate is impossible to use with --file');
      process.exit(1);
    }
    if (args.file && args.endDate) {
      logger.error('option --endDate is impossible to use with --file');
      process.exit(1);
    }

    // check file and list
    if (args.file && args.list) {
      logger.error('option --list is impossible to use with --file');
      process.exit(1);
    }

    // check date and lines limiter
    if (args.offset && args.startDate) {
      logger.error('option --offset is impossible to use with --startDate');
      process.exit(1);
    }
    if (args.offset && args.endDate) {
      logger.error('option --offset is impossible to use with --endDate');
      process.exit(1);
    }
    if (args.limit && args.startDate) {
      logger.error('option --endDate is impossible to use with --limit');
      process.exit(1);
    }
    if (args.limit && args.endDate) {
      logger.error('option --startDate is impossible to use with --limit');
      process.exit(1);
    }

    // check if only endDate
    if (args.endDate && !args.startDate) {
      logger.error('option --endDate is impossible to use without --startDate');
      process.exit(1);
    }

    // check format Date
    const pattern = /^[0-9]*-[0-9]{2}-[0-9]{2}$/;
    if (args.startDate && !pattern.test(args.startDate)) {
      logger.error('startDate are in bad format, expected YYYY-mm-dd');
      process.exit(1);
    }
    if (args.endDate && !pattern.test(args.endDate)) {
      logger.error('endDate are in bad format, expected YYYY-mm-dd');
      process.exit(1);
    }
    if (args.startDate && args.endDate) {
      if (new Date(args.endDate).getTime() < new Date(args.startDate).getTime()) {
        logger.error('end date is lower than start date');
        process.exit(1);
      }
    }

    // check if file exist
    if (args.file) {
      try {
        await axios({
          method: 'GET',
          url: `/download/${args.file}`,
        });
      } catch (err) {
        if (err?.responses?.status === 404) {
          logger.error(`file "${args.file}" doesn't exist`);
          process.exit(1);
        }
        logger.error(`service unavailable ${config.url}:${config.port}`);
        process.exit(1);
      }
    }
    let snapshots;
    let url = '';
    const query = {};
    if (args.list) {
      try {
        snapshots = await axios({
          method: 'GET',
          url: '/download',
          params: query,
        });
      } catch (err) {
        logger.error(`service unavailable ${config.url}:${config.port}`);
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
      args.file = snapshot.files;
    }
    if (args.file) url += `/${args.file}`;
    if (args.offset) query.offset = args.offset;
    if (args.limit) query.limit = args.limit;
    if (args.startDate) query.startDate = args.startDate;
    if (args.endDate) query.endDate = args.endDate;
    let res;
    try {
      res = await axios({
        method: 'post',
        url: `/update${url}`,
        params: query,
      });
    } catch (err) {
      if (err?.response?.status === 409) {
        logger.info('process in progress');
        process.exit(1);
      }
      logger.error(`service unavailable ${config.url}:${config.port}`);
      process.exit(1);
    }
    logger.info(res.data.message);
  },
};
