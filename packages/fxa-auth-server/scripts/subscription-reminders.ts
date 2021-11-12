/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { StatsD } from 'hot-shots';
import Container from 'typedi';
import { promisify } from 'util';

import { setupProcesingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { SubscriptionReminders } from '../lib/payments/subscription-reminders';

const pckg = require('../package.json');
const config = require('../config').getProperties();

const DEFAULT_PLAN_LENGTH = 180;
const DEFAULT_REMINDER_LENGTH = 14;

async function init() {
  program
    .version(pckg.version)
    .option(
      '-p, --plan-length [days]',
      'Plan length in days beyond which a reminder email before the next recurring charge should be sent. Defaults to 180.',
      DEFAULT_PLAN_LENGTH
    )
    .option(
      '-r, --reminder-length [days]',
      'Reminder length in days before the renewal date to send the reminder email. Defaults to 14.',
      DEFAULT_REMINDER_LENGTH
    )
    .parse(process.argv);

  const { log, database, senders, stripeHelper } =
    await setupProcesingTaskObjects('subscription-reminders');

  const subscriptionReminders = new SubscriptionReminders(
    log,
    config,
    parseInt(program.planLength),
    parseInt(program.reminderLength),
    database,
    senders.email,
    stripeHelper
  );
  const statsd = Container.get(StatsD);
  statsd.increment('subscription-reminders.startup');
  await subscriptionReminders.sendReminders();
  statsd.increment('subscription-reminders.shutdown');
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
