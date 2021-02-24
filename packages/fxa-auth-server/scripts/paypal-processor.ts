/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { PayPalHelper } from 'fxa-auth-server/lib/payments/paypal';
import { setupAuthDatabase } from 'fxa-shared/db';
import { StatsD } from 'hot-shots';
import Container from 'typedi';

import { PaypalProcessor } from '../lib/payments/paypal-processor';
import { StripeHelper } from '../lib/payments/stripe';
import { configureSentry } from '../lib/sentry';

const pckg = require('../package.json');
const config = require('../config').getProperties();

export async function init() {
  configureSentry(undefined, config);
  // Establish database connection and bind instance to Model using Knex
  setupAuthDatabase(config.database.mysql.auth);

  const statsd = config.statsd.enabled
    ? new StatsD({
        ...config.statsd,
        errorHandler: (err) => {
          // eslint-disable-next-line no-use-before-define
          log.error('statsd.error', err);
        },
      })
    : {
        increment: () => {},
        timing: () => {},
        close: () => {},
      };
  Container.set(StatsD, statsd);

  const log = require('../lib/log')({ ...config.log, statsd });

  program
    .version(pckg.version)
    .option('-g, --grace [days]', 'Grace days to allow. Defaults to 1.', '1')
    .option(
      '-r, --retries [times]',
      'Retry attempts to per day. Defaults to 1.',
      '1'
    )
    .option(
      '-i, --invoice-age [hours]',
      'How old the invoice must be to get processed. Defaults to 6.',
      '6'
    )
    .parse(process.argv);

  const stripeHelper = new StripeHelper(log, config);
  Container.set(StripeHelper, stripeHelper);
  const paypalHelper = new PayPalHelper({ log });
  Container.set(PayPalHelper, paypalHelper);

  const processor = new PaypalProcessor(
    log,
    config,
    parseInt(program.grace),
    parseInt(program.retries),
    parseInt(program.invoice_age)
  );
  await processor.processInvoices();
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
