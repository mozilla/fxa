/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { ConfigType } from '../config';
import { AppConfig } from '../lib/types';
import GeoDB from 'fxa-geodb';
import Container from 'typedi';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { StripeAutomaticTaxConverter } from './convert-customers-to-stripe-automatic-tax/convert-customers-to-stripe-automatic-tax';

const pckg = require('../package.json');

const parseBatchSize = (batchSize: string | number) => {
  return parseInt(batchSize.toString(), 10);
};

const parseRateLimit = (rateLimit: string | number) => {
  return parseInt(rateLimit.toString(), 10);
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-b, --batch-size [number]',
      'Number of subscriptions to query from firestore at a time.  Defaults to 100.',
      100
    )
    .option(
      '-o, --output-file [string]',
      'Output file to write report to. Will be output in CSV format.  Defaults to stripe-tax-existing-customers-output.csv.',
      'stripe-tax-existing-customers-output.csv'
    )
    .option(
      '-i, --ip-address-map-file [string]',
      'IP address mapping file. Must be in [{ uid: "", remote_address_chain: "" }] format.',
      'ip-address-map-file.json'
    )
    .option(
      '-r, --rate-limit [number]',
      'Rate limit for Stripe. Defaults to 70',
      70
    )
    .parse(process.argv);

  const { stripeHelper, database } = await setupProcessingTaskObjects(
    'existing-customers-stripe-tax'
  );

  const batchSize = parseBatchSize(program.batchSize);
  const rateLimit = parseRateLimit(program.rateLimit);

  const config = Container.get<ConfigType>(AppConfig);
  const geodb = GeoDB(config.geodb);

  const stripeAutomaticTaxConverter = new StripeAutomaticTaxConverter(
    geodb,
    batchSize,
    program.outputFile,
    program.ipAddressMapFile,
    stripeHelper,
    rateLimit,
    database
  );

  await stripeAutomaticTaxConverter.convert();

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
