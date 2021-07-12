const {
  createLogger,
  transports,
  format,
} = require('winston');

const {
  combine,
  printf,
  colorize,
} = format;

const myFormat = printf(({ level, message }) => `${level}: ${message}`);

const processConfiguration = [
  new (transports.Console)(),
];

const logger = createLogger({
  format: combine(colorize(), myFormat),
  transports: processConfiguration,
});

module.exports = {
  logger,
};
