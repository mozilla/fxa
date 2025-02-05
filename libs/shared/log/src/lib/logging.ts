/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createLogger, format, LoggerOptions, transports } from 'winston';
import { utilities } from 'nest-winston';
import { MozLogConsoleTransport } from './transports/mozlog';

/**
 * Generic Interface for logging.
 * In theory its compatible with both old mozlog format, and newer winston targets.
 */
export type ILogger = {
  // TODO: FXA-9951 Enforce set of standard fields on data. Currently this is too open ended.
  error: (type: string, data: any) => void;
  debug: (type: string, data: any) => void;
  info: (type: string, data: any) => void;
  warn: (type: string, data: any) => void;
};

export function createLogging({
  level,
  name,
  target,
}: {
  level?: 'info' | 'debug' | 'warn' | 'error' | 'trace';
  name: string;
  target?: 'winston' | 'mozlog';
}): ILogger {
  if (!target) {
    target = 'winston';
  }

  const logFormat = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    utilities.format.nestLike('App')
  );

  const loggerOpts = {
    level,
    format: logFormat,
    name,
    handleExceptions: true,
    exitOnError: true,
  };

  if (target === 'winston') {
    // TODO: FXA-11079 - We should always be explicit about configuration.
    // Default log settings for debug mode
    let logLevel: string = level || 'debug';

    let logFormat = format.combine(
      format.errors({ stack: true }),
      format.timestamp(),
      utilities.format.nestLike('App')
    );

    // TODO: FXA-11079 - We should always be explicit about configuration.
    // Production overrides
    if (process.env['NODE_ENV'] === 'production') {
      logLevel = process.env['LOG_LEVEL'] || 'info';
      logFormat = format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json()
      );
    }

    // TODO:
    const logTransports = [new transports.Console()];

    // Turn on global winston exception handling
    const exceptionHandling = {} as Partial<LoggerOptions>;
    if (process.env['WINSTON_LOGGING'] === 'true') {
      exceptionHandling['exceptionHandlers'] = logTransports;
      exceptionHandling['rejectionHandlers'] = logTransports;
    }

    // TODO: FXA-9950 - Create winston transport that's compatible with previous mozlog format
    //       Leaving this in place for now since it's used by payments. This format, however,
    //       is not fully compatible with our ETLs for bigquery logs.
    return createLogger({
      level: logLevel,
      format: logFormat,
      transports: logTransports,
      handleExceptions: true,
      exitOnError: true,
      ...exceptionHandling,
    });
  } else if (target === 'mozlog') {
    // For backwards compatibility with current log exports
    // TODO: FXA-9950 - Create winston transport that's compatible with previous mozlog format
    //       This is just a quick pass to fix a bug on one of our dashboards. We should revisit
    //       and test this more fully in FXA-9950. For things like auth server glean metric
    //       logs, this implementation is likely inadequate!
    return createLogger({
      level,
      handleExceptions: true,
      exitOnError: true,
      transports: [new MozLogConsoleTransport(loggerOpts)],
      exceptionHandlers: [new transports.Console()],
      rejectionHandlers: [new transports.Console()],
    });
  }

  throw new Error('Unknown target. Options are mozlog or winston.');
}
