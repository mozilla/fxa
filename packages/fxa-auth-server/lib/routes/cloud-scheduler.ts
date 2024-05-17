/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import {
  AccountTasks,
  AccountTasksFactory,
  ReasonForDeletion,
} from '@fxa/shared/cloud-tasks';
import { StatsD } from 'hot-shots';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

/**
 * Process a date range of accounts to delete.
 *
 * @param config
 * @param accountTasks
 * @param reason
 * @param startDate
 * @param endDate
 * @param taskLimit
 * @param log
 */
export async function processAccountDeletionInRange(
  config: ConfigType,
  accountTasks: AccountTasks,
  reason: ReasonForDeletion,
  startDate: any,
  endDate: any,
  taskLimit: number,
  log?: AuthLogger
) {
  const PQueue = (await import('p-queue')) as any;
  const kyselyDb = await setupAccountDatabase(config.database.mysql.auth);
  const accounts = await kyselyDb
    .selectFrom('accounts')
    .where('accounts.emailVerified', '=', 0)
    .where('accounts.createdAt', '>=', startDate)
    .where('accounts.createdAt', '<=', endDate)
    .leftJoin('accountCustomers', 'accounts.uid', 'accountCustomers.uid')
    .select(['accounts.uid', 'accountCustomers.stripeCustomerId'])
    .execute();

  // Scaling suggestion is 500/5/50 rule, may start at 500/sec, and increase every 5 minutes by 50%.
  // They also note increased latency may occur past 1000/sec, so we stop increasing as we approach that.
  const scaleUpIntervalMins = 5;
  let lastScaleUp = Date.now();
  let rateLimit = taskLimit;

  const queue = new PQueue({
    interval: 1000,
    intervalCap: rateLimit,
    concurrency: rateLimit * 2,
  });

  if (accounts.length === 0) {
    return 0;
  }

  for (const row of accounts) {
    if (
      rateLimit < 950 &&
      Date.now() - lastScaleUp > scaleUpIntervalMins * 60 * 1000
    ) {
      rateLimit = Math.floor(rateLimit * 1.5);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      queue['#intervalCap'] = rateLimit; // This is private, but we need to update it
      queue.concurrency = rateLimit * 2;
      lastScaleUp = Date.now();
    }

    await queue.onSizeLessThan(rateLimit * 4); // Back-pressure

    queue.add(async () => {
      try {
        const result = await accountTasks.deleteAccount({
          uid: row.uid.toString('hex'),
          customerId: row.stripeCustomerId || undefined,
          reason,
        });

        if (log) {
          log.info('Created cloud task', {
            cloudTaskId: result,
            reason,
            uid: row.uid.toString('hex'),
          });
        } else {
          console.log(
            `Created cloud task ${result} for uid ${row.uid.toString('hex')}`
          );
        }
      } catch (err) {
        if (log) {
          log.error('Errored creating task', {
            err,
          });
        } else {
          console.error('Errored creating task', err);
        }
      }
    });
  }
  await queue.onIdle(); // Wait for the queue to empty and promises to complete

  return 0;
}

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

  async processAccountDeletionInRange(
    config: ConfigType,
    accountTasks: AccountTasks,
    reason: ReasonForDeletion,
    startDate: any,
    endDate: any,
    taskLimit: number,
    log?: AuthLogger
  ) {
    return processAccountDeletionInRange(
      config,
      accountTasks,
      reason,
      startDate,
      endDate,
      taskLimit,
      log
    );
  }

  async deleteUnverifiedAccounts() {
    const { sinceDays, durationDays, taskLimit } =
      this.config.cloudScheduler.deleteUnverifiedAccounts;
    const endDate = this.calculateDate(sinceDays);
    const startDate = this.calculateDate(sinceDays + durationDays);
    const reason = ReasonForDeletion.Unverified;

    this.log.info('Deleting unverified accounts', {
      initiatedAt: new Date().toISOString(),
      endDate: endDate.toISOString(),
      startDate: startDate.toISOString(),
    });
    this.statsd.increment('cloud-scheduler.deleteUnverifiedAccounts');
    await this.processAccountDeletionInRange(
      this.config,
      this.accountTasks,
      reason,
      startDate.getTime(),
      endDate.getTime(),
      taskLimit,
      this.log
    );

    return {};
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
