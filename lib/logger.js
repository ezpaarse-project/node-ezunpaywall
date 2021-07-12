const {
  createLogger,
  transports,
  format,
} = require('winston');

const {
  combine,
  timestamp,
  printf,
  colorize,
} = format;

const myFormat = printf(({ level, message, timestamp: currentTime }) => `${currentTime} ${level}: ${message}`);

const processConfiguration = [
  new (transports.Console)(),
];

const logger = createLogger({
  format: combine(colorize(), timestamp(), myFormat),
  transports: processConfiguration,
});

module.exports = {
  logger,
};
