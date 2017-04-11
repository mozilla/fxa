/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// XXX: ES6 features aren't currently allowed in this file.

var createMailer = require('./email')
var createSms = require('./sms')

module.exports = function (log, config, error, bounces, translator, sender) {
  var defaultLanguage = config.i18n.defaultLanguage

  function createSenders() {
    var Mailer = createMailer(log)
    return require('./templates')()
      .then(function (templates) {
        return {
          email: new Mailer(translator, templates, config.smtp, sender),
          sms: createSms(log, translator, templates, config.sms)
        }
      })
  }

  return createSenders()
  .then(function (senders) {
    var ungatedMailer = senders.email

    function getSafeMailer(email) {
      return bounces.check(email)
        .return(ungatedMailer)
        .catch(function (err) {
          log.info({
            op: 'mailer.blocked',
            errno: err.errno
          })
          throw err
        })
    }

    function getVerifiedSecondaryEmails(emais) {
      return emais.reduce(function(list, email) {
        if (! email.isPrimary && email.isVerified) {
          list.push(email.email)
        }
        return list
      }, [])
    }

    function getSecondaryEmails(emails) {
      return emails.reduce(function(list, email) {
        if (! email.isPrimary) {
          list.push(email.email)
        }
        return list
      }, [])
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
              uid: account.uid.toString('hex'),
              code: opts.code.toString('hex'),
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
        var primaryEmail = account.email
        var ccEmails = getVerifiedSecondaryEmails(emails)

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.verifyLoginEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              code: opts.code.toString('hex'),
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
              uid: account.uid.toString('hex')
            })
          })
      },
      sendRecoveryCode: function (emails, account, opts) {
        var primaryEmail = account.email
        var ccEmails = getVerifiedSecondaryEmails(emails)

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
            return mailer.recoveryEmail({
              ccEmails: ccEmails,
              email: primaryEmail,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              token: opts.token.data.toString('hex'),
              code: opts.code.toString('hex'),
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
        var primaryEmail = account.email
        var ccEmails = getSecondaryEmails(emails)

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
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
        var primaryEmail = account.email
        var ccEmails = getSecondaryEmails(emails)

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
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
        var primaryEmail = account.email
        var ccEmails = getSecondaryEmails(emails)

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
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
      sendUnblockCode: function (emails, account, opts) {
        var primaryEmail = account.email
        var ccEmails = getVerifiedSecondaryEmails(emails)

        return getSafeMailer(primaryEmail)
          .then(function (mailer) {
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
              uid: account.uid.toString('hex'),
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
