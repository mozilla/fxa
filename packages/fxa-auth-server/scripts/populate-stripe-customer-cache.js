#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const program = require('commander');
const pckg = require('../package.json');

async function init() {
  program
    .version(pckg.version)
    .option('-c, --config [config]', 'Configuration to use. Ex. dev')
    .option(
      '-k, --stripe-key [key]',
      'Stripe secret key to use - alternatively, use SUBHUB_STRIPE_APIKEY env var'
    )
    .option(
      '-a, --starting-after [id]',
      'Start processing customers after [id] in reverse order of creation date'
    )
    .option(
      '-b, --ending-before [id]',
      'Stop processing customers before [id] in reverse order of creation date'
    )
    .option(
      '-l, --limit [num]',
      'Only request [num] customer records to process'
    )
    .parse(process.argv);

  process.env.NODE_ENV = program.config || 'dev';

  if (program.stripeKey) {
    process.env.SUBHUB_STRIPE_APIKEY = program.stripeKey;
  }

  const config = require('../config').getProperties();
  const log = require('../lib/log')(config.log.level);

  const createStripeHelper = require('../lib/payments/stripe');
  const stripeHelper = createStripeHelper(log, config);
  const stripe = stripeHelper.stripe;

  const listOpts = {};
  if (program.startingAfter) {
    listOpts['starting_after'] = program.startingAfter;
  }
  if (program.endingBefore) {
    listOpts['ending_before'] = program.endingBefore;
  }

  const limit = program.limit ? parseInt(program.limit) : Infinity;
  let count = 0;

  for await (const customer of stripe.customers.list(listOpts)) {
    const {
      id,
      email,
      metadata: { userid },
    } = customer;
    try {
      const fetchedCustomer = await stripeHelper.refreshCachedCustomer(
        userid,
        email
      );
      if (fetchedCustomer) {
        console.log(
          `${count}: ${id} / ${userid} refreshed - ${fetchedCustomer.subscriptions.data.length} subscriptions found`
        );
      } else {
        console.log(`${count}: ${id} / ${userid} - no customer record found?`);
      }
    } catch (err) {
      console.log(`${count}: ${id} / ${userid} failed - ${err.message}`);
    }

    // HACK: limit option for stripe.customers.list seems ignored while using autopagination
    if (++count === limit) {
      console.log(`Limit reached, stopping at ${id}`);
      break;
    }
  }

  return 0;
}

init()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .then((result) => process.exit(result));
