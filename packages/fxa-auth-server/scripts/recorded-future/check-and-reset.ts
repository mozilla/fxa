/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A script to check Recorded Future's Identity API for leaked credential, and
 * force an account reset on accounts with valid leaked credentials.
 *
 * This script relies on the same set of environment variables as the FxA auth
 * server.
 */

/**
 * The general steps are:
 *   1. Query Recorded Future's Identity credential search API endpoint to
 *   fetch new leaked credential since the previous check.
 *   2. For logins that are email addresses with an account in FxA, query
 *   credential lookup API endpoint to get the leaked credentials.
 *   3. For accounts with valid leaked plaintext passwords and no TOTP 2FA,
 *   reset the account.
 *   4. Send an email to the affected account holder to reset their password.
 */

import { promisify } from 'util';

import { Command } from 'commander';
import { StatsD } from 'hot-shots';
import createClient from 'openapi-fetch';

import appConfig from '../../config';
import logFn from '../../lib/log';
import { createDB } from '../../lib/db';
import TokenFn from '../../lib/tokens';
import { emitStatsdMetrics } from '../lib/metrics';
import { parseBooleanArg } from '../lib/args';
import { paths } from './identity-schema';
import {
  createCredentialsSearchFn,
  createFindAccountFn,
  createHasTotp2faFn,
  defaultPerPageLimit,
  fetchAllCredentialResults,
  isLoginAnEmailAddress,
  SearchResultIdentity,
} from './lib';

const config = appConfig.getProperties();
const searchDomain = 'accounts.firefox.com';
const resultsPerPageLimit = defaultPerPageLimit;
const statsd = new StatsD({ ...config.statsd });
const client = createClient<paths>({
  baseUrl: 'https://api.recordedfuture.com',
  headers: { 'X-RFToken': config.recordedFuture.identityApiKey },
});

const checkAndReset = async () => {
  const program = new Command();
  program
    .description(
      `Query Recorded Future's Identity API for leaked account credentials.  Accounts
with valid leaked credentials and without TOTP 2FA will be reset.  An email
will be sent to the account holder.`
    )
    .option(
      '--first-downloaded-date <date>',
      'The date after when the account credential was first downloaded by Recorded Future.  If not given, the date in UTC from 24 hours ago will be used.',
      Date.parse
    )
    .option(
      '--dry-run [true|false]',
      'Print out the argument and configuration values that will be used in the execution of the script. Defaults to true.',
      parseBooleanArg,
      true
    );

  program.parse(process.argv);

  const firstDownloadedDatetime =
    program.firstDownloadedDate && !Number.isNaN(program.firstDownloadedDate)
      ? new Date(program.firstDownloadedDate)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const firstDownloadedDateIsoString = firstDownloadedDatetime
    .toISOString()
    .split('T')[0];

  if (program.dryRun) {
    console.log(`
Dry run mode is on.  It is the default; use '--dry-run false' when you are ready.

Domain: ${searchDomain}
Filter: first_downloaded_date_gte=${firstDownloadedDateIsoString}
Limit: ${resultsPerPageLimit}
`);
    return 0;
  }

  const payload = {
    domains: [searchDomain],
    filter: {
      first_downloaded_gte: firstDownloadedDateIsoString,
    },
    limit: resultsPerPageLimit,
  };
  const _credentialsSearchFn = createCredentialsSearchFn(client);
  const credentialsSearch = emitStatsdMetrics(
    _credentialsSearchFn,
    'recorded-future.identity.credentials-search',
    statsd
  );
  const credentials = await fetchAllCredentialResults(
    credentialsSearch,
    payload
  );
  statsd.increment(
    'recorded-future.identity.credentials-search.results.total',
    credentials.length
  );

  const emailLoginIdentities = credentials.filter(isLoginAnEmailAddress);
  statsd.increment(
    'recorded-future.identity.credentials-search.results.email-logins',
    emailLoginIdentities.length
  );

  if (emailLoginIdentities.length === 0) {
    return 0;
  }

  const log = logFn({ name: 'recorded-future' });
  const Token = TokenFn(log, config);
  const DB = createDB(config, log, Token);
  const authDb = await DB.connect(config, undefined);

  const getAccountRecord = authDb.accountRecord.bind(authDb);
  const findAccount = createFindAccountFn(getAccountRecord);
  const getTotpToken = authDb.totpToken.bind(authDb);
  const hasTotp2FA = createHasTotp2faFn(getTotpToken);

  const accountEmails: SearchResultIdentity['login'][] = [];
  for (const identity of emailLoginIdentities) {
    const acct = await findAccount(identity.login);

    if (acct) {
      const has2FA = await hasTotp2FA(acct);

      if (!has2FA) {
        accountEmails.push(identity.login);
        statsd.increment(
          'recorded-future.identity.credentials-search.results.account-emails'
        );
      } else {
        statsd.increment(
          'recorded-future.identity.credentials-search.results.2fa-accounts'
        );
      }
    }
  }

  if (accountEmails.length === 0) {
    console.log('No account emails found.');
    return 0;
  }

  console.log(
    `Found ${credentials.length} results, of which ${accountEmails.length} are accounts without 2FA.`
  );

  await promisify(statsd.close).bind(statsd)();
  return 0;
};

if (require.main === module) {
  checkAndReset()
    .catch((err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .then((exitCode: number) => process.exit(exitCode));
}
