/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { StripeCustomerEmailSyncer } from './sync-stripe-customer-emails/sync-stripe-customer-emails';

const pckg = require('../package.json');

const parseRateLimit = (rateLimit: string | number) =>
  parseInt(rateLimit.toString(), 10);

const parseLimit = (limit: string | number) => {
  const n = parseInt(limit.toString(), 10);
  return Number.isFinite(n) ? n : Infinity;
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '--no-dry-run',
      'Apply Stripe customer email updates. By default the script runs in dry-run mode and reports without writing.'
    )
    .option(
      '-l, --limit [number]',
      'Maximum number of Stripe customers to process before stopping.',
      parseLimit,
      Infinity
    )
    .option(
      '--starting-after [stripe_id]',
      'Stripe customer ID to resume listing after.'
    )
    .option(
      '-r, --rate-limit [number]',
      'Maximum Stripe write operations per second.',
      parseRateLimit,
      70
    )
    .option(
      '-o, --output-file [string]',
      'CSV output file path.',
      'sync-stripe-customer-emails-output.csv'
    )
    .parse(process.argv);

  const { stripeHelper, database, log } = await setupProcessingTaskObjects(
    'sync-stripe-customer-emails'
  );

  const syncer = new StripeCustomerEmailSyncer(
    stripeHelper,
    database,
    log,
    {
      dryRun: !!program.dryRun,
      limit: program.limit,
      startingAfter: program.startingAfter,
      rateLimit: program.rateLimit,
      outputFile: program.outputFile,
    }
  );

  await syncer.run();

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((result) => {
      exitStatus = result;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
