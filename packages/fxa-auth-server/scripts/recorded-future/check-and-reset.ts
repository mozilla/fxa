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

import crypto from 'crypto';
import { promisify } from 'util';

import { Command } from 'commander';
import { Container } from 'typedi';
import { StatsD } from 'hot-shots';
import createClient from 'openapi-fetch';

import appConfig from '../../config';
import logFn from '../../lib/log';
import { createDB } from '../../lib/db';
import oauthDb from '../../lib/oauth/db';
import * as butil from '../../lib/crypto/butil';
import PasswordFn from '../../lib/crypto/password';
import bouncesFn from '../../lib/bounces';
import sendersFn from '../../lib/senders';
import TokenFn from '../../lib/tokens';
import { emitStatsdMetrics } from '../lib/metrics';
import { collect, parseBooleanArg } from '../lib/args';
import { paths } from './identity-schema';
import {
  createCredentialsLookupFn,
  createCredentialsSearchFn,
  createFindAccountFn,
  createHasTotp2faFn,
  createVerifyPasswordFn,
  defaultPerPageLimit,
  fetchAllCredentialSearchResults,
  SearchResultIdentity,
} from './lib';
import { AppConfig } from '../../lib/types';
import { AccountEventsManager } from '../../lib/account-events';

type ResetableAccount = NonNullable<
  Awaited<ReturnType<ReturnType<typeof createFindAccountFn>>>
>;

const config = appConfig.getProperties();
const log = logFn({ name: 'recorded-future' });
const Token = TokenFn(log, config);
const Password = PasswordFn(log, config);
const DB = createDB(config, log, Token);

const searchDomain = 'accounts.firefox.com';
const resultsPerPageLimit = defaultPerPageLimit;
const statsd = new StatsD({ ...config.statsd });
const client = createClient<paths>({
  baseUrl: 'https://api.recordedfuture.com',
  headers: { 'X-RFToken': config.recordedFuture.identityApiKey },
});

Container.set(AppConfig, config);
Container.set(StatsD, statsd);

let authDb: Awaited<ReturnType<typeof DB.connect>> | null;

const checkAndReset = async () => {
  const program = new Command();
  const accountEmails = collect();

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
      '--concurrency [number]',
      'The max number of inflight active password verify and reset as well as per second rate limit.  Defaults to 100.',
      parseInt
    )
    .option(
      '--email [string]',
      'Email address of an account to reset.  Repeatable.',
      accountEmails,
      []
    )
    .option(
      '--dry-run [true|false]',
      'Print out the argument and configuration values that will be used in the execution of the script. Defaults to true.',
      parseBooleanArg,
      true
    );

  program.parse(process.argv);
  const resetWithEmailArgs = program.email.length > 0;

  if (resetWithEmailArgs) {
    console.log(
      '\nEmail arguments found.  ALL Recorded Future arguments will be ignored.'
    );
  }

  const firstDownloadedDatetime =
    program.firstDownloadedDate && !Number.isNaN(program.firstDownloadedDate)
      ? new Date(program.firstDownloadedDate)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const firstDownloadedDateIsoString = firstDownloadedDatetime
    .toISOString()
    .split('T')[0];

  const accountsToReset = await (async () => {
    if (!resetWithEmailArgs) {
      return await findLeakedAccounts(firstDownloadedDateIsoString);
    }

    const loginsFromEmailArgs = program.email.map((x) => ({
      login: x,
    }));
    const { accounts } = await getAccountsByLogin(loginsFromEmailArgs);
    return Array.from(accounts.values());
  })();

  if (program.dryRun) {
    console.log(`
Dry run mode is on.  It is the default; use '--dry-run false' when you are ready.

Domain: ${searchDomain}
Filter: first_downloaded_date_gte=${firstDownloadedDateIsoString}
Limit: ${resultsPerPageLimit}
Account emails to reset:
${accountsToReset.map((x) => `${`\t`}${x.email}`).join('\n')}
`);
    return 0;
  }

  if (accountsToReset.length === 0) {
    log.info('recordedFuture.info', 'No eligible accounts found.');
    return 0;
  }

  await resetAccounts(accountsToReset, resetWithEmailArgs);
  return 0;
};

