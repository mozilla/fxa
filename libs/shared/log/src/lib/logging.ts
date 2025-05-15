/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createLogger, format, LoggerOptions, transports } from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
import { formatToHeka, winstonNestLike } from './util';

// Default log settings for debug mode
let logLevel = 'debug';
let logFormat = format.combine(
  format.errors({ stack: true }),
  format.timestamp(),
  utilities.format.nestLike('App')
);
let winstonLogFormat = (app: string) =>
  format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    winstonNestLike(app)
  );

// Production overrides
if (process.env['NODE_ENV'] === 'production') {
  logLevel = process.env['LOG_LEVEL'] || 'info';
  logFormat = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  );
  winstonLogFormat = (app) => {
    return format.combine(
      format.errors({ stack: true }),
      format.timestamp(),
      formatToHeka(app)
    );
  };
}

const logTransports = [new transports.Console()];

// Turn on global winston exception handling
const exceptionHandling = {} as Partial<LoggerOptions>;
if (process.env['WINSTON_LOGGING'] === 'true') {
  exceptionHandling['exceptionHandlers'] = logTransports;
  exceptionHandling['rejectionHandlers'] = logTransports;
}

export const logger = createLogger({
  level: logLevel,
  format: logFormat,
  transports: logTransports,
  handleExceptions: true,
  exitOnError: true,
  ...exceptionHandling,
});

export const winstonLogger = (app: string) =>
  WinstonModule.createLogger({
    level: logLevel,
    format: winstonLogFormat(app),
    transports: logTransports,
    handleExceptions: true,
    exitOnError: true,
    ...exceptionHandling,
  });
