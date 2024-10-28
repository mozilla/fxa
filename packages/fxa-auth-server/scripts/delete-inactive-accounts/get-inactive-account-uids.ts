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
import * as oauthDb from '../../lib/oauth/db';
import { Account, SecurityEvent } from 'fxa-shared/db/models/auth';
import { EVENT_NAMES } from 'fxa-shared/db/models/auth/security-event';
import { SessionToken } from 'fxa-shared/models/SessionToken';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { getAccountCustomerByUid } from 'fxa-shared/db/models/auth';
import { PlayBilling } from '../../lib/payments/iap/google-play';
import { PlaySubscriptions } from '../../lib/payments/iap/google-play/subscriptions';
import { AppleIAP } from '../../lib/payments/iap/apple-app-store/apple-iap';
import { AppStoreSubscriptions } from '../../lib/payments/iap/apple-app-store/subscriptions';

const setDateToUTC = (someDate) => {
  const utcDate = new Date(someDate);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
};

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

  const fd = fs.openSync(filepath, 'a');

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
  Container.get(PlayBilling);
  const playSubscriptions = Container.get(PlaySubscriptions);
  Container.get(AppleIAP);
  const appStoreSubscriptions = Container.get(AppStoreSubscriptions);

  const accountWhereAndOrderBy = () =>
    Account.query()
      .where('emailVerified', 1)
      .where('createdAt', '>=', startDateTimestamp)
      .where('createdAt', '<', endDateTimestamp)
      .orderBy('createdAt', 'asc')
      .orderBy('uid', 'asc');
  const accountQueryBuilder = () =>
    accountWhereAndOrderBy()
      .select('uid')
      .limit(program.resultsLimit || 100000);

  const securityEventQueryBuilder = () =>
    SecurityEvent.query()
      .select('id')
      .where('createdAt', '>=', activeByDateTimestamp)
      .limit(1);
  const accountLoginSecurityEventQueryBuilder = () =>
    securityEventQueryBuilder().where('nameId', EVENT_NAMES['account.login']);
  const passwordResetSecurityEventQueryBuilder = () =>
    securityEventQueryBuilder().where(
      'nameId',
      EVENT_NAMES['account.password_reset_success']
    );
  const passwordChangeSecurityEventQueryBuilder = () =>
    securityEventQueryBuilder().where(
      'nameId',
      EVENT_NAMES['account.password_changed']
    );

  const hasActiveSessionToken = async (accountRecord: Account) => {
    const sessionTokens = await fxaDb.sessions(accountRecord.uid);
    return sessionTokens.some(
      (token: SessionToken) => token.lastAccessTime >= activeByDateTimestamp
    );
  };
  const hasVerifiedAnEmail = async (accountRecord: Account) => {
    const emails = await fxaDb.accountEmails(accountRecord.uid);
    return emails.some(
      (e) => e.verifiedAt && e.verifiedAt >= activeByDateTimestamp
    );
  };
  const hasActiveRefreshToken = async (accountRecord: Account) => {
    const refreshTokens = await oauthDb.getRefreshTokensByUid(
      accountRecord.uid
    );
    return refreshTokens.some((t) => t.lastUsedAt >= activeByDateTimestamp);
  };
  const hasAccessToken = async (accountRecord: Account) => {
    const accessTokens = await oauthDb.getAccessTokensByUid(accountRecord.uid);
    return accessTokens.length > 0;
  };
  const hasSecurityEvent = async (accountRecord: Account) => {
    const uidBuffer = uuidTransformer.to(accountRecord.uid);
    return (
      !!(await accountLoginSecurityEventQueryBuilder()
        .where('uid', uidBuffer)
        .first()) ||
      !!(await passwordResetSecurityEventQueryBuilder()
        .where('uid', uidBuffer)
        .first()) ||
      !!(await passwordChangeSecurityEventQueryBuilder()
        .where('uid', uidBuffer)
        .first())
    );
  };
  const isStripeCustomer = async (accountRecord: Account) =>
    !!(await getAccountCustomerByUid(accountRecord.uid));
  const hasIapSubscription = async (accountRecord: Account) =>
    (await playSubscriptions.getSubscriptions(accountRecord.uid)).length > 0 ||
    (await appStoreSubscriptions.getSubscriptions(accountRecord.uid)).length >
      0;
  const hasSubscription = async (accountRecord: Account) =>
    (await isStripeCustomer(accountRecord)) ||
    (await hasIapSubscription(accountRecord));

  const isActive = async (accountRecord: Account) => {
    return (
      (await hasActiveSessionToken(accountRecord)) ||
      (await hasVerifiedAnEmail(accountRecord)) ||
      (await hasActiveRefreshToken(accountRecord)) ||
      (await hasAccessToken(accountRecord)) ||
      (await hasSecurityEvent(accountRecord)) ||
      (await hasSubscription(accountRecord))
    );
  };

  if (isDryRun) {
    const acctsCount: any = await accountWhereAndOrderBy()
      .count({ total: 'uid' })
      .first();
    console.log(`Number of accounts to be processed: ${acctsCount.total}`);
    return 0;
  }

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
