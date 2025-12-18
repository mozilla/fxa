/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudTasksService } from './backend/cloud-tasks.service';
import { FirestoreService } from './backend/firestore.service';
import config, { AppConfig } from './config';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { DatabaseService } from './database/database.service';
import { StatsD } from 'hot-shots';

export const mockConfigOverrides: any = {};
export const MockConfig: Provider = {
  provide: ConfigService<AppConfig>,
  useValue: {
    get(key: keyof AppConfig) {
      if (mockConfigOverrides[key] !== undefined) {
        return mockConfigOverrides[key];
      }
      return config.get(key);
    },
  },
};

export const MockMetricsFactory: Provider = {
  provide: 'METRICS',
  useValue: {},
};

export const MockStatsDFactory: Provider = {
  provide: StatsD,
  useValue: {},
};

export const MockDatabaseService: Provider = {
  provide: DatabaseService,
  useValue: {},
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
