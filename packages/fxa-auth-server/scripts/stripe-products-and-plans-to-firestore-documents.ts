/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import path from 'path';
import Container from 'typedi';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { AppConfig } from '../lib/types';
import { parseBooleanArg } from './lib/args';
import {
  OutputTarget,
  StripeProductsAndPlansConverter,
} from './stripe-products-and-plans-to-firestore-documents/stripe-products-and-plans-converter';

const pckg = require('../package.json');

const parseTarget = (target: any): OutputTarget => {
  if (Object.values(OutputTarget).includes(target)) {
    return target;
  } else {
    throw new Error('Invalid target option.');
  }
};

const parseTargetPath = (targetDir: string) => path.normalize(targetDir);

async function init() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'Did you forget to set GOOGLE_APPLICATION_CREDENTIALS for GCP API access?'
    );
  }

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
    .option(
      '-t, --target [firestore|local]',
      'Target that should be updated. Defaults to firestore.',
      'firestore'
    )
    .option(
      '-d, --targetDir [string]',
      'If target is local, allows you to specify the directory for JSON. Defaults to current directory.',
      './payments-products-config-json'
    )
    .parse(process.argv);

  const { log, stripeHelper } = await setupProcessingTaskObjects(
    'stripe-products-and-plans-to-firestore-documents'
  );

  const isDryRun = parseBooleanArg(program.dryRun);
  const target = parseTarget(program.target);
  const targetDir = parseTargetPath(program.targetDir);
  const productId = program.productId;

  const config = Container.get(AppConfig);

  const stripeProductsAndPlansConverter = new StripeProductsAndPlansConverter({
    log,
    stripeHelper,
    supportedLanguages: config.i18n.supportedLanguages,
  });
  await stripeProductsAndPlansConverter.convert({
    productId,
    isDryRun,
    target,
    targetDir,
  });
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
