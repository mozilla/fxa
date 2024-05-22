/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { PlanCanceller } from './cancel-subscriptions-to-plan/cancel-subscriptions-to-plan';
import { PayPalHelper } from '../lib/payments/paypal';
import { PayPalClient } from '@fxa/payments/paypal';
import { Container } from 'typedi';

const pckg = require('../package.json');
const config = require('../config').default.getProperties();

const parseBatchSize = (batchSize: string | number) => {
  return parseInt(batchSize.toString(), 10);
};

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

const parseExcludePlanIds = (planIds: string) => {
  return planIds.split(',');
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-b, --batch-size [number]',
      'Number of subscriptions to query from firestore at a time.  Defaults to 100.',
      100
    )
    .option(
      '-o, --output-file [string]',
      'Output file to write report to. Will be output in CSV format.  Defaults to cancel-subscriptions-to-plan.csv.',
      'cancel-subscriptions-to-plan.csv'
    )
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe. Defaults to 70',
      70
    )
    .option(
      '-p, --price [string]',
      'Stripe plan ID. All customers on this price ID will have their subscriptions cancelled'
    )
    .option(
      '-e, --exclude [string]',
      'Do not touch customers if they have a subscription to a price in this list',
      ''
    )
    .option(
      '--refund',
      "Refund the customer's entire last bill to their card, regardless of any remaining time"
    )
    .option(
      '--prorate',
      'Prorate the customers remaining time. Cannot be used with --refund'
    )
    .option(
      '--dry-run',
      'List the customers that would be deleted without actually deleting'
    )
    .parse(process.argv);

  const { stripeHelper, database, log } = await setupProcessingTaskObjects(
    'cancel-subscriptions-to-plan'
  );

  console.log('CREDENTIALS', config.subscriptions.paypalNvpSigCredentials);
  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials
  );
  Container.set(PayPalClient, paypalClient);

  const paypalHelper = new PayPalHelper({
    log,
  });

  const batchSize = parseBatchSize(program.batchSize);
  const rateLimit = parseRateLimit(program.rateLimit);
  const excludePlanIds = parseExcludePlanIds(program.exclude);

  const dryRun = !!program.dryRun;
  if (!program.price) throw new Error('--price must be provided');
  if (program.prorate && program.refund)
    throw new Error('--prorate and --refund cannot be used together');

  const planCanceller = new PlanCanceller(
    program.price,
    program.refund,
    program.prorate,
    excludePlanIds,
    batchSize,
    program.outputFile,
    stripeHelper,
    paypalHelper,
    database,
    dryRun,
    rateLimit
  );

  await planCanceller.run();

  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
