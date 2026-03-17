/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger, Provider } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';

/**
 * Can be used to satisfy DI when unit testing things that inject Logger.
 */
export const MockLoggerProvider: Provider<LoggerService> = {
  provide: Logger,
  useFactory: () => {
    return {
      error: () => {},
      log: () => {},
      warn: () => {},
      debug: () => {},
    } as unknown as LoggerService;
  },
};
