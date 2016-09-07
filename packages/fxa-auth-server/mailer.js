/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var qs = require('querystring')
var url = require('url')
var P = require('bluebird')
var nodemailer = require('nodemailer')
var moment = require('moment-timezone')

var DEFAULT_LOCALE = 'en'
var DEFAULT_TIMEZONE = 'Etc/UTC'
var UTM_PREFIX = 'fx-'

module.exports = function (log) {
  // Email template to UTM campaign map, each of these should be unique and
  // map to exactly one email template.
  var templateNameToCampaignMap = {
    'newDeviceLoginEmail': 'new-device-signin',
    'passwordResetRequiredEmail': 'password-reset-required',
    'passwordChangedEmail': 'password-changed-success',
    'passwordResetEmail': 'password-reset-success',
    'postVerifyEmail': 'account-verified',
    'recoveryEmail': 'forgot-password',
    'suspiciousLocationEmail': 'suspicious-location',
    'verifyEmail': 'welcome',
    'verifyLoginEmail': 'new-signin',
    'verificationReminderFirstEmail': 'hello-again-first',
    'verificationReminderSecondEmail': 'still-there-second',
    'verificationReminderEmail': 'hello-again-first'
  }

  // Email template to UTM content, this is typically the main call out link/button
  // in template.
  var templateNameToContentMap = {
    'newDeviceLoginEmail': 'password-change',
    'passwordChangedEmail': 'password-change',
    'passwordResetEmail': 'password-reset',
    'passwordResetRequiredEmail': 'password-reset',
    'postVerifyEmail': 'connect-device',
    'recoveryEmail': 'reset-password',
    'suspiciousLocationEmail': 'password-reset',
    'verificationReminderFirstEmail': 'activate',
    'verificationReminderSecondEmail': 'activate',
    'verificationReminderEmail': 'activate',
    'verifyEmail': 'activate',
    'verifyLoginEmail': 'confirm-signin'
  }

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

  function constructLocalTimeString (timeZone, locale) {
    // if no timeZone is passed, use DEFAULT_TIMEZONE
    moment.tz.setDefault(DEFAULT_TIMEZONE)
    // if no locale is passed, use DEFAULT_LOCALE
    locale = locale || DEFAULT_LOCALE
    moment.locale(locale)
    var time = moment()
    if (timeZone) {
      time = time.tz(timeZone)
    }
    // return a locale-specific time
    return time.format('LTS (z) dddd, ll')
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

    this.androidUrl = config.androidUrl
    this.initiatePasswordChangeUrl = config.initiatePasswordChangeUrl
    this.initiatePasswordResetUrl = config.initiatePasswordResetUrl
    this.iosUrl = config.iosUrl
    this.mailer = sender || nodemailer.createTransport('SMTP', options)
    this.passwordManagerInfoUrl = config.passwordManagerInfoUrl
    this.passwordResetUrl = config.passwordResetUrl
    this.privacyUrl = config.privacyUrl
    this.sender = config.sender
    this.supportUrl = config.supportUrl
    this.syncUrl = config.syncUrl
    this.templates = templates
    this.translator = translator
    this.verificationUrl = config.verificationUrl
    this.verifyLoginUrl = config.verifyLoginUrl
  }

  Mailer.prototype.stop = function () {
    this.mailer.close()
  }

  Mailer.prototype._supportLinkAttributes = function (templateName) {
    return linkAttributes(this.createSupportLink(templateName))
  }

  Mailer.prototype._passwordResetLinkAttributes = function (email, templateName) {
    return linkAttributes(this.createPasswordResetLink(email, templateName))
  }

  Mailer.prototype._passwordChangeLinkAttributes = function (email, templateName) {
    return linkAttributes(this.createPasswordChangeLink(email, templateName))
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

  Mailer.prototype._constructLocationString = function (message) {
    var translator = this.translator(message.acceptLanguage)
    var location = message.location
    // construct the location string from the location object
    if (location) {
      if (location.city) {
        return translator.format(translator.gettext('%(city)s, %(country)s (estimated)'), location)
      } else {
        return translator.format(translator.gettext('%(country)s (estimated)'), location)
      }
    }
    return ''
  }

  Mailer.prototype._constructLocalTimeString = function (timeZone, acceptLanguage) {
    var translator = this.translator(acceptLanguage)
    return constructLocalTimeString(timeZone, translator.language)
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
      text: localized.text
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
        if (err) {
          log.error(
            {
              op: 'mailer.send.1',
              err: err && err.message,
              status: status && status.message,
              id: status && status.messageId
            }
          )
          return d.reject(err)
        }
        log.info(
          {
            op: 'mailer.send.1',
            status: status && status.message,
            id: status && status.messageId
          }
        )
        return d.resolve(status)
      }
    )
    return d.promise
  }

  Mailer.prototype.verifyEmail = function (message) {
    log.trace({ op: 'mailer.verifyEmail', email: message.email, uid: message.uid })

    var templateName = 'verifyEmail'
    var query = {
      uid: message.uid,
      code: message.code
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.verificationUrl, message.email, query, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.link,
        'X-Service-ID': message.service,
        'X-Uid': message.uid,
        'X-Verify-Code': message.code
      },
      subject: gettext('Verify your Firefox Account'),
      template: templateName,
      templateValues: {
        alternativeLink: links.alternativeLink,
        email: message.email,
        link: links.link,
        oneClickLink: links.oneClickLink,
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes
      },
      uid: message.uid
    })
  }

  Mailer.prototype.verifyLoginEmail = function (message) {
    log.trace({ op: 'mailer.verifyLoginEmail', email: message.email, uid: message.uid })

    var templateName = 'verifyLoginEmail'
    var query = {
      code: message.code,
      uid: message.uid
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.verifyLoginUrl, message.email, query, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.link,
        'X-Service-ID': message.service,
        'X-Uid': message.uid,
        'X-Verify-Code': message.code
      },
      subject: gettext('Confirm new sign-in to Firefox'),
      template: templateName,
      templateValues: {
        alternativeLink: links.alternativeLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      },
      uid: message.uid
    })
  }

  Mailer.prototype.recoveryEmail = function (message) {
    var templateName = 'recoveryEmail'
    var query = {
      token: message.token,
      code: message.code,
      email: message.email
    }
    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.passwordResetUrl, message.email, query, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.link,
        'X-Recovery-Code': message.code
      },
      subject: gettext('Reset your Firefox Account password'),
      template: templateName,
      templateValues: {
        alternativeLink: links.alternativeLink,
        code: message.code,
        email: message.email,
        link: links.link,
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes
      },
      uid: message.uid
    })
  }

  Mailer.prototype.passwordChangedEmail = function (message) {
    var templateName = 'passwordChangedEmail'

    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.resetLink
      },
      subject: gettext('Your Firefox Account password has been changed'),
      template: templateName,
      templateValues: {
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        resetLinkAttributes: links.resetLinkAttributes,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.passwordResetEmail = function (message) {
    var templateName = 'passwordResetEmail'
    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.resetLink
      },
      subject: gettext('Your Firefox Account password has been reset'),
      template: templateName,
      templateValues: {
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        resetLinkAttributes: links.resetLinkAttributes,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl
      },
      uid: message.uid
    })
  }

  Mailer.prototype.passwordResetRequiredEmail = function (message) {
    var templateName = 'passwordResetRequiredEmail'
    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.resetLink
      },
      subject: gettext('Firefox Account password reset required'),
      template: templateName,
      templateValues: {
        passwordManagerInfoUrl: links.passwordManagerInfoUrl,
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink
      },
      uid: message.uid
    })
  }

  Mailer.prototype.newDeviceLoginEmail = function (message) {
    log.trace({ op: 'mailer.newDeviceLoginEmail', email: message.email, uid: message.uid })
    var templateName = 'newDeviceLoginEmail'
    var links = this._generateLinks(this.initiatePasswordChangeUrl, message.email, {}, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.passwordChangeLink
      },
      subject: gettext('New sign-in to Firefox'),
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        ip: message.ip,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      },
      uid: message.uid
    })
  }

  Mailer.prototype.postVerifyEmail = function (message) {
    log.trace({ op: 'mailer.postVerifyEmail', email: message.email, uid: message.uid })

    var templateName = 'postVerifyEmail'
    var links = this._generateLinks(this.syncUrl, message.email, {}, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage,
      email: message.email,
      headers: {
        'X-Link': links.link
      },
      subject: gettext('Firefox Account Verified'),
      template: templateName,
      templateValues: {
        alternativeLink: links.alternativeLink,
        androidUrl: links.androidLink,
        androidLinkAttributes: linkAttributes(links.androidLink),
        link: links.link,
        iosUrl: links.iosLink,
        iosLinkAttributes: linkAttributes(links.iosLink),
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes
      },
      uid: message.uid
    })
  }

  Mailer.prototype.suspiciousLocationEmail = function (message) {
    log.trace({ op: 'mailer.suspiciousLocationEmail', email: message.email, uid: message.uid })

    var templateName = 'suspiciousLocationEmail'
    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

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
        'X-Link': links.resetLink
      },
      subject: gettext('Suspicious activity with your Firefox Account'),
      template: templateName,
      templateValues: {
        passwordManagerInfoUrl: links.passwordManagerInfoUrl,
        privacyUrl: links.privacyUrl,
        locations: message.locations,
        resetLink: links.resetLink
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
    var templateName = 'verificationReminderFirstEmail'
    if (message.type === 'second') {
      subject = gettext('Still there?')
      templateName = 'verificationReminderSecondEmail'
    }

    var query = {
      uid: message.uid,
      code: message.code,
      reminder: message.type
    }

    var links = this._generateLinks(this.verificationUrl, message.email, query, templateName)

    return this.send({
      acceptLanguage: message.acceptLanguage || 'en',
      email: message.email,
      headers: {
        'X-Link': links.link,
        'X-Uid': message.uid,
        'X-Verify-Code': message.code
      },
      subject: subject,
      template: templateName,
      templateValues: {
        alternativeLink: links.alternativeLink,
        email: message.email,
        link: links.link,
        oneClickLink: links.oneClickLink,
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes
      },
      uid: message.uid
    })
  }

  Mailer.prototype._generateUTMLink = function (link, query, templateName, content) {
    var parsedLink = url.parse(link)

    // Extract current params from link, passed in query params will override any param in a link
    var parsedQuery = qs.parse(parsedLink.query)
    Object.keys(query).forEach(function (key) {
      parsedQuery[key] = query[key]
    })

    parsedQuery['utm_source'] = 'email'
    parsedQuery['utm_medium'] = 'email'

    var campaign = templateNameToCampaignMap[templateName]
    if (campaign && !parsedQuery['utm_campaign']) {
      parsedQuery['utm_campaign'] = UTM_PREFIX + campaign
    }

    if (content) {
      parsedQuery['utm_content'] = UTM_PREFIX + content
    }

    return parsedLink.protocol + '//' + parsedLink.host + parsedLink.pathname + '?' + qs.stringify(parsedQuery)
  }

  Mailer.prototype._generateLinks = function (primaryLink, email, query, templateName) {
    // Generate all possible links. The option to use a specific link
    // is left up to the template.
    var links = {}

    var utmContent = templateNameToContentMap[templateName]

    links['alternativeLink'] = this._generateUTMLink(primaryLink, query, templateName, utmContent + '-alternative')
    links['link'] = this._generateUTMLink(primaryLink, query, templateName, utmContent)
    links['privacyUrl'] = this.createPrivacyLink(templateName)

    links['supportLinkAttributes'] = this._supportLinkAttributes(templateName)
    links['supportUrl'] = this.createSupportLink(templateName)

    links['passwordChangeLink'] = this.createPasswordChangeLink(email, templateName)
    links['passwordChangeLinkAttributes'] = this._passwordChangeLinkAttributes(email, templateName)

    links['resetLink'] = this.createPasswordResetLink(email, templateName)
    links['resetLinkAttributes'] = this._passwordResetLinkAttributes(email, templateName)

    links['androidLink'] = this._generateUTMLink(this.androidUrl, query, templateName, 'connect-android')
    links['iosLink'] = this._generateUTMLink(this.iosUrl, query, templateName, 'connect-ios')

    links['passwordManagerInfoUrl'] = this._generateUTMLink(this.passwordManagerInfoUrl, query, templateName, 'password-info')

    var queryOneClick = extend(query, {one_click: true})
    links['oneClickLink'] = this._generateUTMLink(primaryLink, queryOneClick, templateName, utmContent + '-oneclick')

    return links
  }

  Mailer.prototype.createPasswordResetLink = function (email, templateName) {
    // Default `reset_password_confirm` to false, to show warnings about
    // resetting password and sync data
    var query = { email: email, reset_password_confirm: false }

    return this._generateUTMLink(this.initiatePasswordResetUrl, query, templateName, 'reset-password')
  }

  Mailer.prototype.createPasswordChangeLink = function (email, templateName) {
    var query = { email: email }

    return this._generateUTMLink(this.initiatePasswordChangeUrl, query, templateName, 'change-password')
  }

  Mailer.prototype.createSupportLink = function (templateName) {
    return this._generateUTMLink(this.supportUrl, {}, templateName, 'support')
  }

  Mailer.prototype.createPrivacyLink = function (templateName) {
    return this._generateUTMLink(this.privacyUrl, {}, templateName, 'privacy')
  }

  return Mailer
}
