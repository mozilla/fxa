/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { CartCleanup } from './cleanup-old-carts/cleanup-old-carts';
import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';

const pckg = require('../package.json');

const anonymizeableFields = new Set(['taxAddress'] as const);

const parseDeleteBefore = (deleteBefore: string | number) => {
  const date = new Date(deleteBefore);
  if (!date.getTime()) {
    throw new Error('deleteBefore is invalid');
  }
  return date;
};

const parseAnonymizeBefore = (anonymizeBefore: string | number) => {
  if (!anonymizeBefore) {
    return null;
  }
  const date = new Date(anonymizeBefore);
  if (!date.getTime()) {
    throw new Error('anonymizeBefore is invalid');
  }
  return date;
};

const parseAnonymizeFields = (
  anonymizeFields: string
): typeof anonymizeableFields | null => {
  if (!anonymizeFields) {
    return null;
  }
  const fields = new Set(anonymizeFields.split(','));
  for (const field of fields) {
    if (!(anonymizeableFields as Set<string>).has(field)) {
      throw new Error(`Invalid anonymized field name: ${field}`);
    }
  }
  return fields as typeof anonymizeableFields;
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-d, --delete-before [string]',
      'An ISO 8601 date string.  All carts last updated before this date will be deleted.'
    )
    .option(
      '-a, --anonymize-before [string]',
      'An ISO 8601 date string.  All carts last updated before this date will be anonymized.'
    )
    .option(
      '-f, --anonymize-fields [string]',
      `A comma separated list of fields. Can be any of: ${[
        ...anonymizeableFields,
      ].join(', ')}`
    )
    .parse(process.argv);

  const { config } = await setupProcessingTaskObjects('cleanup-old-carts');

  const database = await setupAccountDatabase(config.database.mysql.auth);

  const deleteBefore = parseDeleteBefore(program.deleteBefore);
  const anonymizeBefore = parseAnonymizeBefore(program.anonymizeBefore);
  const anonymizeFields = parseAnonymizeFields(program.anonymizeFields);

  if (anonymizeBefore && !anonymizeFields) {
    throw new Error(
      'Anonymize fields must be provided if anonymize before is used'
    );
  }

  const cartCleanup = new CartCleanup(
    deleteBefore,
    anonymizeBefore,
    anonymizeFields,
    database
  );

  await cartCleanup.run();

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
