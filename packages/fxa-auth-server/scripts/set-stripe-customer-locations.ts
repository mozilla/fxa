/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';

import { CustomerLocations } from '../lib/payments/customer-locations';
import { setupProcesingTaskObjects } from '../lib/payments/processing-tasks-setup';

const pckg = require('../package.json');

const parseDryRun = (dryRun: boolean | string) => {
  return `${dryRun}`.toLowerCase() !== 'false';
};

const parseMaxCustomers = (maxCustomers: number | string) => {
  const max = parseInt(`${maxCustomers}`);
  return max === 0 ? Infinity : max;
};

async function init() {
  program
    .version(pckg.version)
    .option(
      '-p, --gcp-project-name <string>',
      'The GCP project name for the metrics logs table. This is used for inferring past PayPal customer locations.'
    )
    .option(
      '-i, --gcp-dataset-id <string>',
      'The dataset id for the specified GCP project.'
    )
    .option(
      '-l, --gcp-dataset-location <string>',
      'The dataset location for the specified GCP dataset.'
    )
    .option(
      '-t, --gcp-table-name <string>',
      'The table name for the specified GCP dataset.'
    )
    .option(
      '-d, --delay [milliseconds]',
      'Amount of time to wait between processing customers.  Defaults to 100ms.',
      100
    )
    .option(
      '-m, --max-customers [number]',
      'The maximum number of customers to process. 0 = all customers.  Defaults to all.',
      0
    )
    .option(
      '-n, --dry-run [true|false]',
      'Print what the script would do instead of performing the action.  Defaults to true.',
      true
    )
    .parse(process.argv);

  const { log, stripeHelper } = await setupProcesingTaskObjects(
    'set-stripe-customer-location'
  );

  // GCP credentials are stored in the GOOGLE_APPLICATION_CREDENTIALS env var
  // See https://cloud.google.com/docs/authentication/getting-started
  const projectName = program.gcpProjectName;
  const datasetId = program.gcpDatasetId;
  const datasetLocation = program.gcpDatasetLocation;
  const tableName = program.gcpTableName;
  if (!projectName) {
    throw new Error(
      'GCP project name (--gcp-project-name) argument is required.'
    );
  }
  if (!datasetId) {
    throw new Error('GCP dataset ID (--gcp-dataset-id) argument is required.');
  }
  if (!datasetLocation) {
    throw new Error(
      'GCP dataset location (--gcp-dataset-location) argument is required.'
    );
  }
  if (!tableName) {
    throw new Error('GCP table name (--gcp-table-name) argument is required.');
  }

  const isDryRun = parseDryRun(program.dryRun);
  const limit = parseMaxCustomers(program.maxCustomers);
  const delay = parseInt(program.delay);

  const customerLocations = new CustomerLocations({
    log,
    stripeHelper,
    projectName,
    datasetId,
    datasetLocation,
    tableName,
  });
  await customerLocations.backfillCustomerLocation({ limit, isDryRun, delay });
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
