/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { StatsD } from 'hot-shots';
import Container from 'typedi';
import { promisify } from 'util';

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
      '-d, --delay [milliseconds]',
      'Amount of time to wait between processing customers.  Defaults to 100ms.',
      100
    )
    .option(
      '-m, --max-customers [customers]',
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
  const isDryRun = parseDryRun(program.dryRun);
  const limit = parseMaxCustomers(program.maxCustomers);
  const delay = parseInt(program.delay);

  const statsd = Container.get(StatsD);
  statsd.increment('set-stripe-customer-locations.startup');
  const customerLocations = new CustomerLocations({ log, stripeHelper });
  await customerLocations.backfillCustomerLocation({ limit, isDryRun, delay });
  statsd.increment('set-stripe-customer-locations.shutdown');
  await promisify(statsd.close).bind(statsd)();
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
