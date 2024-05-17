/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import proxyquire from 'proxyquire';

describe('CloudSchedulerHandler', function () {
  this.timeout(10000);

  let cloudSchedulerHandler;
  let config;
  let log;
  let statsd;
  let AccountTasksFactory;
  let mockProcessAccountDeletionInRange;

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
    AccountTasksFactory = sinon.stub();

    const { CloudSchedulerHandler } = proxyquire(
      '../../../lib/routes/cloud-scheduler',
      {
        '@fxa/shared/cloud-tasks': {
          AccountTasksFactory,
        },
      }
    );

    cloudSchedulerHandler = new CloudSchedulerHandler(log, config, statsd);

    mockProcessAccountDeletionInRange = sinon.stub(
      cloudSchedulerHandler,
      'processAccountDeletionInRange'
    );
  });

  describe('deleteUnverifiedAccounts', () => {
    it('should call processAccountDeletionInRange with correct parameters', async () => {
      const accountTasks = AccountTasksFactory(config, statsd);
      const { sinceDays, durationDays, taskLimit } =
        config.cloudScheduler.deleteUnverifiedAccounts;
      const endDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
      const startDate = new Date(
        endDate.getTime() - durationDays * 24 * 60 * 60 * 1000
      );
      const reason = ReasonForDeletion.Unverified;

      await cloudSchedulerHandler.deleteUnverifiedAccounts();

      assert.calledOnceWithExactly(
        mockProcessAccountDeletionInRange,
        config,
        accountTasks,
        reason,
        startDate.getTime(),
        endDate.getTime(),
        taskLimit,
        log
      );
    });
  });
});
