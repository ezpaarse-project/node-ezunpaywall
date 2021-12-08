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

function devFormat() {
  const formatMessage = (info) => `${info.level}: ${info.message}`;
  const formatError = (info) => `${info.level}: ${info.message}\n\n${info.stack}\n`;
  const form = (info) => (info instanceof Error ? formatError(info) : formatMessage(info));
  return combine(colorize(), timestamp(), printf(form));
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false,
  transports: [new transports.Console()],
  format: devFormat(),
});

const errorRequest = (httpMethod, config, status) => {
  const url = `${config.baseURL}${config.url}`;
  logger.error(`Cannot ${httpMethod} ${url} - ${status}`);
};

logger.errorRequest = errorRequest;

module.exports = logger;
