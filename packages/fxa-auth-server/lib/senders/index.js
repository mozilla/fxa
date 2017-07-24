/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// XXX: ES6 features aren't currently allowed in this file.

var createMailer = require('./email')
var createSms = require('./sms')
var P = require('../promise')

module.exports = function (log, config, error, bounces, translator, sender) {
  var defaultLanguage = config.i18n.defaultLanguage

  function createSenders() {
    var Mailer = createMailer(log)
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
    var ungatedMailer = senders.email

    function getSafeMailer(email) {
      return bounces.check(email)
        .return(ungatedMailer)
        .catch(function (e) {
          var info = {
            op: 'mailer.blocked',
            errno: e.errno
          }
          var bouncedAt = e.output && e.output.payload && e.output.payload.bouncedAt
          if (bouncedAt) {
            info.bouncedAt = bouncedAt
          }
          log.info(info)
          throw e
        })
    }

    function getSafeMailerWithEmails(emails) {
      var ungatedEmails = []
      var gatedEmailErrors = []

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

          var ungatedPrimaryEmail = getPrimaryEmail(ungatedEmails)
          var ungatedCcEmails = getVerifiedSecondaryEmails(ungatedEmails)

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
        var primaryEmail = account.email
        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.verifyEmail({
              email: primaryEmail,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              uid: account.uid,
              code: opts.code,
              service: opts.service,
              redirectTo: opts.redirectTo,
              resume: opts.resume,
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ip: opts.ip,
              location: opts.location,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion
            })
          })
      },
      sendVerifyLoginEmail: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            var mailer = result.ungatedMailer
            var primaryEmail = result.ungatedPrimaryEmail
            var ccEmails = result.ungatedCcEmails

            return mailer.verifyLoginEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              code: opts.code,
              ccEmails: ccEmails,
              email: primaryEmail,
              ip: opts.ip,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              location: opts.location,
              redirectTo: opts.redirectTo,
              resume: opts.resume,
              service: opts.service,
              timeZone: opts.timeZone,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion,
              uid: account.uid
            })
          })
      },
      sendVerifySecondaryEmail: function (emails, account, opts) {
        var primaryEmail = account.email
        var verifyEmailAddress = emails[0].email

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.verifySecondaryEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              code: opts.code,
              email: verifyEmailAddress,
              ip: opts.ip,
              location: opts.location,
              redirectTo: opts.redirectTo,
              resume: opts.resume,
              service: opts.service,
              timeZone: opts.timeZone,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion,
              uid: account.uid,
              primaryEmail: primaryEmail
            })
          })
      },
      sendRecoveryCode: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            var mailer = result.ungatedMailer
            var primaryEmail = result.ungatedPrimaryEmail
            var ccEmails = result.ungatedCcEmails

            return mailer.recoveryEmail({
              ccEmails: ccEmails,
              email: primaryEmail,
              emailToHashWith: account.email,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              token: opts.token.data,
              code: opts.code,
              service: opts.service,
              redirectTo: opts.redirectTo,
              resume: opts.resume,
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ip: opts.ip,
              location: opts.location,
              timeZone: opts.timeZone,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion
            })
          })
      },
      sendPasswordChangedNotification: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            var mailer = result.ungatedMailer
            var primaryEmail = result.ungatedPrimaryEmail
            var ccEmails = result.ungatedCcEmails

            return mailer.passwordChangedEmail({
              email: primaryEmail,
              ccEmails: ccEmails,
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              ip: opts.ip,
              location: opts.location,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion
            })
          })
      },
      sendPasswordResetNotification: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            var mailer = result.ungatedMailer
            var primaryEmail = result.ungatedPrimaryEmail
            var ccEmails = result.ungatedCcEmails

            return mailer.passwordResetEmail({
              ccEmails: ccEmails,
              email: primaryEmail,
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime
            })
          })
      },
      sendNewDeviceLoginNotification: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            var mailer = result.ungatedMailer
            var primaryEmail = result.ungatedPrimaryEmail
            var ccEmails = result.ungatedCcEmails

            return mailer.newDeviceLoginEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              ccEmails: ccEmails,
              email: primaryEmail,
              ip: opts.ip,
              location: opts.location,
              timeZone: opts.timeZone,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion
            })
          })
      },
      sendPostVerifyEmail: function (emails, account, opts) {
        var primaryEmail = account.email

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.postVerifyEmail({
              email: primaryEmail,
              acceptLanguage: opts.acceptLanguage || defaultLanguage
            })
          })
      },
      sendPostVerifySecondaryEmail: function (emails, account, opts) {
        var primaryEmail = account.primaryEmail.email

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.postVerifySecondaryEmail({
              email: primaryEmail,
              secondaryEmail: opts.secondaryEmail,
              acceptLanguage: opts.acceptLanguage || defaultLanguage
            })
          })
      },
      sendUnblockCode: function (emails, account, opts) {
        return getSafeMailerWithEmails(emails)
          .then(function (result) {
            var mailer = result.ungatedMailer
            var primaryEmail = result.ungatedPrimaryEmail
            var ccEmails = result.ungatedCcEmails

            return mailer.unblockCodeEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              ccEmails: ccEmails,
              email: primaryEmail,
              ip: opts.ip,
              location: opts.location,
              timeZone: opts.timeZone,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion,
              uid: account.uid,
              unblockCode: opts.unblockCode
            })
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
