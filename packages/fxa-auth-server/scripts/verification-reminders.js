/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// This script will fetch and remove any expired verification reminder
// records from Redis, then send the appropriate emails to the address
// associated with each account. If email fails to send for some reason,
// the affected verification reminders will be reinstated.
//
// It doesn't take any arguments and doesn't include any looping logic.
// It's expected that it will be invoked at regular intervals on the
// fxa-admin box.

import configModule1 from '../config';

import error from '../lib/error';
import logModule from "../lib/log";
const log = logModule(config.log);
import jwt from '../lib/oauth/jwt';
import verificationRemindersModule from "../lib/verification-reminders";
const verificationReminders = verificationRemindersModule(log, config);
import Sentry from '@sentry/node';

import cadRemindersModule from "../lib/cad-reminders";
const cadReminders = cadRemindersModule(configModule1.getProperties(), log);
import subscriptionAccountRemindersModule from "../lib/subscription-account-reminders";
const subscriptionAccountReminders = subscriptionAccountRemindersModule(log, configModule1.getProperties());

Sentry.init({});
const checkInId = Sentry.captureCheckIn({
  monitorSlug: 'verification-reminders',
  status: 'in_progress',
});

run()
  .then(() => {
    log.info('verificationReminders.done', {});
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: 'verification-reminders',
      status: 'ok',
    });
    return Sentry.close(2000);
  })
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    log.error('verificationReminders.fatal', { err });
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: 'verification-reminders',
      status: 'error',
    });
    return Sentry.close(2000);
  })
  .then(() => {
    process.exit(1);
  });

