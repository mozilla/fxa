/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
// commenting this out for now because the script uses p-queue, which is pure
// ESM since 7.x.  That won't work when nodejs try to `require` it.
// import { processDateRange } from '../../scripts/delete-unverified-accounts';
import {
  AccountTasks,
  AccountTasksFactory,
  //  ReasonForDeletion,
} from '@fxa/shared/cloud-tasks';
import { StatsD } from 'hot-shots';
import error from '../error';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export class CloudSchedulerHandler {
  private accountTasks: AccountTasks;

  constructor(
    private log: AuthLogger,
    private config: ConfigType,
    private statsd: StatsD
  ) {
    this.accountTasks = AccountTasksFactory(this.config, this.statsd);
  }

  private calculateDate(days: number): Date {
    return new Date(Date.now() - days * MILLISECONDS_IN_A_DAY);
  }

  async deleteUnverifiedAccounts() {
    return error.featureNotEnabled();

    // const { sinceDays, durationDays, taskLimit } =
    //   this.config.cloudScheduler.deleteUnverifiedAccounts;
    // const endDate = this.calculateDate(sinceDays);
    // const startDate = this.calculateDate(sinceDays + durationDays);
    // const reason = ReasonForDeletion.Unverified;

    // this.log.info('Deleting unverified accounts', {
    //   initiatedAt: new Date().toISOString(),
    //   endDate: endDate.toISOString(),
    //   startDate: startDate.toISOString(),
    // });
    // this.statsd.increment('cloud-scheduler.deleteUnverifiedAccounts');
    // await processDateRange(
    //   this.config,
    //   this.accountTasks,
    //   reason,
    //   startDate.getTime(),
    //   endDate.getTime(),
    //   taskLimit
    // );

    // return {};
  }
}

export const cloudSchedulerRoutes = (
  log: AuthLogger,
  config: ConfigType,
  statsd: StatsD
) => {
  const cloudSchedulerHandler = new CloudSchedulerHandler(log, config, statsd);
  return [
    {
      method: 'POST',
      path: '/cloud-scheduler/accounts/deleteUnverified',
      options: {
        auth: {
          strategy: 'cloudSchedulerOIDC',
          payload: false,
        },
      },
      handler: (request: AuthRequest) =>
        cloudSchedulerHandler.deleteUnverifiedAccounts(),
    },
  ];
};

export default cloudSchedulerRoutes;
