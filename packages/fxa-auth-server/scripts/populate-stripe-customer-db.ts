/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
const pckg = require('../package.json');
import { Stripe } from 'stripe';

import { setupAuthDatabase } from 'fxa-shared/db';
import {
  accountExists,
  createAccountCustomer,
} from 'fxa-shared/db/models/auth';

export async function init() {
  const config = require('../config').getProperties();

  program
    .version(pckg.version)
    .option('-c, --config [config]', 'Configuration to use. Ex. dev')
    .option(
      '-k, --stripe-key [key]',
      'Stripe secret key to use - alternatively, use SUBHUB_STRIPE_APIKEY env var'
    )
    .parse(process.argv);

  process.env.NODE_ENV = program.config || 'dev';

  if (program.stripeKey) {
    process.env.SUBHUB_STRIPE_APIKEY = program.stripeKey;
  }

  if (process.env.SUBHUB_STRIPE_APIKEY === undefined) {
    console.log('Unable to execute script without a Stripe Key defined.');
    return 1;
  }
  const stripe = new Stripe(process.env.SUBHUB_STRIPE_APIKEY, {
    apiVersion: '2020-08-27',
    maxNetworkRetries: 3,
  });

  // TODO: Setup Logger and StatsD
  setupAuthDatabase(config.database.mysql.auth);

  await processCustomers(stripe);

  return 0;
}

async function processCustomers(stripe: Stripe) {
  let count = 0;

  for await (const customer of stripe.customers.list()) {
    const uid = customer.metadata.userid;
    const stripeCustomerId = customer.id;
    if (uid === undefined) {
      continue;
    }
    const logPrefix = `${count}: uid ${uid} stripeId ${stripeCustomerId}`;

    const msg = await processStripeCustomer(uid, stripeCustomerId);

    console.log(`${logPrefix} - ${msg}`);
    count++;
  }
}

export async function processStripeCustomer(
  uid: string,
  stripeCustomerId: string
) {
  try {
    if (await accountExists(uid)) {
      await createAccountCustomer(uid, stripeCustomerId);
      return 'CustomerAccount record successfully created.';
    } else {
      return 'Firefox account not found.';
    }
  } catch (err) {
    return `Failed to create record: ${err.message}`;
  }
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
