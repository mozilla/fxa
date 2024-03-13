/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Path } from 'convict';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import config, { AppConfig } from './config';
import { FirestoreService } from './backend/firestore.service';
import { CloudTasksService } from './backend/cloud-tasks.service';

export const mockConfigOverrides: any = {};
export const MockConfig: Provider = {
  provide: ConfigService,
  useValue: {
    get: jest.fn().mockImplementation((key: Path<AppConfig>) => {
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
  provide: FirestoreService,
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

export const MockCloudTaskFactory: Provider = {
  provide: CloudTasksService,
  useFactory: () => {
    return {
      accountTasks: {},
    };
  },
};
