/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { StripeAutomaticTaxConverter } from './convert-customers-to-stripe-automatic-tax/convert-customers-to-stripe-automatic-tax';

const pckg = require('../package.json');

const parseDryRun = (dryRun: boolean | string) => {
  return `${dryRun}`.toLowerCase() !== 'false';
};

const parseBatchSize = (batchSize: string | number) => {
  return parseInt(batchSize.toString(), 10);
};

const parseOutputFile = (outputFile: string) => {
  return outputFile;
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
      '-b, --batch-size [number]',
      'Number of subscriptions to query from firestore at a time.  Defaults to 100.',
      100
    )
    .option(
      '-o, --output-file [string]',
      'Output file to write report to. Will be output in CSV format.  Defaults to stripe-tax-existing-customers-output.csv.',
      'stripe-tax-existing-customers-output.csv'
    )
    .parse(process.argv);

  const { stripeHelper } = await setupProcessingTaskObjects(
    'existing-customers-stripe-tax'
  );

  const isDryRun = parseDryRun(program.dryRun);
  const batchSize = parseBatchSize(program.batchSize);
  const outputFile = parseOutputFile(program.outputFile);

  const stripeAutomaticTaxConverter = new StripeAutomaticTaxConverter(
    isDryRun,
    batchSize,
    outputFile,
    stripeHelper.stripe
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
