/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import Container from 'typedi';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { AppConfig } from '../lib/types';
import { StripeProductsAndPlansConverter } from './stripe-products-and-plans-to-firestore-documents/stripe-products-and-plans-converter';

const pckg = require('../package.json');

const parseDryRun = (dryRun: boolean | string) => {
  return `${dryRun}`.toLowerCase() !== 'false';
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-n, --dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    )
    .option(
      '-p, --productId [string]',
      'The Stripe product ID for a single product to process. Defaults to all products.',
      ''
    )
    .parse(process.argv);

  const { log, stripeHelper } = await setupProcessingTaskObjects(
    'stripe-products-and-plans-to-firestore-documents'
  );

  const isDryRun = parseDryRun(program.dryRun);
  const productId = program.productId;

  const config = Container.get(AppConfig);

  const stripeProductsAndPlansConverter = new StripeProductsAndPlansConverter({
    log,
    stripeHelper,
    supportedLanguages: config.i18n.supportedLanguages,
  });
  await stripeProductsAndPlansConverter.load();
  await stripeProductsAndPlansConverter.convert({ productId, isDryRun });
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
