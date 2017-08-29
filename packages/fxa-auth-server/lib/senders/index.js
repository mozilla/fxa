/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const createMailer = require('./email')
const createSms = require('./sms')
const P = require('../promise')

module.exports = (log, config, error, bounces, translator, sender) => {
  const defaultLanguage = config.i18n.defaultLanguage

  function createSenders() {
    const Mailer = createMailer(log)
    return require('./templates')()
      .then(function (templates) {
        return {
          email: new Mailer(translator, templates, config.smtp, sender),
          sms: createSms(log, translator, templates, config)
        }
      })
  }

  return createSenders()
  .then(function (senders) {
    const ungatedMailer = senders.email

    function getSafeMailer(email) {
      return bounces.check(email)
        .return(ungatedMailer)
        .catch(function (e) {
          const info = {
            op: 'mailer.blocked',
            errno: e.errno
          }
          const bouncedAt = e.output && e.output.payload && e.output.payload.bouncedAt
          if (bouncedAt) {
            info.bouncedAt = bouncedAt
          }
          log.info(info)
          throw e
        })
    }

    function getSafeMailerWithEmails(emails) {
      const ungatedEmails = []
      const gatedEmailErrors = []

      // Filter down to emails to only ones that are not gated
      return P.map(emails, function (email) {
        return getSafeMailer(email.email)
          .then(function () {
            ungatedEmails.push(email)
          }, function (err) {
            gatedEmailErrors.push(err)
          })
      })
        .then(function () {
          // There are no ungated emails, lets throw the first bounce error so that
          // we don't hurt our email scores.
          if (ungatedEmails.length === 0 && gatedEmailErrors.length > 0) {
            throw gatedEmailErrors[0]
          }

          let ungatedPrimaryEmail = getPrimaryEmail(ungatedEmails)
          const ungatedCcEmails = getVerifiedSecondaryEmails(ungatedEmails)

          // This user is having a bad time, their primary email is bouncing.
          // Send emails to ungated secondary emails
          if (! ungatedPrimaryEmail) {
            ungatedPrimaryEmail = ungatedCcEmails[0]
          }

          return {
            ungatedMailer: ungatedMailer,
            ungatedPrimaryEmail: ungatedPrimaryEmail,
            ungatedCcEmails: ungatedCcEmails
          }
        })
    }

    // Returns an array of only emails that are verified.
    // This returns only the email and not the email object.
    function getVerifiedSecondaryEmails(emails) {
      return emails.filter(function (email) {
        return ! email.isPrimary && email.isVerified
      }).map(function (email) {
        return email.email
      })
    }

    function getPrimaryEmail(emails) {
      var primaryEmail
      for (var i=0; i<emails.length; i++) {
        if (emails[i].isPrimary) {
          primaryEmail = emails[i]
          break
        }
      }

      return primaryEmail && primaryEmail.email
    }

    senders.email = {
      sendVerifyCode: function (emails, account, opts) {
        const primaryEmail = account.email
        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.verifyEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail,
              uid: account.uid
            }))
          })
      },
      sendVerifyLoginEmail: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.verifyLoginEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              uid: account.uid
            }))
          })
      },
      sendVerifySecondaryEmail: function (emails, account, opts) {
        const primaryEmail = account.email
        const verifyEmailAddress = emails[0].email

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.verifySecondaryEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: verifyEmailAddress,
              primaryEmail,
              uid: account.uid
            }))
          })
      },
      sendRecoveryCode: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.recoveryEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              emailToHashWith: account.email,
              token: opts.token.data
            }))
          })
      },
      sendPasswordChangedNotification: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.passwordChangedEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail
            }))
          })
      },
      sendPasswordResetNotification: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.passwordResetEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail
            }))
          })
      },
      sendNewDeviceLoginNotification: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.newDeviceLoginEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail
            }))
          })
      },
      sendPostVerifyEmail: function (emails, account, opts) {
        const primaryEmail = account.email

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.postVerifyEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail
            }))
          })
      },
      sendPostRemoveSecondaryEmail: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.postRemoveSecondaryEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail
            }))
          })
      },
      sendPostVerifySecondaryEmail: function (emails, account, opts) {
        const primaryEmail = account.primaryEmail.email

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.postVerifySecondaryEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              email: primaryEmail
            }))
          })
      },
      sendUnblockCode: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            const mailer = result.ungatedMailer
            const primaryEmail = result.ungatedPrimaryEmail
            const ccEmails = result.ungatedCcEmails

            return mailer.unblockCodeEmail(Object.assign({}, opts, {
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ccEmails,
              email: primaryEmail,
              uid: account.uid
            }))
          })
      },
      translator: function () {
        return ungatedMailer.translator.apply(ungatedMailer, arguments)
      },
      stop: function () {
        return ungatedMailer.stop()
      },
      _ungatedMailer: ungatedMailer
    }
    return senders
  })
}
