/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { setupAuthDatabase } from 'fxa-shared/db';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { FirestorePopulator } from './populate-firestore-customers/firestore-populator';

const pckg = require('../package.json');

export async function init() {
  const config = require('../config').default.getProperties();

  program
    .version(pckg.version)
    .option('-c, --config [config]', 'Configuration to use. Ex. dev')
    .option(
      '-r, --rate-limit [requestsPerSecond]',
      'Stripe rate limit. Defaults to 10 requests per second.',
      '10'
    )
    .parse(process.argv);

  const options = program.opts();
  const rateLimit = parseInt(options.rateLimit);

  // TODO: Build error. NODE_ENV is readonly
  // process.env.NODE_ENV = options.config || 'dev';
  const node_env = process.env.NODE_ENV;
  if (node_env !== (options.condition || 'dev')) {
    throw new Error('Unexpected NODE_ENV ' + node_env);
  }

  const { log, stripeHelper } = await setupProcessingTaskObjects(
    'populate-firestore-customers'
  );

  setupAuthDatabase(config.database.mysql.auth);
  const firestorePopulator = new FirestorePopulator(
    log,
    stripeHelper,
    rateLimit
  );

  await firestorePopulator.populate();

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
