/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// XXX: ES6 features aren't currently allowed in this file.

// This indirection exists to accommodate different config properties
// in the old auth mailer. If/when the two config files are merged and
// there's nothing left that imports mailer/config, it is safe to merge
// legacy_index.js and this file into one.
var createSenders = require('./legacy_index')
var P = require('../promise')

module.exports = function (log, config, error, db, translator, sender) {
  var defaultLanguage = config.i18n.defaultLanguage

  return createSenders(
    log,
    {
      mail: config.smtp,
      sms: config.sms
    },
    translator,
    sender
  )
  .then(function (senders) {
    var ungatedMailer = senders.email
    var configBounces = config.smtp && config.smtp.bounces || {}
    var BOUNCES_ENABLED = !! configBounces.enabled
    var MAX_HARD = configBounces.hard && configBounces.hard.max || 0
    var MAX_SOFT = configBounces.soft && configBounces.soft.max || 0
    var MAX_COMPLAINT = configBounces.complaint && configBounces.complaint.max || 0
    var DURATION_HARD = configBounces.hard && configBounces.hard.duration || Infinity
    var DURATION_SOFT = configBounces.soft && configBounces.soft.duration || Infinity
    var DURATION_COMPLAINT = configBounces.complaint && configBounces.complaint.duration || Infinity
    var BOUNCE_TYPE_HARD = 1
    var BOUNCE_TYPE_SOFT = 2
    var BOUNCE_TYPE_COMPLAINT = 3

    // I really wanted to use Computer property names here, but thats
    // an ES2015 feature, and this directory (senders) is stuck in
    // ES5-land.
    var freeze = Object.freeze
    var BOUNCE_RULES = {}
    BOUNCE_RULES[BOUNCE_TYPE_HARD] = freeze({
      duration: DURATION_HARD,
      error: error.emailBouncedHard,
      max: MAX_HARD
    })
    BOUNCE_RULES[BOUNCE_TYPE_COMPLAINT] = freeze({
      duration: DURATION_COMPLAINT,
      error: error.emailComplaint,
      max: MAX_COMPLAINT
    })
    BOUNCE_RULES[BOUNCE_TYPE_SOFT] = freeze({
      duration: DURATION_SOFT,
      error: error.emailBouncedSoft,
      max: MAX_SOFT
    })
    BOUNCE_RULES = freeze(BOUNCE_RULES)

    function bounceGatedMailer(email) {
      return db.emailBounces(email)
        .then(function (bounces) {
          var counts = {}
          counts[BOUNCE_TYPE_HARD] = 0
          counts[BOUNCE_TYPE_COMPLAINT] = 0
          counts[BOUNCE_TYPE_SOFT] = 0
          var now = Date.now()
          bounces.forEach(function (bounce) {
            var type = bounce.bounceType
            var ruleSet = BOUNCE_RULES[type]
            if (ruleSet) {
              if (bounce.createdAt > now - ruleSet.duration) {
                counts[type]++
                if (counts[type] > ruleSet.max) {
                  throw ruleSet.error()
                }
              }
            }
          })
          return ungatedMailer
        })
        .catch(function (err) {
          log.info({
            op: 'mailer.blocked',
            errno: err.errno
          })
          throw err
        })
    }

    function noopMailer() {
      return P.resolve(ungatedMailer)
    }

    var getSafeMailer = BOUNCES_ENABLED ? bounceGatedMailer : noopMailer

    senders.email = {
      sendVerifyCode: function (account, code, opts) {
        return getSafeMailer(account.email)
          .then(function (mailer) {
            return mailer.verifyEmail({
              email: account.email,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              uid: account.uid.toString('hex'),
              code: code.toString('hex'),
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
      sendVerifyLoginEmail: function (account, code, opts) {
        return getSafeMailer(account.email)
          .then(function (mailer) {
            return mailer.verifyLoginEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              code: code.toString('hex'),
              email: account.email,
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
      sendRecoveryCode: function (token, code, opts) {
        return getSafeMailer(token.email)
          .then(function (mailer) {
            return mailer.recoveryEmail({
              email: token.email,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              token: token.data.toString('hex'),
              code: code.toString('hex'),
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
      sendPasswordChangedNotification: function (email, opts) {
        return getSafeMailer(email)
          .then(function (mailer) {
            return mailer.passwordChangedEmail({
              email: email,
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
      sendPasswordResetNotification: function (email, opts) {
        return getSafeMailer(email)
          .then(function (mailer) {
            return mailer.passwordResetEmail({
              email: email,
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
            })
          })
      },
      sendNewDeviceLoginNotification: function (email, opts) {
        return getSafeMailer(email)
          .then(function (mailer) {
            return mailer.newDeviceLoginEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              email: email,
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
      sendPostVerifyEmail: function (email, opts) {
        return getSafeMailer(email)
          .then(function (mailer) {
            return mailer.postVerifyEmail({
              email: email,
              acceptLanguage: opts.acceptLanguage || defaultLanguage
            })
          })
      },
      sendUnblockCode: function (account, unblockCode, opts) {
        return getSafeMailer(account.email)
          .then(function (mailer) {
            return mailer.unblockCodeEmail({
              acceptLanguage: opts.acceptLanguage || defaultLanguage,
              flowId: opts.flowId,
              flowBeginTime: opts.flowBeginTime,
              email: account.email,
              ip: opts.ip,
              location: opts.location,
              timeZone: opts.timeZone,
              uaBrowser: opts.uaBrowser,
              uaBrowserVersion: opts.uaBrowserVersion,
              uaOS: opts.uaOS,
              uaOSVersion: opts.uaOSVersion,
              uid: account.uid.toString('hex'),
              unblockCode: unblockCode
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
