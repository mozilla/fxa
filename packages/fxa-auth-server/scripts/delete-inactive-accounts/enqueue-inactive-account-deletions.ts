#!/usr/bin/env node -r esbuild-register

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A script to start the inactive account deletion process.  It should (per
 * current rqeuirements), for every inactive account:
 *  - send a pre-deletion event to relevant RPs of the account
 *  - enqueue a cloud task to send the first notification email
 *
 * This script relies on the same set of enivronment variables as the FxA auth
 * server.
 */

import { Command } from 'commander';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';

import { parseDryRun } from '../lib/args';
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

const defaultResultsLImit = 500000;
const defaultInactiveByDate = () => {
  const inactiveBy = new Date();
  inactiveBy.setFullYear(inactiveBy.getFullYear() - 2);
  return inactiveBy;
};

const init = async () => {
  const program = new Command();
  program
    .description(
      'Starts the inactive account deletion process by enqueuing the first email\n' +
        'notification for inactive accounts.  This script allows segmenting the\n' +
        'accounts to search by account creation date. It also optionally accepts a\n' +
        'date at or after when an account is active in order to be excluded.\n\n' +
        'For example, to start the inactive deletion process on accounts created\n' +
        'between 2015-01-01 and 2015-01-31 where the account is not active after\n' +
        '2024-10-31:\n' +
        '  enqueue-inactive-account-deletions.ts \\\n' +
        '    --start-date 2015-01-01 \\\n' +
        '    --end-date 2015-12-31 \\\n' +
        '    --active-by-date 2024-10-31'
    )
    .option(
      '--dry-run [true|false]',
      'Print out the argument and configuration values that will be used in the execution of the script. Defaults to true.',
      true
    )
    .option(
      '--active-by-date [date]',
      'An account is considered active if it has any activity at or after this date.  Optional.  Defaults to two years ago from script execution time.',
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
      '--results-limit [number]',
      'The number of results per accounts DB query.  Defaults to 500000.',
      parseInt,
      defaultResultsLImit
    );
  // @TODO add testing related parameters, such as UID(s), time between certain actions, etc.

  program.parse(process.argv);

  const isDryRun = parseDryRun(program.dryRun);
  const startDate = setDateToUTC(program.startDate);
  const endDate = setDateToUTC(program.endDate);
  const activeByDate = program.activeByDate
    ? setDateToUTC(program.activeByDate)
    : defaultInactiveByDate();
  const startDateTimestamp = startDate.valueOf();
  const endDateTimestamp = endDate.valueOf() + 86400000; // next day for < comparisons
  const activeByDateTimestamp = activeByDate.valueOf();

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

  if (isDryRun) {
    console.log(
      'Dry run mode is on.  It is the default; use --dry-run=false when you are ready.'
    );
    console.log('Per DB query results limit: ', program.resultsLimit);
    // @TODO add more dry-run output
    return 0;
  }

  const accountQueryBuilder = () =>
    accountWhereAndOrderByQueryBuilder(
      startDateTimestamp,
      endDateTimestamp,
      activeByDateTimestamp
    )
      .select('accounts.uid')
      .limit(program.resultsLimit);

  const sessionTokensFn = fxaDb.sessions.bind(fxaDb);
  const refreshTokensFn = oauthDb.getRefreshTokensByUid.bind(oauthDb);
  const accessTokensFn = oauthDb.getAccessTokensByUid.bind(oauthDb);

  const checkActiveSessionToken = async (uid: string) =>
    await hasActiveSessionToken(sessionTokensFn, uid, activeByDateTimestamp);
  const checkRefreshToken = async (uid: string) =>
    await hasActiveRefreshToken(refreshTokensFn, uid, activeByDateTimestamp);
  const checkAccessToken = async (uid: string) =>
    await hasAccessToken(accessTokensFn, uid);

  const iapSubUids = new Set<string>();
  const playSubscriptionsCollection = await playBilling.purchaseDbRef().get();
  const appleSubscriptionsCollection = await appleIap.purchasesDbRef().get();
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

  const hasIapSubscription = async (uid: string) =>
    iapSubUids.has(uid) &&
    ((await playSubscriptions.getSubscriptions(uid)).length > 0 ||
      (await appStoreSubscriptions.getSubscriptions(uid)).length > 0);

  const isActive = new IsActiveFnBuilder()
    .setActiveSessionTokenFn(checkActiveSessionToken)
    .setRefreshTokenFn(checkRefreshToken)
    .setAccessTokenFn(checkAccessToken)
    .setIapSubscriptionFn(hasIapSubscription)
    .build();

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

    for (const accountRecord of accounts) {
      if (!(await isActive(accountRecord.uid))) {
        // @TODO add concurrency and rate limiting
        // @TODO enqueue first email notification

        totalInactiveAccounts++;
      }
    }

    hasMaxResultsCount = accounts.length === program.resultsLimit;
    totalRowsReturned += accounts.length;
  }

  console.log(`Total accounts processed: ${totalRowsReturned}`);
  console.log(`Number of inactive accounts: ${totalInactiveAccounts}`);

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
