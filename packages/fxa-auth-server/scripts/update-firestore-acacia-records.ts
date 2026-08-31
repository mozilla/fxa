/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { parseBooleanArg } from './lib/args';

import { FirestoreAcaciaUpdater } from './update-firestore-acacia-records/update-firestore-acacia-records';

const pckg = require('../package.json');

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

async function init() {
  program
    .version(pckg.version)
    .option('-r, --rate-limit [number]', 'Rate limit for Stripe', 30)
    .option(
      '--dry-run [true|false]',
      'Report outdated records instead of resyncing them. Defaults to true.',
      true
    )
    .parse(process.argv);

  const { stripeHelper, log } = await setupProcessingTaskObjects(
    'update-firestore-acacia-records'
  );

  const rateLimit = parseRateLimit(program.rateLimit);
  const isDryRun = parseBooleanArg(program.dryRun);

  const acaciaUpdater = new FirestoreAcaciaUpdater(
    stripeHelper,
    rateLimit,
    log,
    isDryRun
  );

  await acaciaUpdater.run();

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
