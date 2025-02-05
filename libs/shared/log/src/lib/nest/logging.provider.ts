/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { createLogging, ILogger } from '../logging';
import { LoggingConfig } from './logging.config';

export const LOGGER_PROVIDER = 'Logger';

/**
 * Creates the appropriate logger based on the provided logging config, which should be held under the 'log' key of the application config.
 */
export const LoggingProvider: Provider<ILogger> = {
  provide: LOGGER_PROVIDER,
  useFactory: (loggingConfig: LoggingConfig, inquirer: any) => {
    // Augment the name based on inquirer context. This will give us nicer
    // logs that can be used to see 'where' the log was issued from.
    const context = inquirer?.constructor?.name || 'default';
    loggingConfig.name + '.' + context;

    return createLogging(loggingConfig);
  },
  inject: [LoggingConfig, INQUIRER],
  scope: Scope.TRANSIENT,
};

export const mockLogger = {
  error: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
} as ILogger;

/**
 * Can be used to satisfy DI when unit testing things that should not need
 * an actual logger.
 */
export const MockLoggingProvider: Provider<ILogger> = {
  provide: LOGGER_PROVIDER,
  useFactory: () => {
    return mockLogger;
  },
};
