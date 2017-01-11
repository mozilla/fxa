/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('./promise')
var createMailer = require('fxa-auth-mailer')

module.exports = function (config, log) {
  var defaultLanguage = config.i18n.defaultLanguage

  return createMailer(
    log,
    {
      locales: config.i18n.supportedLanguages,
      defaultLanguage: defaultLanguage,
      mail: config.smtp
    }
  )
  .then(
    function (mailer) {
      mailer.sendVerifyCode = function (account, code, opts) {
        return P.resolve(mailer.verifyEmail(
          {
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
          }
        ))
      }
      mailer.sendVerifyLoginEmail = function (account, code, opts) {
        return P.resolve(mailer.verifyLoginEmail(
          {
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
          }
        ))
      }
      mailer.sendRecoveryCode = function (token, code, opts) {
        return P.resolve(mailer.recoveryEmail(
          {
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
          }
        ))
      }
      mailer.sendPasswordChangedNotification = function (email, opts) {
        return P.resolve(mailer.passwordChangedEmail(
          {
            email: email,
            acceptLanguage: opts.acceptLanguage || defaultLanguage,
            ip: opts.ip,
            location: opts.location,
            uaBrowser: opts.uaBrowser,
            uaBrowserVersion: opts.uaBrowserVersion,
            uaOS: opts.uaOS,
            uaOSVersion: opts.uaOSVersion
          }
        ))
      }
      mailer.sendPasswordResetNotification = function (email, opts) {
        return P.resolve(mailer.passwordResetEmail(
          {
            email: email,
            acceptLanguage: opts.acceptLanguage || defaultLanguage,
            flowId: opts.flowId,
            flowBeginTime: opts.flowBeginTime,
          }
        ))
      }
      mailer.sendNewDeviceLoginNotification = function (email, opts) {
        return P.resolve(mailer.newDeviceLoginEmail(
          {
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
          }
        ))
      }
      mailer.sendPostVerifyEmail = function (email, opts) {
        return P.resolve(mailer.postVerifyEmail(
          {
            email: email,
            acceptLanguage: opts.acceptLanguage || defaultLanguage
          }
        ))
      }
      mailer.sendUnblockCode = function (account, unblockCode, opts) {
        return P.resolve(mailer.unblockCodeEmail(
          {
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
          }
        ))
      }
      return mailer
    }
  )
}