async function run() {
  const [vReminders, saReminders, cReminders, db] = await Promise.all([
    verificationReminders.process(),
    subscriptionAccountReminders.process(),
    cadReminders.process(),
    require(`../lib/db`)(config, log, {}, {}).connect(config),
  ]);
  const bounces = require(`../lib/bounces`)(config, db);
  const Mailer = require(`../lib/senders/email`)(log, config, bounces);

  const mailer = new Mailer(config.smtp);

  const sent = {};

  await verificationReminders.keys.reduce(async (promise, key) => {
    await promise;

    const method = `verificationReminder${key[0].toUpperCase()}${key.substr(
      1
    )}Email`;
    const reminders = vReminders[key];

    log.info('verificationReminders.processing', {
      count: reminders.length,
      key,
    });

    const failedReminders = await reminders.reduce(
      async (promise, { timestamp, uid, flowId, flowBeginTime }) => {
        const failed = await promise;

        try {
          if (sent[uid]) {
            // Don't send e.g. first and second reminders to the same email from a single batch
            log.info('verificationReminders.skipped.alreadySent', { uid });
            failed.push({ timestamp, uid, flowId, flowBeginTime });
            return failed;
          }

          const account = await db.account(uid);
          await mailer[method]({
            acceptLanguage: account.locale,
            code: account.emailCode,
            email: account.email,
            flowBeginTime,
            flowId,
            uid,
          });
          // eslint-disable-next-line require-atomic-updates
          sent[uid] = true;
        } catch (err) {
          const { errno } = err;
          switch (errno) {
            case error.ERRNO.ACCOUNT_UNKNOWN:
            case error.ERRNO.BOUNCE_COMPLAINT:
            case error.ERRNO.BOUNCE_HARD:
            case error.ERRNO.BOUNCE_SOFT:
              log.info('verificationReminders.skipped.error', { uid, errno });
              try {
                await verificationReminders.delete(uid);
              } catch (ignore) {}
              break;
            default:
              log.error('verificationReminders.error', { err });
              failed.push({ timestamp, uid, flowId, flowBeginTime });
          }
        }

        return failed;
      },
      Promise.resolve([])
    );

    if (failedReminders.length > 0) {
      log.info('verificationReminders.reinstating', {
        count: reminders.length,
        key,
      });
      return verificationReminders.reinstate(key, failedReminders);
    }
  }, Promise.resolve());

  await subscriptionAccountReminders.keys.reduce(async (promise, key) => {
    await promise;
    const method = `subscriptionAccountReminder${key[0].toUpperCase()}${key.substr(
      1
    )}Email`;
    const reminders = saReminders[key];

    log.info('subscriptionAccountReminder.processing', {
      count: reminders.length,
      key,
    });

    const failedReminders = await reminders.reduce(
      async (
        promise,
        {
          timestamp,
          uid,
          flowId,
          flowBeginTime,
          deviceId,
          productId,
          productName,
        }
      ) => {
        const failed = await promise;

        try {
          if (sent[uid]) {
            // Don't send e.g. first and second reminders to the same email from a single batch
            log.info('subscriptionAccountReminder.skipped.alreadySent', {
              uid,
            });
            failed.push({
              timestamp,
              uid,
              flowId,
              flowBeginTime,
              deviceId,
              productId,
              productName,
            });
            return failed;
          }

          const account = await db.account(uid);
          const token = await jwt.sign(
            { uid },
            {
              header: {
                typ: 'fin+JWT',
              },
            }
          );
          await mailer[method]({
            acceptLanguage: account.locale,
            code: account.emailCode,
            email: account.email,
            accountVerified: account.verifierSetAt > 0,
            token: token,
            flowBeginTime,
            flowId,
            uid,
            deviceId,
            productId,
            productName,
          });
          // eslint-disable-next-line require-atomic-updates
          sent[uid] = true;
        } catch (err) {
          const { errno } = err;
          switch (errno) {
            case error.ERRNO.ACCOUNT_UNKNOWN:
            case error.ERRNO.BOUNCE_COMPLAINT:
            case error.ERRNO.BOUNCE_HARD:
            case error.ERRNO.BOUNCE_SOFT:
              log.info('subscriptionAccountReminder.skipped.error', {
                uid,
                errno,
              });
              try {
                await subscriptionAccountReminders.delete(uid);
              } catch (ignore) {}
              break;
            default:
              log.error('subscriptionAccountReminder.error', { err });
              failed.push({
                timestamp,
                uid,
                flowId,
                flowBeginTime,
                deviceId,
                productId,
                productName,
              });
          }
        }

        return failed;
      },
      Promise.resolve([])
    );

    if (failedReminders.length > 0) {
      log.info('subscriptionAccountReminder.reinstating', {
        count: reminders.length,
        key,
      });
      return subscriptionAccountReminders.reinstate(key, failedReminders);
    }
  }, Promise.resolve());

  // TODO: This is intentionally an exact copy of the above code
  // since CAD reminders are an experiment. At the end we'll either
  // refactor reminders into a better abstraction of remove this code.
  await cadReminders.keys.reduce(async (promise, key) => {
    await promise;

    const method = `cadReminder${key[0].toUpperCase()}${key.substr(1)}Email`;
    const reminders = cReminders[key];

    log.info('cadReminders.processing', {
      count: reminders.length,
      key,
    });

    await reminders.reduce(
      async (promise, { timestamp, uid, flowId, flowBeginTime }) => {
        const failed = await promise;

        try {
          if (sent[uid]) {
            // Don't send e.g. first and second reminders to the same email from a single batch
            log.info('cadReminders.skipped.alreadySent', { uid });
            failed.push({ timestamp, uid, flowId, flowBeginTime });
            return failed;
          }

          const account = await db.account(uid);
          await mailer[method]({
            acceptLanguage: account.locale,
            code: account.emailCode,
            email: account.email,
            flowBeginTime,
            flowId,
            uid,
          });
          // eslint-disable-next-line require-atomic-updates
          sent[uid] = true;
        } catch (err) {
          const { errno } = err;
          switch (errno) {
            case error.ERRNO.ACCOUNT_UNKNOWN:
            case error.ERRNO.BOUNCE_COMPLAINT:
            case error.ERRNO.BOUNCE_HARD:
            case error.ERRNO.BOUNCE_SOFT:
              log.info('cadReminders.skipped.error', { uid, errno });
              try {
                await cadReminders.delete(uid);
              } catch (ignore) {}
              break;
            default:
              log.error('cadReminders.error', { err });
              failed.push({ timestamp, uid, flowId, flowBeginTime });
          }
        }

        return failed;
      },
      Promise.resolve([])
    );
  }, Promise.resolve());

  await db.close();
  await verificationReminders.close();
  await subscriptionAccountReminders.close();
  await cadReminders.close();
}