async function findLeakedAccounts(firstDownloadedDate: string) {
  const accountsToReset: ResetableAccount[] = [];
  const usernamePropertiesFilter = ['Email'] as 'Email'[];
  const payload = {
    domains: [searchDomain],
    filter: {
      first_downloaded_gte: firstDownloadedDate,
      username_properties: usernamePropertiesFilter,
    },
    limit: resultsPerPageLimit,
  };

  const _credentialsSearchFn = createCredentialsSearchFn(client);
  const credentialsSearch = emitStatsdMetrics(
    _credentialsSearchFn,
    'recorded-future.identity.credentials-search',
    statsd
  );

  const leakedLogins = await fetchAllCredentialSearchResults(
    credentialsSearch,
    payload
  );

  if (leakedLogins.length === 0) {
    return [];
  }

  statsd.increment(
    'recorded-future.identity.credentials-search.results.total',
    leakedLogins.length
  );

  const { accounts, has2faCount } = await getAccountsByLogin(leakedLogins);
  if (accounts.size) {
    statsd.increment(
      'recorded-future.identity.credentials-search.results.account-emails',
      accounts.size
    );
  }
  if (has2faCount) {
    statsd.increment(
      'recorded-future.identity.credentials-search.results.2fa-accounts',
      has2faCount
    );
  }

  if (accounts.size === 0) {
    return [];
  }

  const accountsByLogin: Record<
    SearchResultIdentity['login'],
    ResetableAccount
  > = Array.from(accounts.entries()).reduce((acc, val) => {
    acc[val[0].login] = val[1];
    return acc;
  }, {});

  const credentialsLookupFn = createCredentialsLookupFn(client);
  const cleartextCredentials = await credentialsLookupFn(
    Array.from(accounts.keys()),
    {
      first_downloaded_gte: firstDownloadedDate,
    }
  );
  statsd.increment(
    'recorded-future.identity.credentials-lookup.cleartext-total',
    cleartextCredentials.length
  );

  const db = await getAuthDb();
  const verifyPassword = createVerifyPasswordFn(
    Password,
    db.checkPassword.bind(db)
  );

  for (const foundCredentials of cleartextCredentials) {
    const acct = accountsByLogin[foundCredentials.subject as string];
    const passwordMatched = await verifyPassword(foundCredentials, acct);

    if (passwordMatched) {
      accountsToReset.push(acct);
      statsd.increment(
        'recorded-future.identity.credentials-lookup.password-match'
      );
    }
  }

  return accountsToReset;
}

async function getAccountsByLogin(logins: SearchResultIdentity[]) {
  const findAcct = await getFindAccountFn();
  const hasTotp2FA = await getHasTotp2faFn();
  const accounts: Map<SearchResultIdentity, ResetableAccount> = new Map();
  let has2faCount = 0;

  for (const x of logins) {
    const acct = await findAcct(x.login);

    if (acct) {
      const has2FA = await hasTotp2FA(acct);

      if (!has2FA) {
        accounts.set(x, acct);
      } else {
        has2faCount++;
      }
    }
  }

  return { accounts, has2faCount };
}

async function resetAccounts(
  accountsToReset: ResetableAccount[],
  resetWithEmails: boolean
) {
  const authDb = await getAuthDb();
  const bounces = bouncesFn(config, authDb);
  const senders = await sendersFn(log, config, bounces, statsd);
  // the dynamically named `send\w+Email` functions are not in the type of senders.email
  const mailer: any = senders.email;
  const accountEventManager = new AccountEventsManager();

  for (const acct of accountsToReset) {
    try {
      await authDb.resetAccount(
        { uid: acct.uid },
        {
          authSalt: butil.ONES.toString('hex'),
          verifyHash: butil.ONES.toString('hex'),
          wrapWrapKb: crypto.randomBytes(32).toString('hex'),
          verifyHashVersion2: butil.ONES.toString('hex'),
          wrapWrapKbVersion2: crypto.randomBytes(32).toString('hex'),
          verifierVersion: 1,
        }
      );
      await oauthDb.removeTokensAndCodes(acct.uid);
      await mailer.sendPasswordChangeRequiredEmail(acct.emails, acct);
      await accountEventManager.recordSecurityEvent(authDb, {
        uid: acct.uid,
        name: 'account.must_reset',
        // loopback addr since this is not a user action
        ipAddr: '127.0.0.1',
      });

      if (!resetWithEmails) {
        statsd.increment(
          'recorded-future.identity.credentials-lookup.account-reset'
        );
      } else {
        statsd.increment('recorded-future.email-direct.account-reset');
      }

      log.info('account.forceReset', {
        uid: acct.uid,
        recordedFuture: !resetWithEmails,
      });
    } catch (err) {
      log.error('account.failedReset', {
        uid: acct.uid,
        recordedFuture: !resetWithEmails,
        error: err,
      });
    }
  }
}

async function getAuthDb() {
  if (authDb) {
    return authDb;
  }

  authDb = await DB.connect(config, undefined);
  return authDb;
}

async function getFindAccountFn() {
  const db = await getAuthDb();
  const getAccountRecord = db.accountRecord.bind(db);
  return createFindAccountFn(getAccountRecord);
}

async function getHasTotp2faFn() {
  const db = await getAuthDb();
  const getTotpToken = db.totpToken.bind(db);
  return createHasTotp2faFn(getTotpToken);
}

if (require.main === module) {
  checkAndReset()
    .then(
      (exitCode) => {
        statsd.increment('recorded-future.identity.script.success', {
          exitCode: `${exitCode}`,
        });
        return exitCode;
      },
      (err) => {
        log.error('recordedFuture.error', { error: err });
        statsd.increment('recorded-future.identity.script.error', {
          exitCode: '1',
        });
        return 1;
      }
    )
    .then((exitCode) => {
      return promisify(statsd.close)
        .bind(statsd)()
        .then(() => exitCode);
    })
    .then((exitCode: number) => process.exit(exitCode));
}
