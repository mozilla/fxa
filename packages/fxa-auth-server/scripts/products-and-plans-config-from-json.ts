/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import path from 'path';
import Container from 'typedi';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { AppConfig } from '../lib/types';
import { ProductsAndPlansConfigFromJSON } from './stripe-products-and-plans-to-firestore-documents/products-and-plans-from-json-converter';

const pckg = require('../package.json');

const parseDryRun = (dryRun: boolean | string) => {
  return `${dryRun}`.toLowerCase() !== 'false';
};

const parseTargetDir = (targetDir: string) => path.normalize(targetDir);

async function init() {
  program
    .version(pckg.version)
    .option(
      '-n, --dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    )
    .option(
      '-d, --targetDir [string]',
      'If target is local, allows you to specify the directory for JSON. Defaults to current directory.',
      './payments-products-config-json'
    )
    .parse(process.argv);

  const { log } = await setupProcessingTaskObjects(
    'stripe-products-and-plans-to-firestore-documents'
  );

  const isDryRun = parseDryRun(program.dryRun);
  const targetDir = parseTargetDir(program.targetDir);

  const config = Container.get(AppConfig);

  const productsAndPlansFromJSON = new ProductsAndPlansConfigFromJSON({ log });

  await productsAndPlansFromJSON.convert({ isDryRun, targetDir });

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
