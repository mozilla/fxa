/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/cloud-scheduler.js (Mocha → Jest).
 * Replaced proxyquire with jest.mock for @fxa/shared/cloud-tasks.
 * Converted Date.now stubbing to jest.spyOn.
 */

import sinon from 'sinon';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';

// p-queue is ESM-only; mock it to avoid parse errors in Jest
jest.mock('p-queue', () => ({
  __esModule: true,
  default: class PQueue {
    add(fn: any) {
      return fn();
    }
  },
}));

jest.mock('@fxa/shared/cloud-tasks', () => {
  const actual = jest.requireActual('@fxa/shared/cloud-tasks');
  return {
    ...actual,
    DeleteAccountTasksFactory: jest.fn(),
  };
});

const { CloudSchedulerHandler } = require('./cloud-scheduler');

describe('CloudSchedulerHandler', () => {
  let cloudSchedulerHandler: any;
  let config: any;
  let log: any;
  let statsd: any;
  let mockProcessAccountDeletionInRange: any;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    config = {
      cloudScheduler: {
        deleteUnverifiedAccounts: {
          sinceDays: 7,
          durationDays: 7,
          taskLimit: 1000,
        },
      },
    };
    log = {
      info: sinon.stub(),
    };
    statsd = {
      increment: sinon.stub(),
    };

    cloudSchedulerHandler = new CloudSchedulerHandler(log, config, statsd);

    mockProcessAccountDeletionInRange = sinon.stub(
      cloudSchedulerHandler,
      'processAccountDeletionInRange'
    );

    dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2023-01-01T00:00:00Z').getTime());
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe('deleteUnverifiedAccounts', () => {
    it('should call processAccountDeletionInRange with correct parameters', async () => {
      const { sinceDays, durationDays, taskLimit } =
        config.cloudScheduler.deleteUnverifiedAccounts;
      const endDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
      const startDate = new Date(
        endDate.getTime() - durationDays * 24 * 60 * 60 * 1000
      );
      const reason = ReasonForDeletion.Unverified;

      await cloudSchedulerHandler.deleteUnverifiedAccounts();

      sinon.assert.calledOnceWithExactly(
        mockProcessAccountDeletionInRange,
        config,
        undefined,
        reason,
        startDate.getTime(),
        endDate.getTime(),
        taskLimit,
        log
      );
    });
  });
});
