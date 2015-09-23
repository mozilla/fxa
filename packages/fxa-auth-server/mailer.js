/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var qs = require('querystring')
var P = require('bluebird')
var nodemailer = require('nodemailer')

module.exports = function (log) {
  function extend(target, source) {
    for (var key in source) {
      target[key] = source[key]
    }

    return target
  }

  // helper used to ensure strings are extracted
  function gettext(txt) {
    return txt
  }


  function Mailer(translator, templates, config) {
    var options = {
      host: config.host,
      secureConnection: config.secure,
      port: config.port
    }

    if (config.user && config.password) {
      options.auth = {
        user: config.user,
        pass: config.password
      }
    }

    this.mailer = nodemailer.createTransport('SMTP', options)
    this.sender = config.sender
    this.verificationUrl = config.verificationUrl
    this.initiatePasswordResetUrl = config.initiatePasswordResetUrl
    this.initiatePasswordChangeUrl = config.initiatePasswordChangeUrl
    this.passwordResetUrl = config.passwordResetUrl
    this.accountUnlockUrl = config.accountUnlockUrl
    this.syncUrl = config.syncUrl
    this.androidUrl = config.androidUrl
    this.iosUrl = config.iosUrl
    this.supportUrl = config.supportUrl
    this.translator = translator
    this.templates = templates
  }

  Mailer.prototype.stop = function () {
    this.mailer.close()
  }

  Mailer.prototype.send = function (message) {
    log.trace({ op: 'mailer.' + message.template, email: message.email, uid: message.uid })

    var translator = this.translator(message.acceptLanguage)

    var localized = this.templates[message.template](extend({
      translator: translator
    }, message.templateValues))

    var emailConfig = {
      sender: this.sender,
      to: message.email,
      subject: translator.gettext(message.subject),
      text: localized.text,
      html: localized.html,
      headers: extend({
        'Content-Language': translator.language
      }, message.headers)
    }

    log.info({ op: 'mailer.send', email: message.email })

    var d = P.defer()
    this.mailer.sendMail(
      emailConfig,
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
    var query = {
        uid: message.uid,
        code: message.code
      }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.verificationUrl + '?' + qs.stringify(query)
    query.one_click = true
    var oneClickLink = this.verificationUrl + '?' + qs.stringify(query)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link,
        'X-Service-ID': message.service,
        'X-Uid': message.uid,
        'X-Verify-Code': message.code
      },
      subject: gettext('Verify your Firefox Account'),
      template: 'verifyEmail',
      templateValues: {
        email: message.email,
        link: link,
        oneClickLink: oneClickLink,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.recoveryEmail = function (message) {
    var query = {
        token: message.token,
        code: message.code,
        email: message.email
      }
    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.passwordResetUrl + '?' + qs.stringify(query)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link,
        'X-Recovery-Code': message.code
      },
      subject: gettext('Reset your Firefox Account password'),
      template: 'resetEmail',
      templateValues: {
        code: message.code,
        email: message.email,
        link: link,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.unlockEmail = function (message) {
    var query = {
        uid: message.uid,
        code: message.code
      }
    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.accountUnlockUrl + '?' + qs.stringify(query)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link,
        'X-Service-ID': message.service,
        'X-Uid': message.uid,
        'X-Unlock-Code': message.code
      },
      subject: gettext('Re-verify your Firefox Account'),
      template: 'unlockEmail',
      templateValues: {
        email: message.email,
        link: link,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.createPasswordResetLink = function(email) {
    return this.initiatePasswordResetUrl + '?' + qs.stringify({ email: email })
  }

  Mailer.prototype.passwordChangedEmail = function (message) {
    var link = this.createPasswordResetLink(message.email)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('Your Firefox Account password has been changed'),
      template: 'passwordChangedEmail',
      templateValues: {
        resetLink: link,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.passwordResetEmail = function (message) {

    var link = this.createPasswordResetLink(message.email)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('Your Firefox Account password has been reset'),
      template: 'passwordResetEmail',
      templateValues: {
        resetLink: link,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.newSyncDeviceEmail = function (message) {
    log.trace({ op: 'mailer.newSyncDeviceEmail', email: message.email, uid: message.uid })
    var link = this.initiatePasswordChangeUrl + '?' + qs.stringify({ email: message.email })

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('New sign-in to Firefox'),
      template: 'newSyncDeviceEmail',
      templateValues: {
        resetLink: link,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.postVerifyEmail = function (message) {
    log.trace({ op: 'mailer.postVerifyEmail', email: message.email, uid: message.uid })

    var link = this.syncUrl

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('Firefox Account Verified'),
      template: 'postVerifyEmail',
      templateValues: {
        link: link,
        androidUrl: this.androidUrl,
        iosUrl: this.iosUrl,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.verificationReminderEmail = function (message) {
    log.trace({ op: 'mailer.verificationReminderEmail', email: message.email, uid: message.uid })
    var query = {
        uid: message.uid,
        code: message.code
      }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.verificationUrl + '?' + qs.stringify(query)
    query.one_click = true
    var oneClickLink = this.verificationUrl + '?' + qs.stringify(query)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link,
        'X-Service-ID': message.service,
        'X-Uid': message.uid,
        'X-Verify-Code': message.code
      },
      subject: gettext('Verify your Firefox Account'),
      template: 'verificationReminderEmail',
      templateValues: {
        email: message.email,
        link: link,
        oneClickLink: oneClickLink,
        supportUrl: this.supportUrl
      },
      uid: message.uid
    })
  }

  return Mailer
}
