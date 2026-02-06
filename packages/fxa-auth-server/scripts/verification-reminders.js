#!/usr/bin/env node -r esbuild-register

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

'use strict';

const config = require('../config').default.getProperties();

const { AppError: error } = require('@fxa/accounts/errors');
const log = require('../lib/log')(config.log);
const jwt = require('../lib/oauth/jwt');
const verificationReminders = require('../lib/verification-reminders')(
  log,
  config
);
const Sentry = require('@sentry/node');
const cadReminders = require('../lib/cad-reminders')(config, log);
const subscriptionAccountReminders =
  require('../lib/subscription-account-reminders')(log, config);
const { EmailSender } = require('@fxa/accounts/email-sender');
const {
  EmailLinkBuilder,
  NodeRendererBindings,
} = require('@fxa/accounts/email-renderer');
const { FxaMailer } = require('../lib/senders/fxa-mailer');
const { FxaMailerFormat } = require('../lib/senders/fxa-mailer-format');
const { join } = require('path');
const { StatsD } = require('hot-shots');


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
  const { createDB } = require('../lib/db');
  const [vReminders, saReminders, cReminders, db] = await Promise.all([
    verificationReminders.process(),
    subscriptionAccountReminders.process(),
    cadReminders.process(),
    createDB(config, log, {}, {}).connect(config),
  ]);
  const bounces = require('../lib/bounces')(config, db);
  const Mailer = require('../lib/senders/email')(log, config, bounces);

  const mailer = new Mailer(config.smtp);
  // fxa-mailer setup
  const statsd = config.statsd.enabled
    ? new StatsD({
        ...config.statsd,
        errorHandler: (err) => {
          // eslint-disable-next-line no-use-before-define
          log.error('statsd.error', err);
        },
      })
    : {
        increment: () => {},
        timing: () => {},
        close: () => {},
      };
  const emailSender = new EmailSender(config.smtp, bounces, statsd, log);
  const linkBuilderConfig = {
    baseUri: config.contentServer.url,
    ...config.smtp,
  };
  const linkBuilder = new EmailLinkBuilder(linkBuilderConfig);
  const fxaMailer = new FxaMailer(
    emailSender,
    linkBuilder,
    config.smtp,
    new NodeRendererBindings({
      translations: {
        // TODO: Once this PR, https://github.com/mozilla/fxa-content-server-l10n/pull/989, is finalized we can:
        //  - switch this to point libs/accounts/public/locales or ../public/locales (either is probably fine...)
        //  - switch to using emails.ftl, since all email specific strings will have been migrated over
        basePath: join(__dirname, '../public/locales'),
        ftlFileName: 'auth.ftl',
      },
    })
  );

  // since these are sent via a scheduled job, we need to fabricate a request object
  // for the fxa-mailer formatting functions
  const request = {
    app: {
      clientAddress: '',
      isMetricsEnabled: () => true,
      metricsContext: () => ({}),
      ua: {},
      geo: {
        timeZone: 'UTC',
        location: {
          city: '',
          state: '',
          stateCode: '',
          country: '',
          countryCode: '',
        },
      },
      acceptLanguage: 'en',
    },
    auth: {},
    headers: {
      'user-agent': '',
    },
  };

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
          // NOTE: If we need to disable these for any reason, the `method` names will
          // be the old mailer style `verificationReminderFirstEmail`, not just the template
          // name `verificationReminderFirst`.
          if (fxaMailer.canSend(method)) {
            // because of how verification-reminders keys are defined, we need to additionally
            // prepend 'send' and capitalize the first letter to match the full method name in fxa-mailer
            const fxaMailerMethod = `send${method[0].toUpperCase()}${method.substring(1)}`;
            await fxaMailer[fxaMailerMethod]({
              ...FxaMailerFormat.account(account),
              ...(await FxaMailerFormat.metricsContext(request)),
              ...FxaMailerFormat.localTime(request),
              ...FxaMailerFormat.location(request),
              ...FxaMailerFormat.device(request),
              ...FxaMailerFormat.sync(false),
              email: account.email,
              code: account.emailCode,
              flowBeginTime,
              flowId,
              uid,
            });
          } else {
            await mailer[method]({
              acceptLanguage: account.locale,
              code: account.emailCode,
              email: account.email,
              flowBeginTime,
              flowId,
              uid,
            });
          }
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
          if (fxaMailer.canSend(method)) {
            const fxaMailerMethod = `send${method[0].toUpperCase()}${method.substring(1)}`;
            await fxaMailer[fxaMailerMethod]({
              ...FxaMailerFormat.account(account),
              ...(await FxaMailerFormat.metricsContext(request)),
              ...FxaMailerFormat.localTime(request),
              ...FxaMailerFormat.location(request),
              ...FxaMailerFormat.device(request),
              ...FxaMailerFormat.sync('sync'),
              productName: 'Firefox',
            });
          } else {
            await mailer[method]({
              acceptLanguage: account.locale,
              code: account.emailCode,
              email: account.email,
              flowBeginTime,
              flowId,
              uid,
            });
          }
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
