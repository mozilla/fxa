/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const createMailer = require('./email');
const createSms = require('./sms');

module.exports = async (log, config, error, translator, oauthdb, sender) => {
  const defaultLanguage = config.i18n.defaultLanguage;

  async function createSenders() {
    const Mailer = createMailer(log, config, oauthdb);
    const templates = await require('./templates').init();
    const subscriptionTemplates = await require('./subscription-templates')(
      log,
      translator
    );
    return {
      email: new Mailer(
        translator,
        templates,
        subscriptionTemplates,
        config.smtp,
        sender
      ),
      sms: createSms(log, translator, templates, config),
    };
  }

  function splitEmails(emails) {
    const result = emails.reduce(
      (result, item) => {
        if (item.isPrimary) {
          result.to = item.email;
        } else if (item.isVerified) {
          result.cc.push(item.email);
        }
        return result;
      },
      { cc: [] }
    );

    if (!result.to) {
      throw error.unexpectedError();
    }

    return result;
  }

  const senders = await createSenders();
  const mailer = senders.email;

  senders.email = {
    sendVerifyCode(emails, account, options) {
      return mailer.verifyEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        email: account.email,
        uid: account.uid,
      });
    },
    sendVerifyShortCode(emails, account, options) {
      // This function differs from `sendVerifyCode` since it sends a code that
      // is expected to be entered into a input field rather than a link to verify
      // the account. It is expected to be much shorter than the `emailCode`.
      return mailer.verifyShortCodeEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        email: account.email,
        uid: account.uid,
      });
    },
    sendVerifyLoginEmail(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.verifyLoginEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
        uid: account.uid,
      });
    },
    sendVerifyLoginCodeEmail(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.verifyLoginCodeEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
        uid: account.uid,
      });
    },
    sendVerifyPrimaryEmail(emails, account, options) {
      return mailer.verifyPrimaryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        email: account.email,
        uid: account.uid,
      });
    },
    sendVerifySecondaryEmail(emails, account, options) {
      return mailer.verifySecondaryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        email: emails[0].email,
        primaryEmail: account.email,
        uid: account.uid,
      });
    },
    sendRecoveryCode(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.recoveryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
        emailToHashWith: account.email,
        token: options.token.data,
      });
    },
    sendPasswordChangedNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.passwordChangedEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPasswordResetNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.passwordResetEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendNewDeviceLoginNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.newDeviceLoginEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostVerifyEmail(emails, account, options) {
      return mailer.postVerifyEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        email: account.email,
      });
    },
    sendPostRemoveSecondaryEmail(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postRemoveSecondaryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostVerifySecondaryEmail(emails, account, options) {
      return mailer.postVerifySecondaryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        email: account.primaryEmail.email,
      });
    },
    sendPostChangePrimaryEmail(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postChangePrimaryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostNewRecoveryCodesNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postNewRecoveryCodesEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostConsumeRecoveryCodeNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postConsumeRecoveryCodeEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendLowRecoveryCodeNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.lowRecoveryCodesEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendUnblockCode(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.unblockCodeEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
        uid: account.uid,
      });
    },
    sendPostAddTwoStepAuthNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postAddTwoStepAuthenticationEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostRemoveTwoStepAuthNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postRemoveTwoStepAuthenticationEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostAddAccountRecoveryNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postAddAccountRecoveryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPostRemoveAccountRecoveryNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.postRemoveAccountRecoveryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    sendPasswordResetAccountRecoveryNotification(emails, account, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.passwordResetAccountRecoveryEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    async sendDownloadSubscription(emails, options) {
      const { to, cc } = splitEmails(emails);

      return mailer.downloadSubscriptionEmail({
        ...options,
        acceptLanguage: options.acceptLanguage || defaultLanguage,
        ccEmails: cc,
        email: to,
      });
    },
    translator(...args) {
      return mailer.translator.apply(mailer, args);
    },
    stop() {
      return mailer.stop();
    },
    _ungatedMailer: mailer,
  };

  return senders;
};
