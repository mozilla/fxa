/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { SubscriptionUpdater } from './update-subscriptions-to-new-plan/update-subscriptions-to-new-plan';
import Stripe from 'stripe';
import fs from 'fs';

const pckg = require('../package.json');

const parseBatchSize = (batchSize: string | number) => {
  return parseInt(batchSize.toString(), 10);
};

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

const parseProrationBehavior = (
  prorationBehavior: string
): Stripe.SubscriptionUpdateParams.ProrationBehavior => {
  if (
    prorationBehavior === 'none' ||
    prorationBehavior === 'always_invoice' ||
    prorationBehavior === 'create_prorations'
  ) {
    return prorationBehavior;
  }

  throw new Error('Invalid proration behavior');
};

const parsePlanIdMapPath = (planIdMapPath: string): Record<string, string> => {
  const planIdMap = JSON.parse(fs.readFileSync(planIdMapPath, 'utf-8'));

  const isObjectWithKeys = Object.keys(planIdMap).length;
  const isMapToString = Object.keys(planIdMap).every(
    (key) => typeof planIdMap[key] === 'string'
  );

  if (isObjectWithKeys && isMapToString) {
    return planIdMap;
  }

  throw new Error('Invalid planIdMap');
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
      'Output file to write report to. Will be output in CSV format.  Defaults to update-subscriptions-to-new-plan-output.csv.',
      'update-subscriptions-to-new-plan-output.csv'
    )
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe. Defaults to 70',
      70
    )
    .option(
      '-s, --plan-id-map-path [string]',
      'A file containing a JSON map where keys are strings representing source plan IDs, and values are the corresponding target plan ID'
    )
    .option(
      '-d, --destination [string]',
      'Destination Stripe plan ID. All customers on the source price ID will be moved to this price ID'
    )
    .option(
      '-p, --proration-behavior [string]',
      'The Stripe proration behavior to use. Can be one of "none", "always_invoice", or "create_prorations"',
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
  const prorationBehavior = parseProrationBehavior(program.prorationBehavior);
  const planIdMap = parsePlanIdMapPath(program.planIdMapPath);
  const dryRun = !!program.dryRun;
  if (!program.destination) throw new Error('--destination must be provided');

  const subscriptionPlanMover = new SubscriptionUpdater(
    planIdMap,
    prorationBehavior,
    batchSize,
    program.destination,
    stripeHelper,
    database,
    dryRun,
    rateLimit
  );

  await subscriptionPlanMover.update();

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
