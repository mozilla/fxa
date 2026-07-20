/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';

import { FirestoreStripeSyncChecker } from './check-firestore-stripe-sync/check-firestore-stripe-sync';

const pckg = require('../package.json');

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe',
      30
    )
    .parse(process.argv);

  const { stripeHelper, log } = await setupProcessingTaskObjects(
    'check-firestore-stripe-sync'
  );

  const rateLimit = parseRateLimit(program.rateLimit);

  const syncChecker = new FirestoreStripeSyncChecker(
    stripeHelper,
    rateLimit,
    log,
  );

  await syncChecker.run();

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
