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

  function linkAttributes(url) {
    // Not very nice to have presentation code in here, but this is to help l10n
    // contributors not deal with extraneous noise in strings.
    return 'href="' + url + '" style="color: #0095dd; text-decoration: none; font-family: sans-serif;"'
  }


  function Mailer(translator, templates, config, sender) {
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

    this.mailer = sender || nodemailer.createTransport('SMTP', options)
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
    this.signInUrl = config.signInUrl
    this.translator = translator
    this.templates = templates
  }

  Mailer.prototype.stop = function () {
    this.mailer.close()
  }

  Mailer.prototype._supportLinkAttributes = function () {
    return linkAttributes(this.supportUrl)
  }

  Mailer.prototype._initiatePasswordChange = function () {
    return linkAttributes(this.initiatePasswordChangeUrl)
  }

  Mailer.prototype.localize = function (message) {
    var translator = this.translator(message.acceptLanguage)

    var localized = this.templates[message.template](extend({
      translator: translator
    }, message.templateValues))

    return {
      html: localized.html,
      language: translator.language,
      subject: translator.gettext(message.subject),
      text: localized.text,
    }
  }

  Mailer.prototype.send = function (message) {
    log.trace({ op: 'mailer.' + message.template, email: message.email, uid: message.uid })

    var localized = this.localize(message)

    var emailConfig = {
      sender: this.sender,
      to: message.email,
      subject: localized.subject,
      text: localized.text,
      html: localized.html,
      headers: extend({
        'Content-Language': localized.language
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
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        passwordChangeLinkAttributes: this._initiatePasswordChange()
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
        signInUrl: this.signInUrl,
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        passwordChangeLinkAttributes: this._initiatePasswordChange()
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
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        passwordChangeLinkAttributes: this._initiatePasswordChange()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.createPasswordResetLink = function (email, extraQueryParams) {
    var queryParams = { email: email }
    extraQueryParams = extraQueryParams || {}

    for (var key in extraQueryParams) {
      queryParams[key] = extraQueryParams[key]
    }

    return this.initiatePasswordResetUrl + '?' + qs.stringify(queryParams)
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
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        signInUrl: this.signInUrl,
        passwordChangeLinkAttributes: this._initiatePasswordChange()
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
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        resetPasswordUrl: this.signInUrl,
        passwordChangeLinkAttributes: this._initiatePasswordChange()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.passwordResetRequiredEmail = function (message) {
    var link = this.createPasswordResetLink(message.email, { reset_password_confirm: false })

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('Firefox Account password reset required'),
      template: 'passwordResetRequiredEmail',
      templateValues: {
        resetLink: link
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
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        passwordChangeLinkAttributes: this._initiatePasswordChange()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.postVerifyEmail = function (message) {
    log.trace({ op: 'mailer.postVerifyEmail', email: message.email, uid: message.uid })

    // special utm params, just for this email
    // details at github.com/mozilla/fxa-auth-mailer/issues/110
    var postVerifyUtmParams = '?utm_source=email&utm_medium=email&utm_campaign=fx-account-verified'
    var link = this.syncUrl + postVerifyUtmParams

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
        androidUrl: this.androidUrl + postVerifyUtmParams,
        iosUrl: this.iosUrl + postVerifyUtmParams,
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        passwordChangeLinkAttributes: this._initiatePasswordChange()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.suspiciousLocationEmail = function (message) {
    log.trace({ op: 'mailer.suspiciousLocationEmail', email: message.email, uid: message.uid })

    var link = this.createPasswordResetLink(message.email, { reset_password_confirm: false })

    // the helper function `t` references `this.translator`. Because of
    // the way Handlebars `each` loops work, a translator instance must be
    // added to each entry or else no translator is available when translating
    // the entry.
    var translator = this.translator(message.acceptLanguage)

    message.locations.forEach(function (entry) {
      entry.translator = translator
    })

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('Suspicious activity with your Firefox Account'),
      template: 'suspiciousLocationEmail',
      templateValues: {
        locations: message.locations,
        resetLink: link
      }
    })
  }

  Mailer.prototype.verificationReminderEmail = function (message) {
    log.trace({ op: 'mailer.verificationReminderEmail', email: message.email, uid: message.uid })

    var subject = gettext('Hello again.')
    var template = 'verificationReminderFirstEmail'
    if (message.type === 'second') {
      subject = gettext('Still there?')
      template = 'verificationReminderSecondEmail'
    }

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
      subject: subject,
      template: template,
      templateValues: {
        email: message.email,
        link: link,
        oneClickLink: oneClickLink,
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes(),
        passwordChangeLinkAttributes: this._initiatePasswordChange()
      },
      uid: message.uid
    })
  }

  return Mailer
}
