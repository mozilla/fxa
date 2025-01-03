#!/usr/bin/env node -r esbuild-register

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A script to get a list of inactive account UIDs.
 *
 * For expediency, this script has very few parameters.  It will rely on the
 * same set of enivronment variables as the auth server.
 */

import fs from 'fs';
import os from 'os';
import { performance } from 'perf_hooks';

import { Command } from 'commander';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';
import PQueue from 'p-queue-compat';

import { parseBooleanArg } from '../lib/args';
import { AppConfig, AuthFirestore, AuthLogger } from '../../lib/types';
import appConfig from '../../config';
import initLog from '../../lib/log';
import initRedis from '../../lib/redis';
import Token from '../../lib/tokens';
import * as random from '../../lib/crypto/random';
import { createDB } from '../../lib/db';
import { setupFirestore } from '../../lib/firestore-db';
import { CurrencyHelper } from '../../lib/payments/currencies';
import { createStripeHelper, StripeHelper } from '../../lib/payments/stripe';
import oauthDb from '../../lib/oauth/db';
import { PlayBilling } from '../../lib/payments/iap/google-play';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { AppleIAP } from '../../lib/payments/iap/apple-app-store/apple-iap';
import { AppStoreSubscriptions } from '../../lib/payments/iap/apple-app-store/subscriptions';

import {
  accountWhereAndOrderByQueryBuilder,
  hasAccessToken,
  hasActiveRefreshToken,
  hasActiveSessionToken,
  IsActiveFnBuilder,
  setDateToUTC,
} from './lib';

const createFilepath = (endDate: Date) =>
  `inactive-account-uids-${endDate.toISOString().substring(0, 10)}.csv`;

const _collectPerfStatsOn = (statsMap: Map<string, number[]>) => {
  const sm = statsMap;

  return <T extends (...args) => ReturnType<T>>(name: string, fn: T) => {
    const stats: number[] = [];
    sm.set(name, stats);

    return async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      stats.push(performance.now() - start);
      return result;
    };
  };
};

