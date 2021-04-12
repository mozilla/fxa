/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { setupAuthDatabase } from 'fxa-shared/db';
import { StatsD } from 'hot-shots';
import Container from 'typedi';

import error from '../lib/error';
import { CurrencyHelper } from '../lib/payments/currencies';
import { PayPalHelper } from '../lib/payments/paypal';
import { PayPalClient } from '../lib/payments/paypal-client';
import { PaypalProcessor } from '../lib/payments/paypal-processor';
import { StripeHelper } from '../lib/payments/stripe';
import { configureSentry } from '../lib/sentry';

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

  const translator = await require('../lib/senders/translator')(
    config.i18n.supportedLanguages,
    config.i18n.defaultLanguage
  );
  const senders = await require('../lib/senders')(
    log,
    config,
    error,
    translator,
    statsd
  );
  const redis = require('../lib/redis')(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const DB = require('../lib/db')(
    config,
    log,
    require('../lib/tokens')(log, config),
    require('../lib/crypto/random').base32(config.signinUnblock.codeLength)
  );
  let database = null;
  try {
    database = await DB.connect(config, redis);
  } catch (err) {
    log.error('DB.connect', { err: { message: err.message } });
    process.exit(1);
  }

  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
  const stripeHelper = new StripeHelper(log, config);
  Container.set(StripeHelper, stripeHelper);
  const paypalClient = new PayPalClient(
    config.subscriptions.paypalNvpSigCredentials
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
