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
      locales: config.i18n.locales,
      mail: config.smtp
    }
  )
  .then(
    function (mailer) {
      mailer.sendVerifyCode = function (account, code, opts) {
        return P(mailer.verifyEmail(
          {
            email: account.email,
            uid: account.uid.toString('hex'),
            code: code.toString('hex'),
            service: opts.service,
            redirectTo: opts.redirectTo,
            resume: opts.resume,
            acceptLanguage: opts.acceptLanguage || defaultLanguage
          }
        ))
      }
      mailer.sendRecoveryCode = function (token, code, opts) {
        return P(mailer.recoveryEmail(
          {
            email: token.email,
            token: token.data.toString('hex'),
            code: code.toString('hex'),
            service: opts.service,
            redirectTo: opts.redirectTo,
            resume: opts.resume,
            acceptLanguage: opts.acceptLanguage || defaultLanguage
          }
        ))
      }
      mailer.sendUnlockCode = function (account, code, opts) {
        return P(mailer.unlockEmail(
          {
            email: account.email,
            uid: account.uid.toString('hex'),
            code: code.toString('hex'),
            service: opts.service,
            redirectTo: opts.redirectTo,
            resume: opts.resume,
            acceptLanguage: opts.acceptLanguage || defaultLanguage
          }
        ))
      }
      return mailer
    }
  )
}
