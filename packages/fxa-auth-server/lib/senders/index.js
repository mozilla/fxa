/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const createMailer = require('./email');
const createSms = require('./sms');

module.exports = async (
  log,
  config,
  error,
  translator,
  oauthdb,
  statsd,
  sender // This is only used in tests
) => {
  const defaultLanguage = config.i18n.defaultLanguage;
  const Mailer = createMailer(log, config, oauthdb);

  async function createSenders() {
    const templates = await require('./templates')(log, translator);
    return {
      email: new Mailer(translator, templates, config.smtp, sender),
      sms: createSms(log, translator, templates, config, statsd),
    };
  }

  function splitEmails(emails) {
    return emails.reduce(
      (result, item) => {
        const { email } = item;

        if (item.isPrimary) {
          result.to = email;
        } else if (item.isVerified) {
          result.cc.push(email);
        }

        return result;
      },
      { cc: [] }
    );
  }

  const senders = await createSenders();
  const mailer = senders.email;

  // Most of the mailer methods follow a standard pattern that we can wrap procedurally
  // to set common options like acceptLanguage, ccEmails, email and uid...
  senders.email = Object.entries(Mailer.prototype)
    .filter(
      ([name, fn]) =>
        typeof fn === 'function' && name[0] !== '_' && name.endsWith('Email')
    )
    .reduce(
      (wrappedMailer, [name]) => {
        const wrappedName = `send${name[0].toUpperCase()}${name.substr(1)}`;

        wrappedMailer[wrappedName] = (emails, account, options = {}) => {
          const { to, cc } = splitEmails(emails);

          // We can't invoke fn directly here because some of the tests monkey-patch mailer
          return mailer[name]({
            ...options,
            acceptLanguage: options.acceptLanguage || defaultLanguage,
            ccEmails: cc,
            email: to || account.email,
            uid: account.uid,
          });
        };

        return wrappedMailer;
      },
      {
        translator(...args) {
          return mailer.translator.apply(mailer, args);
        },
        stop() {
          return mailer.stop();
        },
        _ungatedMailer: mailer,
      }
    );

  // ...but a couple of them don't conform so we've retained the old manual wrapping code.
  senders.email.sendVerifySecondaryEmail = (emails, account, options) => {
    return mailer.verifySecondaryEmail({
      ...options,
      acceptLanguage: options.acceptLanguage || defaultLanguage,
      email: emails[0].email,
      primaryEmail: account.email,
      uid: account.uid,
    });
  };

  senders.email.sendVerifySecondaryCodeEmail = (emails, account, options) => {
    return mailer.verifySecondaryCodeEmail({
      ...options,
      acceptLanguage: options.acceptLanguage || defaultLanguage,
      email: emails[0].email,
      primaryEmail: account.email,
      uid: account.uid,
    });
  };

  senders.email.sendPostVerifySecondaryEmail = (emails, account, options) => {
    return mailer.postVerifySecondaryEmail({
      ...options,
      acceptLanguage: options.acceptLanguage || defaultLanguage,
      email: account.primaryEmail.email,
    });
  };

  return senders;
};
