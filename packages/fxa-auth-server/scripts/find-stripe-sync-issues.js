#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const program = require('commander');
const pckg = require('../package.json');
const config = require('../config').getProperties();
const StatsD = require('hot-shots');

const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(
  config.log.level,
  'find-stripe-sync-issues',
  statsd
);
const Token = require('../lib/tokens')(log, config);
const DB = require('../lib/db')(config, log, Token);

function isNotFoundError(err) {
  return err.message === 'Unknown account';
}

async function init() {
  program
    .version(pckg.version)
    .option('-c, --config [config]', 'Configuration to use. Ex. dev')
    .option(
      '-k, --stripe-key [key]',
      'Stripe secret key to use - alternatively, use SUBHUB_STRIPE_APIKEY env var'
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

  const db = await DB.connect(config[config.db.backend]);

  const createStripeHelper = require('../lib/payments/stripe');
  const stripeHelper = createStripeHelper(log, config);
  const stripe = stripeHelper.stripe;

  const limit = program.limit ? parseInt(program.limit) : Infinity;
  let count = 0;

  for await (const customer of stripe.customers.list()) {
    const {
      id,
      email,
      metadata: { userid },
    } = customer;
    try {
      if (!userid) {
        continue;
      }
      // const user = await db.account(userid);

      let record;
      try {
        // First attempt to locate by email address
        record = await db.accountRecord(email);
      } catch (err) {
        if (!isNotFoundError(err)) {
          throw err;
        }
      }
      if (!record) {
        try {
          // Now try to locate via the userid on file
          if (!userid.match(/[0-9a-zA-Z]{32}/)) {
            console.log(`${count}: ${id} / ${userid} has invalid uid`);
            continue;
          }
          record = await db.account(userid);
        } catch (err) {
          if (isNotFoundError(err)) {
            console.log(`${count}: ${id} / ${userid} not in FxA database`);
            continue;
          }
          throw err;
        }
      }
      // Verify the email matches
      if (record.primaryEmail.email !== email) {
        console.log(
          `${count}: EMAIL MISMATCH ${id} / ${userid} is in database with email of ${record.primaryEmail.email}`
        );
      }
      // Verify the uid matches
      if (record.uid !== userid) {
        console.log(
          `${count}: UID MISMATCH ${id} / ${userid} is in database with uid of ${record.uid}`
        );
      }
    } catch (err) {
      console.log(`${count}: ${id} / ${userid} failed - ${err.message}`);
      console.error(err);
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
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .then(result => process.exit(result));
