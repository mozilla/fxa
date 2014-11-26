/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var qs = require('querystring')
var P = require('bluebird')
var nodemailer = require('nodemailer')

module.exports = function (log) {

  function Mailer(translator, templates, config) {
    var options = {
      host: config.host,
      secureConnection: config.secure,
      port: config.port
    }
    this.mailer = nodemailer.createTransport('SMTP', options)
    this.sender = config.sender
    this.verificationUrl = config.verificationUrl
    this.passwordResetUrl = config.passwordResetUrl
    this.accountUnlockUrl = config.accountUnlockUrl
    this.translator = translator
    this.templates = templates
  }

  Mailer.prototype.stop = function () {
    this.mailer.close()
  }

  Mailer.prototype.send = function (message) {
    log.info({ op: 'mailer.send', email: message && message.to })

    var d = P.defer()
    this.mailer.sendMail(
      message,
      function (err, status) {
        log.trace(
          {
            op: 'mailer.send.1',
            err: err && err.message,
            status: status && status.message,
            id: status && status.messageId
          }
        )
        return err ? d.reject(err) : d.resolve(status)
      }
    )
    return d.promise
  }

  Mailer.prototype.verifyEmail = function (message) {
    log.trace({ op: 'mailer.verifyEmail', email: message.email, uid: message.uid })
    var translator = this.translator(message.acceptLanguage)
    var query = {
        uid: message.uid,
        code: message.code
      }
    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.verificationUrl + '?' + qs.stringify(query)

    var values = {
      translator: translator,
      link: link,
      email: message.email
    }
    var localized = this.templates.verifyEmail(values)
    var email = {
      sender: this.sender,
      to: message.email,
      subject: translator.gettext('Verify your account'),
      text: localized.text,
      html: localized.html,
      headers: {
        'X-Uid': message.uid,
        'X-Verify-Code': message.code,
        'X-Service-ID': message.service,
        'X-Link': link,
        'Content-Language': translator.language
      }
    }
    return this.send(email)
  }

  Mailer.prototype.recoveryEmail = function (message) {
    log.trace({ op: 'mailer.recoveryEmail', email: message.email })
    var translator = this.translator(message.acceptLanguage)
    var query = {
        token: message.token,
        code: message.code,
        email: message.email
      }
    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.passwordResetUrl + '?' + qs.stringify(query)

    var values = {
      translator: translator,
      link: link,
      email: message.email,
      code: message.code
    }

    var localized = this.templates.recoveryEmail(values)
    var email = {
      sender: this.sender,
      to: message.email,
      subject: translator.gettext('Reset your password'),
      text: localized.text,
      html: localized.html,
      headers: {
        'X-Recovery-Code': message.code,
        'X-Link': link,
        'Content-Language': translator.language
      }
    }
    return this.send(email)
  }

  Mailer.prototype.unlockEmail = function (message) {
    log.trace({ op: 'mailer.unlockEmail', email: message.email, uid: message.uid })
    var translator = this.translator(message.acceptLanguage)
    var query = {
        uid: message.uid,
        code: message.code
      }
    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.accountUnlockUrl + '?' + qs.stringify(query)

    var values = {
      translator: translator,
      link: link,
      email: message.email
    }
    var localized = this.templates.unlockEmail(values)
    var email = {
      sender: this.sender,
      to: message.email,
      subject: translator.gettext('Unlock your account'),
      text: localized.text,
      html: localized.html,
      headers: {
        'X-Uid': message.uid,
        'X-Unlock-Code': message.code,
        'X-Service-ID': message.service,
        'X-Link': link,
        'Content-Language': translator.language
      }
    }
    return this.send(email)
  }

  return Mailer
}
