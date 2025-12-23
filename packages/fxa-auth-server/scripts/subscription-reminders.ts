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
import { CustomerManager, SubscriptionManager } from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { ChurnInterventionService } from '@fxa/payments/management';
import { initSubplat } from '../lib/payments/initSubplat';
import { parseInt } from 'lodash';
import { parseBooleanArg } from './lib/args';

const DEFAULT_PLAN_LENGTH = 180;
const DEFAULT_REMINDER_LENGTH = 14;
const DEFAULT_ENDING_REMINDER_DAILY_LENGTH = 0;
const DEFAULT_ENDING_REMINDER_MONTHLY_LENGTH = 7;
const DEFAULT_ENDING_REMINDER_YEARLY_LENGTH = 14;

Sentry.init({});

async function init() {
  program
    .version(pckg.version)
    .allowUnknownOption(true)
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
    .option(
      '-e, --enableEndingReminders [boolean]',
      'Enable the sending of subscription ending reminder emails. Defaults to false.',
      false
    )
    .option(
      '-d, --ending-reminder-daily-length [days]',
      'Reminder length in days before the daily subscription ending date to send the reminder email. Defaults to 0.',
      DEFAULT_ENDING_REMINDER_DAILY_LENGTH.toString()
    )
    .option(
      '-m, --ending-reminder-monthly-length [days]',
      'Reminder length in days before the montly subscription ending date to send the reminder email. Defaults to 7.',
      DEFAULT_ENDING_REMINDER_MONTHLY_LENGTH.toString()
    )
    .option(
      '-y, --ending-reminder-yearly-length [days]',
      'Reminder length in days before the yearly subscription ending date to send the reminder email. Defaults to 14.',
      DEFAULT_ENDING_REMINDER_YEARLY_LENGTH.toString()
    )
    .parse(process.argv);

  const { log, database, senders, stripeHelper, config } =
    await setupProcessingTaskObjects('subscription-reminders');
  await initSubplat({
    loggerName: 'subscription-reminders',
    legacyLog: log,
    config,
  });

  const statsd = Container.get(StatsD);
  const subscriptionManager = Container.get(SubscriptionManager);
  const customerManager = Container.get(CustomerManager);
  const churnInterventionService = Container.get(ChurnInterventionService);
  const productConfigurationManager = Container.get(
    ProductConfigurationManager
  );

  const subscriptionReminders = new SubscriptionReminders(
    log,
    parseInt(program.planLength),
    parseInt(program.reminderLength),
    {
      enabled: parseBooleanArg(program.enableEndingReminders),
      paymentsNextUrl: config.smtp.subscriptionSettingsUrl,
      dailyReminderDays: parseInt(program.endingReminderDailyLength),
      monthlyReminderDays: parseInt(program.endingReminderMonthlyLength),
      yearlyReminderDays: parseInt(program.endingReminderYearlyLength),
    },
    database,
    senders.email,
    statsd,
    stripeHelper,
    subscriptionManager,
    customerManager,
    churnInterventionService,
    productConfigurationManager
  );
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
