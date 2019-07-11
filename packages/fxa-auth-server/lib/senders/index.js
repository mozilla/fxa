/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const createMailer = require('./email');
const createSms = require('./sms');
const P = require('../promise');

module.exports = (log, config, error, bounces, translator, oauthdb, sender) => {
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

  return createSenders().then(senders => {
    const ungatedMailer = senders.email;

    function getSafeMailer(email) {
      return bounces
        .check(email)
        .return(ungatedMailer)
        .catch(e => {
          const info = {
            errno: e.errno,
          };
          const bouncedAt =
            e.output && e.output.payload && e.output.payload.bouncedAt;
          if (bouncedAt) {
            info.bouncedAt = bouncedAt;
          }
          log.info('mailer.blocked', info);
          throw e;
        });
    }

    function getSafeMailerWithEmails(emails) {
      let ungatedPrimaryEmail;
      const ungatedCcEmails = [];
      const gatedEmailErrors = [];

      return P.filter(emails, email => {
        // We will only send to primary, or verified secondary.
        return email.isPrimary || email.isVerified;
      })
        .then(emails => {
          if (emails.length === 0) {
            // No emails we can even attempt to send to? Should never happen!
            throw new Error('Empty list of sendable email addresses');
          }
          return emails;
        })
        .each(email => {
          // We only send to addresses that are not gated, to protect our sender score.
          return getSafeMailer(email.email).then(
            () => {
              if (email.isPrimary) {
                ungatedPrimaryEmail = email.email;
              } else {
                ungatedCcEmails.push(email.email);
              }
            },
            err => {
              gatedEmailErrors.push(err);
            }
          );
        })
        .then(() => {
          if (!ungatedPrimaryEmail) {
            // This user is having a bad time, their primary email is bouncing.
            // Can we promote one of their secondary emails?
            if (ungatedCcEmails.length === 0) {
              // Nope.  Block the send, using first error reported.
              // Since we always check at least one email, there will be at least one error here.
              throw gatedEmailErrors[0];
            }
            ungatedPrimaryEmail = ungatedCcEmails.shift();
          }

          return {
            ungatedMailer: ungatedMailer,
            ungatedPrimaryEmail: ungatedPrimaryEmail,
            ungatedCcEmails: ungatedCcEmails,
          };
        });
    }

    senders.email = {
      sendVerifyCode: function(emails, account, opts) {
        const primaryEmail = account.email;
        return getSafeMailer(primaryEmail).then(mailer => {
          return mailer.verifyEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail,
              uid: account.uid,
            })
          );
        });
      },
      sendVerifyLoginEmail: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.verifyLoginEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              uid: account.uid,
            })
          );
        });
      },
      sendVerifyLoginCodeEmail: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.verifyLoginCodeEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              uid: account.uid,
            })
          );
        });
      },
      sendVerifyPrimaryEmail: function(emails, account, opts) {
        const primaryEmail = account.email;

        return getSafeMailer(primaryEmail).then(mailer => {
          return mailer.verifyPrimaryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail,
              uid: account.uid,
            })
          );
        });
      },
      sendVerifySecondaryEmail: function(emails, account, opts) {
        const primaryEmail = account.email;
        const verifyEmailAddress = emails[0].email;

        return getSafeMailer(primaryEmail).then(mailer => {
          return mailer.verifySecondaryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: verifyEmailAddress,
              primaryEmail,
              uid: account.uid,
            })
          );
        });
      },
      sendRecoveryCode: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.recoveryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              emailToHashWith: account.email,
              token: opts.token.data,
            })
          );
        });
      },
      sendPasswordChangedNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.passwordChangedEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPasswordResetNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.passwordResetEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendNewDeviceLoginNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.newDeviceLoginEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostVerifyEmail: function(emails, account, opts) {
        const primaryEmail = account.email;

        return getSafeMailer(primaryEmail).then(mailer => {
          return mailer.postVerifyEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostRemoveSecondaryEmail: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postRemoveSecondaryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostVerifySecondaryEmail: function(emails, account, opts) {
        const primaryEmail = account.primaryEmail.email;

        return getSafeMailer(primaryEmail).then(mailer => {
          return mailer.postVerifySecondaryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostChangePrimaryEmail: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postChangePrimaryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostNewRecoveryCodesNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postNewRecoveryCodesEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostConsumeRecoveryCodeNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postConsumeRecoveryCodeEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendLowRecoveryCodeNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.lowRecoveryCodesEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendUnblockCode: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.unblockCodeEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              uid: account.uid,
            })
          );
        });
      },
      sendPostAddTwoStepAuthNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postAddTwoStepAuthenticationEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostRemoveTwoStepAuthNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postRemoveTwoStepAuthenticationEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostAddAccountRecoveryNotification: function(emails, account, opts) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postAddAccountRecoveryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPostRemoveAccountRecoveryNotification: function(
        emails,
        account,
        opts
      ) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.postRemoveAccountRecoveryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      sendPasswordResetAccountRecoveryNotification: function(
        emails,
        account,
        opts
      ) {
        return getSafeMailerWithEmails(emails).then(result => {
          const mailer = result.ungatedMailer;
          const primaryEmail = result.ungatedPrimaryEmail;
          const ccEmails = result.ungatedCcEmails;

          return mailer.passwordResetAccountRecoveryEmail(
            Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
            })
          );
        });
      },
      async sendDownloadSubscription(emails, options) {
        const {
          ungatedMailer: mailer,
          ungatedPrimaryEmail: email,
          ungatedCcEmails: ccEmails,
        } = await getSafeMailerWithEmails(emails);

        return mailer.downloadSubscriptionEmail({
          ...options,
          acceptLanguage: options.acceptLanguage || defaultLanguage,
          ccEmails,
          email,
        });
      },
      translator: function() {
        return ungatedMailer.translator.apply(ungatedMailer, arguments);
      },
      stop: function() {
        return ungatedMailer.stop();
      },
      _ungatedMailer: ungatedMailer,
    };
    return senders;
  });
};
