/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import path from 'path';
import Container from 'typedi';
import { setupFirestore } from '../lib/firestore-db';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { AppConfig, AuthFirestore, AuthLogger } from '../lib/types';
import { ProductsAndPlansConfigFromJSON } from './stripe-products-and-plans-to-firestore-documents/products-and-plans-from-json-converter';

const pckg = require('../package.json');
const config = require('../config').getProperties();

const parseDryRun = (dryRun: boolean | string) => {
  return `${dryRun}`.toLowerCase() !== 'false';
};

const parseSourceDirectory = (targetDir: string) => path.normalize(targetDir);

async function init() {
  program
    .version(pckg.version)
    .option(
      '-n, --dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    )
    .option(
      '-s, --sourceOption [file|directory]',
      'Select the source location of the JSON files. Defaults to "file".',
      'file'
    )
    .option(
      '-d, --sourceDirectory [string]',
      'If target is local, allows you to specify the directory for JSON. Defaults to current directory.',
      './payments-products-config-json'
    )
    .option(
      '-f, --sourceFile [string]',
      'Specify a source file with location of JSON files to load.',
      './files.txt'
    )
    .parse(process.argv);

  // Only setup required dependencies
  Container.set(AppConfig, config);
  const log = require('../lib/log')({ ...config.log });
  Container.set(AuthLogger, log);
  if (!Container.has(AuthFirestore)) {
    const authFirestore = setupFirestore(config);
    Container.set(AuthFirestore, authFirestore);
  }

  const isDryRun = parseDryRun(program.dryRun);
  const sourceOption = program.sourceOption;
  const sourceDirectory = parseSourceDirectory(program.sourceDirectory);
  const sourceFile = program.sourceFile;

  const productsAndPlansFromJSON = new ProductsAndPlansConfigFromJSON({ log });

  await productsAndPlansFromJSON.convert({
    isDryRun,
    sourceOption,
    sourceDirectory,
    sourceFile,
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
