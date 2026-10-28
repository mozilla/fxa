/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { promisify } from 'util';
import { program } from 'commander';
import { BigQuery } from '@google-cloud/bigquery';
import { StatsD } from 'hot-shots';
import Container from 'typedi';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { parseBooleanArg } from './lib/args';
import { emitStatsdMetrics } from './lib/metrics';
import { SubplatActiveAccounts } from './subplat-active-accounts/subplat-active-accounts';

const pckg = require('../package.json');

const QUALIFIED_TABLE_ID_PATTERN =
  /^[a-z][a-z0-9-]{2,28}[a-z0-9]\.[a-zA-Z0-9_]{1,1024}\.[a-zA-Z0-9_]{1,1024}$/;

const parsePositiveInt = (value: string) => {
  const parsed = Number(value);
  if (!/^[1-9][0-9]*$/.test(value) || !Number.isSafeInteger(parsed)) {
    throw new Error(`Expected a positive integer, got ${value}`);
  }
  return parsed;
};

const closeStatsd = (statsd: StatsD) =>
  statsd instanceof StatsD
    ? promisify(statsd.close).bind(statsd)()
    : Promise.resolve();

async function init() {
  program
    .version(pckg.version)
    .requiredOption(
      '--table <project.dataset.table>',
      'BigQuery table to replace with the active SubPlat account uids.'
    )
    .option(
      '--max-ended-age-days <number>',
      'Include subscriptions that ended within this many days. Defaults to 730.',
      parsePositiveInt,
      730
    )
    .option(
      '--dry-run [true|false]',
      'Collect and count the uids without writing to BigQuery. Defaults to true.',
      parseBooleanArg,
      true
    )
    .parse(process.argv);
  const options = program.opts();

  if (!QUALIFIED_TABLE_ID_PATTERN.test(options.table)) {
    throw new Error(
      `Invalid --table ${options.table}; expected project.dataset.table`
    );
  }

  const { log } = await setupProcessingTaskObjects('subplat-active-accounts');
  const statsd = Container.get(StatsD);

  const activeAccounts = new SubplatActiveAccounts(
    new BigQuery(),
    statsd,
    log,
    options.maxEndedAgeDays,
    options.dryRun
  );

  try {
    await emitStatsdMetrics(
      (table: string) => activeAccounts.run(table),
      'subplat-active-accounts.run',
      statsd
    )(options.table);
  } finally {
    await closeStatsd(statsd);
  }

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((result) => {
      exitStatus = result;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
