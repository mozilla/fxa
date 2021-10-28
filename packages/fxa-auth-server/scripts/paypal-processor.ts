/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import Container from 'typedi';
import { PayPalHelper } from '../lib/payments/paypal';
import { PayPalClient } from '../lib/payments/paypal-client';

import { setupProcesingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { PaypalProcessor } from '../lib/payments/paypal-processor';

const pckg = require('../package.json');
const config = require('../config').getProperties();

export async function init() {
  // Load program options
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
      'How old in hours the invoice must be to get processed. Defaults to 6.',
      '6'
    )
    .parse(process.argv);

  const { log, database, senders } = await setupProcesingTaskObjects();

  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials,
    log
  );
  Container.set(PayPalClient, paypalClient);
  const paypalHelper = new PayPalHelper({ log });
  Container.set(PayPalHelper, paypalHelper);

  const processor = new PaypalProcessor(
    log,
    config,
    parseInt(program.grace),
    parseInt(program.retries),
    parseInt(program.invoiceAge),
    database,
    senders.email
  );
  await processor.processInvoices();
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
