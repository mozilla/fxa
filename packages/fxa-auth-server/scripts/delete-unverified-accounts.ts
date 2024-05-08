/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Command } from 'commander';
import { StatsD } from 'hot-shots';
import PQueue from 'p-queue';
import { Container } from 'typedi';

import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';

import appConfig, { ConfigType } from '../config';
import * as random from '../lib/crypto/random';
import DB from '../lib/db';
import { setupFirestore } from '../lib/firestore-db';
import initLog from '../lib/log';
import { CurrencyHelper } from '../lib/payments/currencies';
import { createStripeHelper, StripeHelper } from '../lib/payments/stripe';
import initRedis from '../lib/redis';
import Token from '../lib/tokens';
import { AppConfig, AuthFirestore, AuthLogger } from '../lib/types';
import { parseDryRun } from './lib/args';
import {
  AccountTasks,
  AccountTasksFactory,
  ReasonForDeletion,
} from '@fxa/shared/cloud-tasks';
import { getAccountCustomerByUid } from 'fxa-shared/db/models/auth';

const collect = () => (val: string, xs: string[]) => {
  xs.push(val);
  return xs;
};
const uid = collect();
const email = collect();

const limitSpecifiedAccounts = (
  program: Command,
  limit: number
): { uids: string[]; emails: string[] } => {
  if (limit === Infinity) {
    return { uids: program.uid, emails: program.email };
  }
  if (program.uid.size >= limit) {
    return { uids: program.uid.slice(0, limit), emails: [] };
  }
  return {
    uids: program.uid,
    emails: program.email.slice(0, limit - program.uid.length),
  };
};

const dryRun = (
  program: Command,
  useSpecifiedAccounts: boolean,
  useDateRange: boolean,
  limit: number
) => {
  if (useSpecifiedAccounts) {
    const { uids, emails } = limitSpecifiedAccounts(program, limit);
    console.log(
      `When not in dry-run mode this call will enqueue ${
        uids.length + emails.length
      } account deletions with the following account info`
    );
    uids.forEach((x) => console.log(`uid: ${x}`));
    emails.forEach((x) => console.log(`uid: ${x}`));
  }
  if (useDateRange) {
    const start = new Date(program.startDate);
    const end = new Date(program.endDate);
    console.log(
      `When not in dry-run mode this call will enqueue up to ${limit} account deletions in the date range ${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleDateString()} ${end.toLocaleTimeString()} inclusive.`
    );
    console.log('Scanning a large database table for a range will be slow!');
    console.log('Consider running this on a db replica.');
  }
  return 0;
};

