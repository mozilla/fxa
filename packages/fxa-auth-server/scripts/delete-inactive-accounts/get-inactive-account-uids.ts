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
import { Account } from 'fxa-shared/db/models/auth';
import { PlayBilling } from '../../lib/payments/iap/google-play';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { AppleIAP } from '../../lib/payments/iap/apple-app-store/apple-iap';
import { AppStoreSubscriptions } from '../../lib/payments/iap/apple-app-store/subscriptions';

import {
  accountWhereAndOrderByQueryBuilder,
  hasAccessToken,
  hasActiveRefreshToken,
  hasActiveSessionToken,
  setDateToUTC,
} from './lib';

const createFilepath = (endDate: Date) =>
  `inactive-account-uids-${endDate.toISOString().substring(0, 10)}.csv`;

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
    );

  program.parse(process.argv);

  const isDryRun = parseDryRun(program.dryRun);
  const startDate = setDateToUTC(program.startDate);
  const endDate = setDateToUTC(program.endDate);
  const startDateTimestamp = startDate.valueOf();
  const endDateTimestamp = endDate.valueOf() + 86400000; // next day for < comparisons
  const activeByDateTimestamp = setDateToUTC(
    program.activeByDate || endDate
  ).valueOf();
  const filepath = program.outputPath || createFilepath(endDate);

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

  const hasIapSubscription = async (accountRecord: Account) =>
    iapSubUids.has(accountRecord.uid) &&
    ((await playSubscriptions.getSubscriptions(accountRecord.uid)).length > 0 ||
      (await appStoreSubscriptions.getSubscriptions(accountRecord.uid)).length >
        0);

  const isActive = async (accountRecord: Account) => {
    return (
      (await hasActiveSessionToken(
        sessionTokensFn,
        accountRecord.uid,
        activeByDateTimestamp
      )) ||
      (await hasActiveRefreshToken(
        refreshTokensFn,
        accountRecord.uid,
        activeByDateTimestamp
      )) ||
      (await hasAccessToken(accessTokensFn, accountRecord.uid)) ||
      (await hasIapSubscription(accountRecord))
    );
  };

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
      if (!(await isActive(accountRecord))) {
        inactiveUids.push(accountRecord.uid);
      }
    }

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
