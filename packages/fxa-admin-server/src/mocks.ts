/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import config from './config';

export const mockConfigOverrides: any = {};
export const MockConfig: Provider = {
  provide: ConfigService,
  useValue: {
    get: jest.fn().mockImplementation((key: string) => {
      if (mockConfigOverrides[key] !== undefined) {
        return mockConfigOverrides[key];
      }
      const val = config.get(key);
      return val;
    }),
  },
};

export const MockMetricsFactory: Provider = {
  provide: 'METRICS',
  useFactory: () => undefined,
};

export const mockFirestoreCollection = jest.fn();
export const MockFirestoreFactory: Provider = {
  provide: 'FIRESTORE',
  useFactory: () => {
    return {
      collection: mockFirestoreCollection,
    };
  },
};

export const MockStripeFactory: Provider = {
  provide: 'STRIPE',
  useFactory: () => {
    return {};
  },
};

export const logger = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  trace: jest.fn(),
};
export const MockLogService: Provider = {
  provide: MozLoggerService,
  useValue: logger,
};
