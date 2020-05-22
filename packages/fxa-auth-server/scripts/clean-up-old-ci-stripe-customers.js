#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
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
      '-e, --email-pattern [pattern]',
      'Regex to match against email addresses (default: signin.*@restmail.net)'
    )
    .option(
      '-g, --max-age [int]',
      'Maximum age in seconds before deletion of customer (default: 86400, i.e. one day)'
    )
    .option(
      '-d, --dry-run',
      'List the customers that would be deleted without actually deleting'
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

  if (!process.env.CONFIG_FILES) {
    // When run in local development, we might have a Stripe API key in secrets.json
    process.env.CONFIG_FILES = path.join(__dirname, '../config/secrets.json');
  }

  // We don't need caching here and this skips creating a Redis connection.
  process.env.SUBHUB_PLANS_CACHE_TTL_SECONDS = 0;

  const config = require('../config').getProperties();
  const log = require('../lib/log')(config.log.level);

  if (!config.subscriptions.stripeApiKey) {
    // When this is run in CI for pull requests on forks, the Stripe key
    // will be withheld. We should bail out without error in that case.
    console.warn('Stripe API key missing, skipping customer clean up.');
    process.exit(0);
  }

  if (!/.*_test_.*/.test(config.subscriptions.stripeApiKey)) {
    console.error(
      'Stripe API key appears not to be a test mode key! Bailing out!'
    );
    process.exit(1);
  }

  const createStripeHelper = require('../lib/payments/stripe');
  const stripeHelper = createStripeHelper(log, config, null);
  const stripe = stripeHelper.stripe;

  const listOpts = {};
  if (program.startingAfter) {
    listOpts['starting_after'] = program.startingAfter;
  }
  if (program.endingBefore) {
    listOpts['ending_before'] = program.endingBefore;
  }

  const dryRun = !!program.dryRun;
  const emailPattern = program.emailPattern || 'signin.*@restmail.net';
  const emailRegexp = new RegExp(emailPattern);
  const maxAge = Number.parseInt(program.maxAge || 86400);
  const now = Date.now() / 1000;

  const limit = program.limit ? parseInt(program.limit) : Infinity;
  let count = 0;
  let deletedCount = 0;

  if (dryRun) {
    console.log('Dry run, no customers will be deleted!');
  }

  for await (const customer of stripe.customers.list(listOpts)) {
    const {
      id,
      email,
      created,
      metadata: { userid },
    } = customer;
    try {
      const age = now - created;
      if (age < maxAge || !emailRegexp.test(email)) {
        continue;
      }
      console.log(`${id} - email: ${email} uid: ${userid} age: ${age}`);
      if (!dryRun) {
        const deletedCustomer = await stripe.customers.del(id);
        console.log(`Deleted ${deletedCustomer.id}`);
        deletedCount++;
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

  console.log(`Deleted ${deletedCount} customers.`);

  return 0;
}

init()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .then((result) => process.exit(result));
