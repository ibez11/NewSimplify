import { createLogger, format, transports } from 'winston';
import httpContext from 'express-http-context';

const { colorize, combine, metadata, timestamp, printf } = format;

const logLevel = process.env.LOG_LEVEL || 'info';

/**
 * this customFormat will format the text and color only ERROR message to red
 */
const customFormat = printf(info => {
  const transactionID = httpContext.get('transactionID');
  const transactionIDBlock = transactionID ? `[${transactionID}]` : '';
  const message = `${info.timestamp} [${info.metadata.filename}] ${info.level} ${transactionIDBlock}\t${info.message}`;

  if (info.level === 'ERROR' || info.level === 'WARN') {
    return colorize({ level: true }).colorize(info.level.toLowerCase(), message);
  }

  return message;
});

const changeLevelToUpperCase = format(info => {
  info.level = info.level.toUpperCase();

  return info;
});

export const appLogger = createLogger({
  level: logLevel,
  exitOnError: false,
  format: combine(
    changeLevelToUpperCase(),
    metadata(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  ),
  transports: [new transports.Console()]
});

export default appLogger;
