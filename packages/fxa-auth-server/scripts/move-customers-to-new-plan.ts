/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { CustomerPlanMover } from './move-customers-to-new-plan/move-customers-to-new-plan';

const pckg = require('../package.json');

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
      'Output file to write report to. Will be output in CSV format.  Defaults to move-customers-to-new-plan-output.csv.',
      'move-customers-to-new-plan-output.csv'
    )
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe. Defaults to 70',
      70
    )
    .option(
      '-s, --source [string]',
      'Source Stripe plan ID. All customers on this price ID will be moved off of this price ID'
    )
    .option(
      '-d, --destination [string]',
      'Destination Stripe plan ID. All customers on the source price ID will be moved to this price ID'
    )
    .option(
      '-e, --exclude [string]',
      'Do not touch customers if they have a subscription to a price in this list',
      ''
    )
    .option(
      '--dry-run',
      'List the customers that would be deleted without actually deleting'
    )
    .parse(process.argv);

  const { stripeHelper, database } = await setupProcessingTaskObjects(
    'move-customers-to-new-plan'
  );

  const batchSize = parseBatchSize(program.batchSize);
  const rateLimit = parseRateLimit(program.rateLimit);
  const excludePlanIds = parseExcludePlanIds(program.exclude);

  const dryRun = !!program.dryRun;
  if (!program.source) throw new Error('--source must be provided');
  if (!program.destination) throw new Error('--destination must be provided');

  const customerPlanMover = new CustomerPlanMover(
    program.source,
    program.destination,
    excludePlanIds,
    batchSize,
    program.outputFile,
    stripeHelper,
    database,
    dryRun,
    rateLimit
  );

  await customerPlanMover.convert();

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