const init = async () => {
  const program = new Command();
  program
    .description(
      'Get a list of UIDs of accounts that are considered inactive.\n\n' +
        'For example, to get a list of inactive account UIDs for accounts \n' +
        'created between 2015-01-01 and 2015-01-31 where the account is not \n' +
        'active after 2024-10-31:\n' +
        '  get-inactive-account-uids.ts \\\n' +
        '    --start-date 2015-01-01 \\\n' +
        '    --end-date 2015-12-31 \\\n' +
        '    --active-by-date 2024-10-31'
    )
    .option(
      '--dry-run [true|false]',
      'Print out the number of account to be processed with the given arguments. Defaults to true.',
      true
    )
    .option(
      '--active-by-date [date]',
      'An account is considered active if it has any activity at or after this date.  Optional.  Defaults to the value of --end-date.',
      Date.parse
    )
    .option(
      '--start-date [date]',
      'Start of date range of account creation date, inclusive.  Optional.  Defaults to 2012-03-12.',
      Date.parse,
      '2012-03-12'
    )
    .option(
      '--end-date [date]',
      'End of date range of account creation date, inclusive.',
      Date.parse
    )
    .option(
      '--output-path [path]',
      'File path to write the list of UIDs to.  Optional.  Defaults to CWD and filename based on the end date.'
    )
    .option(
      '--results-limit [number]',
      'The number of results per accounts DB query.  Defaults to 100000.',
      parseInt
    )
    .option(
      '--concurrency [number]',
      'The number inflight active checks.  Defaults to 6.',
      parseInt
    )
    .option('--perf-stats [true|false]', 'Print out performance stats.', false);

  program.parse(process.argv);

  const isDryRun = parseBooleanArg(program.dryRun);
  const startDate = setDateToUTC(program.startDate);
  const endDate = setDateToUTC(program.endDate);
  const startDateTimestamp = startDate.valueOf();
  const endDateTimestamp = endDate.valueOf() + 86400000; // next day for < comparisons
  const activeByDateTimestamp = setDateToUTC(
    program.activeByDate || endDate
  ).valueOf();
  const filepath = program.outputPath || createFilepath(endDate);
  const perfStats = program.perfStats ? new Map() : null;
  const collectPerfStatsOn = perfStats
    ? _collectPerfStatsOn(perfStats)
    : <T extends (...args) => ReturnType<T>>(_, fn: T) => fn;

  const config = appConfig.getProperties();
  const log = initLog({
    ...config.log,
  });
  const statsd = new StatsD({ ...config.statsd });
  const redis = initRedis(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const db = createDB(
    config,
    log,
    Token(log, config),
    random.base32(config.signinUnblock.codeLength)
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
  const playBilling = Container.get(PlayBilling);
  const playSubscriptions = Container.get(PlaySubscriptions);
  const appleIap = Container.get(AppleIAP);
  const appStoreSubscriptions = Container.get(AppStoreSubscriptions);

  const accountWhereAndOrderBy = () =>
    accountWhereAndOrderByQueryBuilder(
      startDateTimestamp,
      endDateTimestamp,
      activeByDateTimestamp
    );

  const accountQueryBuilder = () =>
    accountWhereAndOrderBy()
      .select('accounts.uid')
      .limit(program.resultsLimit || 100000);

  const sessionTokensFn = fxaDb.sessions.bind(fxaDb);
  const refreshTokensFn = oauthDb.getRefreshTokensByUid.bind(oauthDb);
  const accessTokensFn = oauthDb.getAccessTokensByUid.bind(oauthDb);

  const checkActiveSessionToken = collectPerfStatsOn(
    'Session Token Check',
    async (uid: string) =>
      await hasActiveSessionToken(sessionTokensFn, uid, activeByDateTimestamp)
  );
  const checkRefreshToken = collectPerfStatsOn(
    'Refresh Token Check',
    async (uid: string) =>
      await hasActiveRefreshToken(refreshTokensFn, uid, activeByDateTimestamp)
  );
  const checkAccessToken = collectPerfStatsOn(
    'Access Token Check',
    async (uid: string) => await hasAccessToken(accessTokensFn, uid)
  );

  const getPlaySubscriptionsCollection = collectPerfStatsOn(
    'Get Play Collection',
    async () => await playBilling.purchaseDbRef().get()
  );
  const getAppleSubscriptionsCollection = collectPerfStatsOn(
    'Get Apple Collection',
    async () => await appleIap.purchasesDbRef().get()
  );

  const iapSubUids = new Set<string>();
  const playSubscriptionsCollection = await getPlaySubscriptionsCollection();
  const appleSubscriptionsCollection = await getAppleSubscriptionsCollection();
  ((collections) => {
    for (const c of collections) {
      for (const purchaseRecordSnapshot of c.docs) {
        const x = purchaseRecordSnapshot.data();
        if (x.userId) {
          iapSubUids.add(x.userId);
        }
      }
    }
  })([playSubscriptionsCollection, appleSubscriptionsCollection]);

  const getPlaySubscriptions = collectPerfStatsOn(
    'Get Play Subscriptions',
    async (uid: string) => await playSubscriptions.getSubscriptions(uid)
  );
  const getAppleSubscriptions = collectPerfStatsOn(
    'Get Apple Subscriptions',
    async (uid: string) => await appStoreSubscriptions.getSubscriptions(uid)
  );

  const hasIapSubscription = collectPerfStatsOn(
    'Has IAP Check',
    async (uid: string) =>
      iapSubUids.has(uid) &&
      ((await getPlaySubscriptions(uid)).length > 0 ||
        (await getAppleSubscriptions(uid)).length > 0)
  );

  const _isActive = new IsActiveFnBuilder()
    .setActiveSessionTokenFn(checkActiveSessionToken)
    .setRefreshTokenFn(checkRefreshToken)
    .setAccessTokenFn(checkAccessToken)
    .setIapSubscriptionFn(hasIapSubscription)
    .build();
  const isActive = collectPerfStatsOn('Active Status Check', _isActive);

  if (isDryRun) {
    const countQuery = accountWhereAndOrderBy().count({
      total: 'accounts.uid',
    });
    console.log(`Count query used: ${countQuery.toKnexQuery().toQuery()}`);
    const acctsCount: any = await countQuery.first();
    console.log(`Number of accounts to be processed: ${acctsCount.total}`);
    return 0;
  }

  const fd = fs.openSync(filepath, 'a');
  const concurrency = program.concurrency || 6;
  const queue = new PQueue({
    concurrency,
  });

  let hasMaxResultsCount = true;
  let totalRowsReturned = 0;
  let totalInactiveAccounts = 0;

  while (hasMaxResultsCount) {
    const accountsQuery = accountQueryBuilder();
    accountsQuery.offset(totalRowsReturned);

    const accounts = await accountsQuery;

    if (!accounts.length) {
      hasMaxResultsCount = false;
      break;
    }

    const inactiveUids: string[] = [];
    for (const accountRecord of accounts) {
      await queue.onSizeLessThan(concurrency * 5);

      queue.add(async () => {
        if (!(await isActive(accountRecord.uid))) {
          inactiveUids.push(accountRecord.uid);
        }
      });
    }
    await queue.onIdle();

    if (inactiveUids.length) {
      totalInactiveAccounts += inactiveUids.length;
      inactiveUids.push('');
      fs.writeSync(fd, inactiveUids.join(os.EOL));
    }

    hasMaxResultsCount = accounts.length === program.resultsLimit;
    totalRowsReturned += accounts.length;
  }

  fs.closeSync(fd);

  console.log(
    `Processed account created during: ${startDate
      .toISOString()
      .substring(0, 10)} - ${endDate.toISOString().substring(0, 10)}`
  );
  console.log(
    `Account is considered active if activity at or after: ${new Date(
      activeByDateTimestamp
    )
      .toISOString()
      .substring(0, 10)}`
  );
  console.log(`Total accounts processed: ${totalRowsReturned}`);
  console.log(`Number of inactive accounts: ${totalInactiveAccounts}`);
  console.log(`Inactive account UIDs written to: ${filepath}`);

  if (perfStats) {
    const stats = {};

    perfStats.forEach((xs, k) => {
      const cols = {};
      const sorted = xs.sort((a, b) => a - b);
      cols['Total Calls'] = sorted.length;
      cols['Duration (ms)'] = sorted.reduce((a, b) => a + b, 0);
      cols['Avg'] =
        sorted.length === 0 ? 0 : cols['Duration (ms)'] / cols['Total Calls'];
      cols['Median'] =
        sorted.length === 0
          ? 0
          : sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

      stats[k] = cols;
    });

    console.log('Performance Stats:');
    console.table(stats);
  }

  return 0;
};

if (require.main === module) {
  init()
    .catch((err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .then((exitCode: number) => process.exit(exitCode));
}
