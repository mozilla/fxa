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
    this.verifyLoginUrl = config.verifyLoginUrl
    this.initiatePasswordResetUrl = config.initiatePasswordResetUrl
    this.initiatePasswordChangeUrl = config.initiatePasswordChangeUrl
    this.passwordResetUrl = config.passwordResetUrl
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

  Mailer.prototype._passwordResetLinkAttributes = function (email) {
    return linkAttributes(this.createPasswordResetLink(email))
  }

  Mailer.prototype._passwordChangeLinkAttributes = function (email) {
    return linkAttributes(this.createPasswordChangeLink(email))
  }

  Mailer.prototype._formatUserAgentInfo = function (message) {
    // Build a first cut at a device description,
    // without using any new strings.
    // Future iterations can localize this better.
    var parts = []
    if (message.uaBrowser) {
      var browser = message.uaBrowser
      if (message.uaBrowserVersion) {
        browser += ' ' + message.uaBrowserVersion
      }
      parts.push(browser)
    }
    if (message.uaOS) {
      var os = message.uaOS
      if (message.uaOSVersion) {
        os += ' ' + message.uaOSVersion
      }
      parts.push(os)
    }
    return parts.join(', ')
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

    log.info({
      email: message.email,
      op: 'mailer.send',
      template: message.template
    })

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
    log.trace({ op: 'mailer.verifyEmail', email: message.email, uid: message.uid })

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
        supportLinkAttributes: this._supportLinkAttributes()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.verifyLoginEmail = function (message) {
    log.trace({ op: 'mailer.verifyLoginEmail', email: message.email, uid: message.uid })

    var query = {
      code: message.code,
      uid: message.uid
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var link = this.verifyLoginUrl + '?' + qs.stringify(query)
    query.one_click = true
    var oneClickLink = this.verifyLoginUrl + '?' + qs.stringify(query)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link,
        'X-Service-ID': message.service,
        'X-Uid': message.uid,
        'X-Verify-Code': message.code
      },
      subject: gettext('Confirm new sign-in to Firefox'),
      template: 'verifyLoginEmail',
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.email,
        link: link,
        oneClickLink: oneClickLink,
        passwordChangeLink: this.createPasswordChangeLink(message.email),
        passwordChangeLinkAttributes: this._passwordChangeLinkAttributes(message.email),
        supportLinkAttributes: linkAttributes(this.supportUrl),
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
        signInUrl: this.createSignInLink(message.email),
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes()
      },
      uid: message.uid
    })
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
        resetLinkAttributes: this._passwordResetLinkAttributes(message.email),
        supportLinkAttributes: this._supportLinkAttributes(),
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
        resetLinkAttributes: this._passwordResetLinkAttributes(message.email),
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.passwordResetRequiredEmail = function (message) {
    var link = this.createPasswordResetLink(message.email)

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

  Mailer.prototype.newDeviceLoginEmail = function (message) {
    log.trace({ op: 'mailer.newDeviceLoginEmail', email: message.email, uid: message.uid })
    var link = this.createPasswordChangeLink(message.email)

    // Make a human-readable timestamp string.
    // For now it's always in UTC.
    // Future iterations can localize this better.
    var timestamp = new Date(message.timestamp || Date.now())
    var timestampStr = timestamp.toISOString().substr(0, 16).replace('T', ' ') + ' UTC'

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': link
      },
      subject: gettext('New sign-in to Firefox'),
      template: 'newDeviceLoginEmail',
      templateValues: {
        device: this._formatUserAgentInfo(message),
        passwordChangeLinkAttributes: this._passwordChangeLinkAttributes(message.email),
        resetLink: link,
        supportLinkAttributes: this._supportLinkAttributes(),
        supportUrl: this.supportUrl,
        timestamp: timestampStr
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
    var anrdoidLink = this.androidUrl + postVerifyUtmParams
    var iosLink = this.iosUrl + postVerifyUtmParams

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
        androidUrl: anrdoidLink,
        androidLinkAttributes: linkAttributes(anrdoidLink),
        iosUrl: iosLink,
        iosLinkAttributes: linkAttributes(iosLink),
        supportUrl: this.supportUrl,
        supportLinkAttributes: this._supportLinkAttributes()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.suspiciousLocationEmail = function (message) {
    log.trace({ op: 'mailer.suspiciousLocationEmail', email: message.email, uid: message.uid })

    var link = this.createPasswordResetLink(message.email)

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
    log.trace({ op: 'mailer.verificationReminderEmail', email: message.email, type: message.type })

    if (! message || ! message.code || ! message.email) {
      log.error({
        op: 'mailer.verificationReminderEmail',
        err: 'Missing code or email'
      })
      return
    }

    var subject = gettext('Hello again.')
    var template = 'verificationReminderFirstEmail'
    if (message.type === 'second') {
      subject = gettext('Still there?')
      template = 'verificationReminderSecondEmail'
    }

    var query = {
      uid: message.uid,
      code: message.code,
      reminder: message.type
    }

    var link = this.verificationUrl + '?' + qs.stringify(query)
    query.one_click = true
    var oneClickLink = this.verificationUrl + '?' + qs.stringify(query)

    return this.send({
      acceptLanguage: message.acceptLanguage || 'en',
      email: message.email,
      headers: {
        'X-Link': link,
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
        supportLinkAttributes: this._supportLinkAttributes()
      },
      uid: message.uid
    })
  }

  Mailer.prototype.createPasswordResetLink = function (email) {
    var queryParams = { email: email, reset_password_confirm: false }

    return this.initiatePasswordResetUrl + '?' + qs.stringify(queryParams)
  }

  Mailer.prototype.createPasswordChangeLink = function (email) {
    var queryParams = { email: email }

    return this.initiatePasswordChangeUrl + '?' + qs.stringify(queryParams)
  }

  Mailer.prototype.createSignInLink = function (email) {
    var queryParams = { email: email }

    return this.signInUrl + '?' + qs.stringify(queryParams)
  }

  return Mailer
}
