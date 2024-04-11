/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { StatsD } from 'hot-shots';
import Container from 'typedi';
import { promisify } from 'util';
import * as Sentry from '@sentry/node';

import { setupProcessingTaskObjects } from '../lib/payments/processing-tasks-setup';
import { SubscriptionReminders } from '../lib/payments/subscription-reminders';

import pckg from '../package.json';

const DEFAULT_PLAN_LENGTH = 180;
const DEFAULT_REMINDER_LENGTH = 14;

Sentry.init({});

async function init() {
  program
    .version(pckg.version)
    .option(
      '-p, --plan-length [days]',
      'Plan length in days beyond which a reminder email before the next recurring charge should be sent. Defaults to 180.',
      DEFAULT_PLAN_LENGTH.toString()
    )
    .option(
      '-r, --reminder-length [days]',
      'Reminder length in days before the renewal date to send the reminder email. Defaults to 14.',
      DEFAULT_REMINDER_LENGTH.toString()
    )
    .parse(process.argv);

  const { log, database, senders, stripeHelper } =
    await setupProcessingTaskObjects('subscription-reminders');

  const subscriptionReminders = new SubscriptionReminders(
    log,
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
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: 'subscription-reminders',
    status: 'in_progress',
  });

  init()
    .then(() => {
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: 'subscription-reminders',
        status: 'ok',
      });
      return Sentry.close(2000);
    })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: 'subscription-reminders',
        status: 'error',
      });
      return Sentry.close(2000);
    })
    .then(() => {
      process.exit(1);
    });
}
