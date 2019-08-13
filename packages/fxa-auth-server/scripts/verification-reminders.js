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

const ROOT_DIR = '..';
const LIB_DIR = `${ROOT_DIR}/lib`;

const config = require(`${ROOT_DIR}/config`).getProperties();

const error = require(`${LIB_DIR}/error`);
const log = require(`${LIB_DIR}/log`)(config.log);
const oauthdb = require(`${LIB_DIR}/oauthdb`)(log, config);
const Promise = require(`${LIB_DIR}/promise`);
const verificationReminders = require(`${LIB_DIR}/verification-reminders`)(
  log,
  config
);

const Mailer = require(`${LIB_DIR}/senders/email`)(log, config, oauthdb);

run()
  .then(() => {
    log.info('verificationReminders.done', {});
    process.exit(0);
  })
  .catch(err => {
    log.error('verificationReminders.fatal', { err });
    process.exit(1);
  });

async function run() {
  const [
    allReminders,
    db,
    templates,
    subscriptionTemplates,
    translator,
  ] = await Promise.all([
    verificationReminders.process(),
    require(`${LIB_DIR}/db`)(config, log, {}, {}).connect(
      config[config.db.backend]
    ),
    require(`${LIB_DIR}/senders/templates`).init(),
    require(`${LIB_DIR}/senders/subscription-templates`)(log),
    require(`${LIB_DIR}/senders/translator`)(
      config.i18n.supportedLanguages,
      config.i18n.defaultLanguage
    ),
  ]);

  const mailer = new Mailer(
    translator,
    templates,
    subscriptionTemplates,
    config.smtp
  );

  const sent = {};

  await verificationReminders.keys.reduce(async (promise, key) => {
    await promise;

    const method = `verificationReminder${key[0].toUpperCase()}${key.substr(
      1
    )}Email`;
    const reminders = allReminders[key];

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

  await db.close();
  await oauthdb.close();
  await verificationReminders.close();
}
