/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Command } from 'commander';
import { AccountCustomers } from 'fxa-shared/db/models/auth';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';

import appConfig from '../config';
import {
  AccountDeleteManager,
  ReasonForDeletionOptions,
} from '../lib/account-delete';
import * as random from '../lib/crypto/random';
import DB from '../lib/db';
import { setupFirestore } from '../lib/firestore-db';
import initLog from '../lib/log';
import oauthDb from '../lib/oauth/db';
import { CurrencyHelper } from '../lib/payments/currencies';
import { createStripeHelper, StripeHelper } from '../lib/payments/stripe';
import { pushboxApi } from '../lib/pushbox';
import initRedis from '../lib/redis';
import Token from '../lib/tokens';
import { AppConfig, AuthFirestore, AuthLogger } from '../lib/types';
import { parseDryRun } from './lib/args';

const dryRun = async (program: Command, limit: number) => {
  const countQuery = AccountCustomers.query()
    .leftJoin('accounts', function () {
      this.on('accountCustomers.uid', '=', 'accounts.uid');
    })
    .whereNull('accounts.uid')
    .count({ count: 'accountCustomers.uid' })
    .first();
  const result = (await countQuery) as unknown as { count: number };
  const fyi = (count: number) =>
    `The script will try to clean up ${count} partial accounts when not in dry-run mode.`;

  if (limit < Infinity && limit <= result.count) {
    console.log(fyi(limit));
  } else {
    console.log(fyi(result.count));
  }

  return 0;
};

const init = async () => {
  const program = new Command();
  program
    .description(
      'Enqueue account deletes to Cloud Task using uids that exist in accountCustomer\n' +
        'but no longer in accounts.\n\n' +
        'Deleting accounts could lead to Stripe API calls so the targetted Cloud Task\n' +
        'queue should be configured with a rate limit below the Stripe API rate limit.\n' +
        'The Stripe rate limit is 100/sec; 50/sec for cloud tasks seems reasonble.  YMMV.'
    )
    .option('--limit', 'The number of delete tasks to enqueue.')
    .option(
      '--dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    );

  program.parse(process.argv);
  const isDryRun = parseDryRun(program.dryRun);
  const limit = program.limit ? parseInt(program.limit) : Infinity;
  const reason = ReasonForDeletionOptions.Cleanup;

  if (limit <= 0) {
    throw new Error('The limit should be a positive integer.');
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
  // connect to db here so the dry run could get a row count
  const fxaDb = await db.connect(config, redis);

  if (isDryRun) {
    console.log(
      'Dry run mode is on.  It is the default; use --dry-run=false when you are ready.'
    );

    return dryRun(program, limit);
  }

  const pushbox = pushboxApi(log, config, statsd);
  Container.set(AppConfig, config);
  Container.set(AuthLogger, log);
  const authFirestore = setupFirestore(config);
  Container.set(AuthFirestore, authFirestore);
  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
  const stripeHelper = createStripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);

  const accountDeleteManager = new AccountDeleteManager({
    fxaDb,
    oauthDb,
    config,
    push: {} as any, // Push isn't needed for enqueuing
    pushbox,
    statsd,
  });

  const query = AccountCustomers.query()
    .select({ uid: 'accountCustomers.uid' })
    .leftJoin('accounts', function () {
      this.on('accountCustomers.uid', '=', 'accounts.uid');
    })
    .whereNull('accounts.uid');

  if (limit < Infinity) {
    query.limit(limit);
  }

  const rows = await query;

  for (const x of rows) {
    const result = await accountDeleteManager.enqueue({ uid: x.uid, reason });
    console.log(`Created cloud task ${result} for uid ${x.uid}`);
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