const init = async () => {
  const program = new Command();
  program
    .description(
      'Enqueue account deletes to Cloud Task with uid/email or a date range.\n\n' +
        'Deleting accounts could lead to Stripe API calls so the targetted Cloud Task\n' +
        'queue should be configured with a rate limit below the Stripe API rate limit.\n' +
        'The Stripe rate limit is 100/sec; 50/sec for cloud tasks seems reasonble.  YMMV.'
    )
    .option('-u, --uid [uid]', 'An account uid, repeatable.', uid, [])
    .option(
      '--email [email]',
      'An account primary email address, repeatable.',
      email,
      []
    )
    .option(
      '--start-date [date]',
      'Start of date range of account creation date, inclusive.',
      Date.parse
    )
    .option(
      '--end-date [date]',
      'End of date range of account creation date, inclusive.',
      Date.parse
    )
    .option('--limit', 'The number of delete tasks to enqueue.')
    .option(
      '--dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    )
    .option(
      '--table-scan [true|false]',
      'Acknowledge that you are fine with a table scan on the accounts table.  Defaults to false.',
      false
    )
    .option(
      '--task-enqueue-limit <number>',
      'The maximum amount of tasks to enqueue per second.',
      200
    );

  program.parse(process.argv);
  const isDryRun = parseDryRun(program.dryRun);
  const limit = program.limit ? parseInt(program.limit) : Infinity;
  const hasUid = program.uid.length > 0;
  const hasEmail = program.email.length > 0;
  const hasDateRange =
    program.startDate && program.endDate && program.endDate > program.startDate;
  const reason = ReasonForDeletion.Unverified;
  const taskLimit = program.taskEnqueueLimit
    ? parseInt(program.taskEnqueueLimit)
    : 200;

  if (!hasUid && !hasEmail && !hasDateRange) {
    throw new Error(
      'The program needs at least a uid, an email, or valid date range.'
    );
  }
  if ((hasUid || hasEmail) && hasDateRange) {
    throw new Error(
      'Sorry, but the script does not support uid/email arguments and a date range in the same invocation.'
    );
  }
  if (limit <= 0) {
    throw new Error('The limit should be a positive integer.');
  }

  const useSpecifiedAccounts = hasUid || hasEmail;
  const useDateRange = !useSpecifiedAccounts && hasDateRange;

  if (isDryRun) {
    console.log(
      'Dry run mode is on.  It is the default; use --dry-run=false when you are ready.'
    );

    return dryRun(program, useSpecifiedAccounts, useDateRange, limit);
  }

  const config = appConfig.getProperties();
  const log = initLog({
    ...config.log,
  });
  const statsd = new StatsD({ ...config.statsd });
  const redis = initRedis(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const db = DB(
    config,
    log,
    Token(log, config),
    random.base32(config.signinUnblock.codeLength) as any // TS type inference is failing pretty hard with this
  );
  const fxaDb = await db.connect(config, redis);

  Container.set(AppConfig, config);
  Container.set(AuthLogger, log);

  const authFirestore = setupFirestore(config);
  Container.set(AuthFirestore, authFirestore);
  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
  const stripeHelper = createStripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);

  const accountTasks = AccountTasksFactory(config, statsd);

  if (useSpecifiedAccounts) {
    const { uids, emails } = limitSpecifiedAccounts(program, limit);

    for (const x of uids) {
      const acct = await fxaDb.account(x);
      if (acct && acct.emailVerified) {
        console.error(`Account with uid ${x} is verified.  Skipping.`);
        continue;
      }
      const result = await accountTasks.deleteAccount({
        uid: x,
        customerId: (await getAccountCustomerByUid(x))?.stripeCustomerId,
        reason,
      });
      console.log(`Created cloud task ${result} for uid ${x}`);
    }

    for (const x of emails) {
      const acct = await fxaDb.accountRecord(x);
      if (acct && acct.emailVerified) {
        console.error(`Account with email ${x} is verified.  Skipping.`);
        continue;
      }
      const result = await accountTasks.deleteAccount({
        uid: acct.uid,
        customerId: (await getAccountCustomerByUid(acct.uid))?.stripeCustomerId,
        reason,
      });
      console.log(`Created cloud task ${result} for email ${x}`);
    }
  }

  if (useDateRange) {
    if (program.tableScan !== 'true') {
      console.log('Please call with --table-scan if you are sure.');
      return 0;
    }

    await processDateRange(
      config,
      accountTasks,
      reason,
      program.startDate,
      program.endDate,
      taskLimit
    );
  }

  return 0;
};

/**
 * Process a date range of accounts to delete.
 *
 * @param config
 * @param accountTasks
 * @param reason
 * @param startDate
 * @param endDate
 * @param taskLimit
 */
export async function processDateRange(
  config: ConfigType,
  accountTasks: AccountTasks,
  reason: ReasonForDeletion,
  startDate: any,
  endDate: any,
  taskLimit: number
) {
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
        console.log(
          `Created cloud task ${result} for uid ${row.uid.toString('hex')}`
        );
      } catch (err) {
        console.error('Errored creating task', err);
      }
    });
  }
  await queue.onIdle(); // Wait for the queue to empty and promises to complete

  return 0;
}

if (require.main === module) {
  init()
    .catch((err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .then((exitCode: number) => process.exit(exitCode));
}
