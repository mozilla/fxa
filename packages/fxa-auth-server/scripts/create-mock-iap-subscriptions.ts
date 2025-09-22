/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';

const pckg = require('../package.json');
import * as mockIapSubscriptions from './create-mock-iap-subscriptions/mock-iap-subscriptions.json';
import { MockIapSubscriptionManager } from './create-mock-iap-subscriptions/mock-iap-subscription-manager';

export async function init() {
  program
    .version(pckg.version)
    .option('-u, --uid [uid]', 'User ID to create subscription for')
    .option(
      '--appStoreProductId [appStoreProductId]',
      'Any string. Should be present in a plan\'s "appStoreProductIds" metadata field'
    )
    .option(
      '--playSkuId [playSkuId]',
      'Any string. Should be present in a plan\'s "playSkuIds" metadata field'
    )
    .parse(process.argv);

  const options = program.opts();

  if (!options.uid) throw new Error('UID must be specified via --uid [uid]');

  await setupProcessingTaskObjects('create-mock-iap-subscriptions');

  const expiry = new Date();
  // Add 5 years for local testing (should be long enough!)
  const EXPIRES_IN_YEARS = 5;
  expiry.setFullYear(expiry.getFullYear() + EXPIRES_IN_YEARS);

  const appStoreSubs = mockIapSubscriptions.appStore.map((mockEntry) => ({
    ...mockEntry,
    userId: options.uid,
    expiresDate: expiry.getTime(),
    productId: options.appStoreProductId || mockEntry.productId,
  }));

  const playStoreSubs = mockIapSubscriptions.playStore.map((mockEntry) => ({
    ...mockEntry,
    userId: options.uid,
    expiryTimeMillis: expiry.getTime(),
    sku: options.playSkuId || mockEntry.sku,
  }));

  const mockIapSubscriptionManager = new MockIapSubscriptionManager();

  await mockIapSubscriptionManager.createAppStore(appStoreSubs);

  await mockIapSubscriptionManager.createPlayStore(playStoreSubs);

  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
