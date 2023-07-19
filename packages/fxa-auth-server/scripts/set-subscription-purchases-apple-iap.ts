/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';

import { AppStoreHelper } from '../lib/payments/iap/apple-app-store/app-store-helper';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { SubscriptionPurchaseUpdater } from './set-subscription-purchases-apple-iap/set-subscription-purchases-apple-iap';

const pckg = require('../package.json');

const parseBatchSize = (batchSize: string | number) => {
  return parseInt(batchSize.toString(), 10);
};

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-b, --batch-size [number]',
      'Number of subscriptions to query from firestore at a time.  Defaults to 100.',
      100
    )
    // https://developer.apple.com/documentation/appstoreserverapi/identifying_rate_limits
    // We use the "Get All Subscription Statuses" endpoint
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Apple. Defaults to 50 rps',
      50
    )
    .option(
      '--dry-run',
      'List the originalTransactionIds that would be updated without actually updating'
    )
    .parse(process.argv);

  const { log } = await setupProcessingTaskObjects(
    'set-subscription-purchases-apple-iap'
  );

  const appStoreHelper = new AppStoreHelper();

  const batchSize = parseBatchSize(program.batchSize);
  const rateLimit = parseRateLimit(program.rateLimit);

  const dryRun = !!program.dryRun;

  const subscriptionPurchaseUpdater = new SubscriptionPurchaseUpdater(
    batchSize,
    appStoreHelper,
    log,
    dryRun,
    rateLimit
  );

  await subscriptionPurchaseUpdater.update();

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
