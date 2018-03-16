/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const emailUtils = require('../email/utils/helpers')
const moment = require('moment-timezone')
const nodemailer = require('nodemailer')
const P = require('bluebird')
const qs = require('querystring')
const url = require('url')

const TEMPLATE_VERSIONS = require('./templates/_versions.json')

const DEFAULT_LOCALE = 'en'
const DEFAULT_TIMEZONE = 'Etc/UTC'
const UTM_PREFIX = 'fx-'

const X_SES_CONFIGURATION_SET = 'X-SES-CONFIGURATION-SET'
const X_SES_MESSAGE_TAGS = 'X-SES-MESSAGE-TAGS'

module.exports = function (log, config) {
  const oauthClientInfo = require('./oauth_client_info')(log, config)

  // Email template to UTM campaign map, each of these should be unique and
  // map to exactly one email template.
  const templateNameToCampaignMap = {
    'newDeviceLoginEmail': 'new-device-signin',
    'passwordResetRequiredEmail': 'password-reset-required',
    'passwordChangedEmail': 'password-changed-success',
    'passwordResetEmail': 'password-reset-success',
    'postRemoveSecondaryEmail': 'account-email-removed',
    'postVerifyEmail': 'account-verified',
    'postChangePrimaryEmail': 'account-email-changed',
    'postVerifySecondaryEmail': 'account-email-verified',
    'postAddTwoStepAuthenticationEmail': 'account-two-step-enabled',
    'postRemoveTwoStepAuthenticationEmail': 'account-two-step-disabled',
    'recoveryEmail': 'forgot-password',
    'unblockCode': 'new-unblock',
    'verifyEmail': 'welcome',
    'verifyLoginEmail': 'new-signin',
    'verifyLoginCodeEmail': 'new-signin-verify-code',
    'verifyPrimaryEmail': 'welcome-primary',
    'verifySyncEmail': 'welcome-sync',
    'verifySecondaryEmail': 'welcome-secondary'
  }

  // Email template to UTM content, this is typically the main call out link/button
  // in template.
  const templateNameToContentMap = {
    'newDeviceLoginEmail': 'password-change',
    'passwordChangedEmail': 'password-change',
    'passwordResetEmail': 'password-reset',
    'passwordResetRequiredEmail': 'password-reset',
    'postRemoveSecondaryEmail': 'account-email-removed',
    'postVerifyEmail': 'connect-device',
    'postChangePrimaryEmail': 'account-email-changed',
    'postVerifySecondaryEmail': 'manage-account',
    'postAddTwoStepAuthenticationEmail': 'manage-account',
    'postRemoveTwoStepAuthenticationEmail': 'manage-account',
    'recoveryEmail': 'reset-password',
    'unblockCode': 'unblock-code',
    'verifyEmail': 'activate',
    'verifyLoginEmail': 'confirm-signin',
    'verifyLoginCodeEmail': 'new-signin-verify-code',
    'verifyPrimaryEmail': 'activate',
    'verifySyncEmail': 'activate-sync',
    'verifySecondaryEmail': 'activate',
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
    return 'href="' + url + '" style="color: #0a84ff; text-decoration: none; font-family: sans-serif;"'
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

  function sesMessageTagsHeaderValue(templateName) {
    return 'messageType=fxa-' + templateName + ', app=fxa'
  }

  function Mailer(translator, templates, config, sender) {
    var options = {
      host: config.host,
      secure: config.secure,
      ignoreTLS: ! config.secure,
      port: config.port
    }

    if (config.user && config.password) {
      options.auth = {
        user: config.user,
        pass: config.password
      }
    }

    this.accountSettingsUrl = config.accountSettingsUrl
    this.androidUrl = config.androidUrl
    this.initiatePasswordChangeUrl = config.initiatePasswordChangeUrl
    this.initiatePasswordResetUrl = config.initiatePasswordResetUrl
    this.iosUrl = config.iosUrl
    this.iosAdjustUrl = config.iosAdjustUrl
    this.mailer = sender || nodemailer.createTransport(options)
    this.passwordManagerInfoUrl = config.passwordManagerInfoUrl
    this.passwordResetUrl = config.passwordResetUrl
    this.privacyUrl = config.privacyUrl
    this.reportSignInUrl = config.reportSignInUrl
    this.sender = config.sender
    this.sesConfigurationSet = config.sesConfigurationSet
    this.supportUrl = config.supportUrl
    this.syncUrl = config.syncUrl
    this.templates = templates
    this.translator = translator.getTranslator
    this.verificationUrl = config.verificationUrl
    this.verifyLoginUrl = config.verifyLoginUrl
    this.verifySecondaryEmailUrl = config.verifySecondaryEmailUrl
    this.verifyPrimaryEmailUrl = config.verifyPrimaryEmailUrl
  }

  Mailer.prototype.stop = function () {
    this.mailer.close()
  }

  Mailer.prototype._supportLinkAttributes = function (templateName) {
    return linkAttributes(this.createSupportLink(templateName))
  }

  Mailer.prototype._passwordResetLinkAttributes = function (email, templateName, emailToHashWith) {
    return linkAttributes(this.createPasswordResetLink(email, templateName, emailToHashWith))
  }

  Mailer.prototype._passwordChangeLinkAttributes = function (email, templateName) {
    return linkAttributes(this.createPasswordChangeLink(email, templateName))
  }

  Mailer.prototype._formatUserAgentInfo = function (message) {
    // Build a first cut at a device description,
    // without using any new strings.
    // Future iterations can localize this better.
    var translator = this.translator(message.acceptLanguage)
    var uaBrowser = message.uaBrowser
    var uaOS = message.uaOS
    var uaOSVersion = message.uaOSVersion

    if (uaBrowser && uaOS && uaOSVersion) {
      return translator.format(translator.gettext('%(uaBrowser)s on %(uaOS)s %(uaOSVersion)s'),
                               { uaBrowser: uaBrowser, uaOS: uaOS, uaOSVersion: uaOSVersion })
    } else if (uaBrowser && uaOS) {
      return translator.format(translator.gettext('%(uaBrowser)s on %(uaOS)s'),
                               { uaBrowser: uaBrowser, uaOS: uaOS })
    }
    else {
      if (uaBrowser) {
        return uaBrowser
      } else if (uaOS) {
        if (uaOSVersion) {
          var parts = uaOS + ' ' + uaOSVersion
          return parts
        }
        else {
          return uaOS
        }
      }
      else {
        return ''
      }
    }
  }

  Mailer.prototype._constructLocationString = function (message) {
    var translator = this.translator(message.acceptLanguage)
    var location = message.location
    // construct the location string from the location object
    if (location) {
      if (location.city && location.stateCode) {
        return translator.format(translator.gettext('%(city)s, %(stateCode)s, %(country)s (estimated)'), location)
      } else if (location.city) {
        return translator.format(translator.gettext('%(city)s, %(country)s (estimated)'), location)
      } else if (location.stateCode) {
        return translator.format(translator.gettext('%(stateCode)s, %(country)s (estimated)'), location)
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

    const localized = this.localize(message)

    const template = message.template
    let templateVersion = TEMPLATE_VERSIONS[template]
    if (! templateVersion) {
      log.error({ op: 'emailTemplateVersion.missing', template })
      templateVersion = 1
    }
    message.templateVersion = templateVersion

    const headers = Object.assign(
      {
        'Content-Language': localized.language,
        'X-Template-Name': template,
        'X-Template-Version': templateVersion
      },
      message.headers,
      optionalHeader('X-Device-Id', message.deviceId),
      optionalHeader('X-Flow-Id', message.flowId),
      optionalHeader('X-Flow-Begin-Time', message.flowBeginTime),
      optionalHeader('X-Service-Id', message.service),
      optionalHeader('X-Uid', message.uid)
    )

    var emailConfig = {
      sender: this.sender,
      from: this.sender,
      to: message.email,
      subject: localized.subject,
      text: localized.text,
      html: localized.html,
      xMailer: false,
      headers
    }

    // Utilize nodemailer's cc ability to send to multiple addresses
    // Ref: https://nodemailer.com/message/
    if (message.ccEmails) {
      emailConfig.cc = message.ccEmails
    }

    if (this.sesConfigurationSet) {
      // Note on SES Event Publishing: The X-SES-CONFIGURATION-SET and
      // X-SES-MESSAGE-TAGS email headers will be stripped by SES from the
      // actual outgoing email messages.
      emailConfig.headers[X_SES_CONFIGURATION_SET] = this.sesConfigurationSet
    }

    log.info({
      email: message.email,
      op: 'mailer.send',
      template: message.template,
      headers: Object.keys(headers).join(',')
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
              id: status && status.messageId,
              to: emailConfig && emailConfig.to
            }
          )
          return d.reject(err)
        }
        log.info(
          {
            op: 'mailer.send.1',
            status: status && status.message,
            id: status && status.messageId,
            to: emailConfig && emailConfig.to
          }
        )

        emailUtils.logEmailEventSent(log, message)

        return d.resolve(status)
      }
    )
    return d.promise
  }

  Mailer.prototype.verifyEmail = function (message) {
    log.trace({ op: 'mailer.verifyEmail', email: message.email, uid: message.uid })

    var templateName = 'verifyEmail'
    var subject = gettext('Verify your Firefox Account')
    var query = {
      uid: message.uid,
      code: message.code
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.verificationUrl, message.email, query, templateName)

    var headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    if (message.service === 'sync') {
      subject = gettext('Confirm your email and start to sync!')
      templateName = 'verifySyncEmail'
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject,
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        privacyUrl: links.privacyUrl,
        sync: message.service,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes
      }
    }))
  }

  Mailer.prototype.unblockCodeEmail = function (message) {
    log.trace({ op: 'mailer.unblockCodeEmail', email: message.email, uid: message.uid })

    var templateName = 'unblockCodeEmail'
    var query = {
      unblockCode: message.unblockCode,
      email: message.email,
      uid: message.uid
    }

    var links = this._generateLinks(null, message.email, query, templateName)

    var headers = {
      'X-Unblock-Code': message.unblockCode,
      'X-Report-SignIn-Link': links.reportSignInLink
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Firefox Account authorization code'),
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        reportSignInLink: links.reportSignInLink,
        reportSignInLinkAttributes: links.reportSignInLinkAttributes,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage),
        unblockCode: message.unblockCode
      }
    }))
  }

  Mailer.prototype.verifyLoginEmail = function (message) {
    log.trace({ op: 'mailer.verifyLoginEmail', email: message.email, uid: message.uid })

    var templateName = 'verifyLoginEmail'
    var query = {
      code: message.code,
      uid: message.uid
    }
    var translator = this.translator(message.acceptLanguage)

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.verifyLoginUrl, message.email, query, templateName)

    var headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return oauthClientInfo.fetch(message.service).then((clientInfo) => {
      const clientName = clientInfo.name
      const subject = translator.format(translator.gettext('Confirm new sign-in to %(clientName)s'), {
        clientName: clientName
      })

      return this.send(Object.assign({}, message, {
        headers,
        subject,
        template: templateName,
        templateValues: {
          clientName,
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
        }
      }))
    })

  }

  Mailer.prototype.verifyLoginCodeEmail = function (message) {
    log.trace({ op: 'mailer.verifyLoginCodeEmail', email: message.email, uid: message.uid })

    var templateName = 'verifyLoginCodeEmail'
    var query = {
      code: message.code,
      uid: message.uid
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.verifyLoginUrl, message.email, query, templateName)

    var headers = {
      'X-Signin-Verify-Code': message.code
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Sign-in code for Firefox'),
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        tokenCode: message.code,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      }
    }))
  }

  Mailer.prototype.verifyPrimaryEmail = function (message) {
    log.trace({ op: 'mailer.verifyPrimaryEmail', email: message.email, uid: message.uid })

    const templateName = 'verifyPrimaryEmail'
    const query = {
      code: message.code,
      uid: message.uid,
      type: 'primary',
      primary_email_verified: message.email
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    const links = this._generateLinks(this.verifyPrimaryEmailUrl, message.email, query, templateName)

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Verify primary email'),
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.primaryEmail,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        passwordChangeLink: links.passwordChangeLink,
        privacyUrl: links.privacyUrl,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      }
    }))
  }

  Mailer.prototype.verifySecondaryEmail = function (message) {
    log.trace({ op: 'mailer.verifySecondaryEmail', email: message.email, uid: message.uid })

    var templateName = 'verifySecondaryEmail'
    var query = {
      code: message.code,
      uid: message.uid,
      type: 'secondary',
      secondary_email_verified: message.email
    }

    if (message.service) { query.service = message.service }
    if (message.redirectTo) { query.redirectTo = message.redirectTo }
    if (message.resume) { query.resume = message.resume }

    var links = this._generateLinks(this.verifySecondaryEmailUrl, message.email, query, templateName)

    var headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Verify secondary email'),
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        passwordChangeLink: links.passwordChangeLink,
        privacyUrl: links.privacyUrl,
        reportSignInLink: links.reportSignInLink,
        reportSignInLinkAttributes: links.reportSignInLinkAttributes,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage),
        primaryEmail: message.primaryEmail
      }
    }))
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
    if (message.emailToHashWith) { query.emailToHashWith = message.emailToHashWith }

    var links = this._generateLinks(this.passwordResetUrl, message.email, query, templateName)

    var headers = {
      'X-Link': links.link,
      'X-Recovery-Code': message.code
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Reset your Firefox Account password'),
      template: templateName,
      templateValues: {
        code: message.code,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      }
    }))
  }

  Mailer.prototype.passwordChangedEmail = function (message) {
    var templateName = 'passwordChangedEmail'

    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.resetLink
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Your Firefox Account password has been changed'),
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        ip: message.ip,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        resetLinkAttributes: links.resetLinkAttributes,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      }
    }))
  }

  Mailer.prototype.passwordResetEmail = function (message) {
    var templateName = 'passwordResetEmail'
    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.resetLink
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Firefox Account password changed'),
      template: templateName,
      templateValues: {
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        resetLinkAttributes: links.resetLinkAttributes,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl
      }
    }))
  }

  Mailer.prototype.passwordResetRequiredEmail = function (message) {
    var templateName = 'passwordResetRequiredEmail'
    var links = this._generateLinks(this.initiatePasswordResetUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.resetLink
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Firefox Account password reset required'),
      template: templateName,
      templateValues: {
        passwordManagerInfoUrl: links.passwordManagerInfoUrl,
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink
      }
    }))
  }

  Mailer.prototype.newDeviceLoginEmail = function (message) {
    log.trace({ op: 'mailer.newDeviceLoginEmail', email: message.email, uid: message.uid })
    var templateName = 'newDeviceLoginEmail'
    var links = this._generateLinks(this.initiatePasswordChangeUrl, message.email, {}, templateName)
    var translator = this.translator(message.acceptLanguage)

    var headers = {
      'X-Link': links.passwordChangeLink
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return oauthClientInfo.fetch(message.service).then((clientInfo) => {
      const clientName = clientInfo.name
      const subject = translator.format(translator.gettext('New sign-in to %(clientName)s'), {
        clientName: clientName
      })

      return this.send(Object.assign({}, message, {
        headers,
        subject,
        template: templateName,
        templateValues: {
          clientName,
          device: this._formatUserAgentInfo(message),
          ip: message.ip,
          location: this._constructLocationString(message),
          passwordChangeLink: links.passwordChangeLink,
          passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
          privacyUrl: links.privacyUrl,
          supportLinkAttributes: links.supportLinkAttributes,
          supportUrl: links.supportUrl,
          timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
        }
      }))
    })

  }

  Mailer.prototype.postVerifyEmail = function (message) {
    log.trace({ op: 'mailer.postVerifyEmail', email: message.email, uid: message.uid })

    var templateName = 'postVerifyEmail'
    var links = this._generateLinks(this.syncUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.link
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Firefox Account verified'),
      template: templateName,
      templateValues: {
        androidUrl: links.androidLink,
        androidLinkAttributes: linkAttributes(links.androidLink),
        link: links.link,
        iosUrl: links.iosLink,
        iosLinkAttributes: linkAttributes(links.iosLink),
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        supportLinkAttributes: links.supportLinkAttributes
      }
    }))
  }

  Mailer.prototype.postVerifySecondaryEmail = function (message) {
    log.trace({ op: 'mailer.postVerifySecondaryEmail', email: message.email, uid: message.uid })

    var templateName = 'postVerifySecondaryEmail'
    var links = this._generateLinks(this.accountSettingsUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.link
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Secondary Firefox Account email added'),
      template: templateName,
      templateValues: {
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        passwordChangeLink: links.passwordChangeLink,
        supportUrl: links.supportUrl,
        secondaryEmail: message.secondaryEmail,
        supportLinkAttributes: links.supportLinkAttributes
      }
    }))
  }

  Mailer.prototype.postChangePrimaryEmail = function (message) {
    log.trace({ op: 'mailer.postChangePrimaryEmail', email: message.email, uid: message.uid })

    var templateName = 'postChangePrimaryEmail'
    var links = this._generateLinks(this.accountSettingsUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.link
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Firefox Account new primary email'),
      template: templateName,
      templateValues: {
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        passwordChangeLink: links.passwordChangeLink,
        supportUrl: links.supportUrl,
        email: message.email,
        supportLinkAttributes: links.supportLinkAttributes
      }
    }))
  }

  Mailer.prototype.postRemoveSecondaryEmail = function (message) {
    log.trace({ op: 'mailer.postRemoveSecondaryEmail', email: message.email, uid: message.uid })

    var templateName = 'postRemoveSecondaryEmail'
    var links = this._generateLinks(this.accountSettingsUrl, message.email, {}, templateName)

    var headers = {
      'X-Link': links.link
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Secondary Firefox Account email removed'),
      template: templateName,
      templateValues: {
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        supportUrl: links.supportUrl,
        secondaryEmail: message.secondaryEmail,
        supportLinkAttributes: links.supportLinkAttributes
      }
    }))
  }

  Mailer.prototype.postAddTwoStepAuthenticationEmail = function (message) {
    log.trace({ op: 'mailer.postAddTwoStepAuthenticationEmail', email: message.email, uid: message.uid })

    const templateName = 'postAddTwoStepAuthenticationEmail'
    const links = this._generateLinks(this.accountSettingsUrl, message.email, {}, templateName)

    const headers = {
      'X-Link': links.link
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Two-step authentication enabled'),
      template: templateName,
      templateValues: {
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        passwordChangeLink: links.passwordChangeLink,
        supportUrl: links.supportUrl,
        email: message.email,
        supportLinkAttributes: links.supportLinkAttributes,
        device: this._formatUserAgentInfo(message),
        ip: message.ip,
        location: this._constructLocationString(message),
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      }
    }))
  }

  Mailer.prototype.postRemoveTwoStepAuthenticationEmail = function (message) {
    log.trace({ op: 'mailer.postRemoveTwoStepAuthenticationEmail', email: message.email, uid: message.uid })

    const templateName = 'postRemoveTwoStepAuthenticationEmail'
    const links = this._generateLinks(this.accountSettingsUrl, message.email, {}, templateName)

    const headers = {
      'X-Link': links.link
    }

    if (this.sesConfigurationSet) {
      headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(templateName)
    }

    return this.send(Object.assign({}, message, {
      headers,
      subject: gettext('Two-step authentication removed'),
      template: templateName,
      templateValues: {
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        passwordChangeLink: links.passwordChangeLink,
        supportUrl: links.supportUrl,
        email: message.email,
        supportLinkAttributes: links.supportLinkAttributes,
        device: this._formatUserAgentInfo(message),
        ip: message.ip,
        location: this._constructLocationString(message),
        timestamp: this._constructLocalTimeString(message.timeZone, message.acceptLanguage)
      }
    }))
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
    if (campaign && ! parsedQuery['utm_campaign']) {
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

    if (primaryLink && utmContent) {
      links['link'] = this._generateUTMLink(primaryLink, query, templateName, utmContent)
    }
    links['privacyUrl'] = this.createPrivacyLink(templateName)

    links['supportLinkAttributes'] = this._supportLinkAttributes(templateName)
    links['supportUrl'] = this.createSupportLink(templateName)

    links['passwordChangeLink'] = this.createPasswordChangeLink(email, templateName)
    links['passwordChangeLinkAttributes'] = this._passwordChangeLinkAttributes(email, templateName)

    links['resetLink'] = this.createPasswordResetLink(email, templateName, query.emailToHashWith)
    links['resetLinkAttributes'] = this._passwordResetLinkAttributes(email, templateName, query.emailToHashWith)

    links['androidLink'] = this._generateUTMLink(this.androidUrl, query, templateName, 'connect-android')
    links['iosLink'] = this._generateUTMLink(this.iosUrl, query, templateName, 'connect-ios')

    links['passwordManagerInfoUrl'] = this._generateUTMLink(this.passwordManagerInfoUrl, query, templateName, 'password-info')

    links['reportSignInLink'] = this.createReportSignInLink(templateName, query)
    links['reportSignInLinkAttributes'] = this._reportSignInLinkAttributes(email, templateName, query)

    var queryOneClick = extend(query, {one_click: true})
    if (primaryLink && utmContent) {
      links['oneClickLink'] = this._generateUTMLink(primaryLink, queryOneClick, templateName, utmContent + '-oneclick')
    }

    return links
  }

  Mailer.prototype.createPasswordResetLink = function (email, templateName, emailToHashWith) {
    // Default `reset_password_confirm` to false, to show warnings about
    // resetting password and sync data
    var query = { email: email, reset_password_confirm: false, email_to_hash_with : emailToHashWith}

    return this._generateUTMLink(this.initiatePasswordResetUrl, query, templateName, 'reset-password')
  }

  Mailer.prototype.createPasswordChangeLink = function (email, templateName) {
    var query = {email: email}

    return this._generateUTMLink(this.initiatePasswordChangeUrl, query, templateName, 'change-password')
  }

  Mailer.prototype.createReportSignInLink = function (templateName, data) {
    var query = {
      uid: data.uid,
      unblockCode: data.unblockCode
    }
    return this._generateUTMLink(this.reportSignInUrl, query, templateName, 'report')
  }

  Mailer.prototype._reportSignInLinkAttributes = function (email, templateName, query) {
    return linkAttributes(this.createReportSignInLink(templateName, query))
  }

  Mailer.prototype.createSupportLink = function (templateName) {
    return this._generateUTMLink(this.supportUrl, {}, templateName, 'support')
  }

  Mailer.prototype.createPrivacyLink = function (templateName) {
    return this._generateUTMLink(this.privacyUrl, {}, templateName, 'privacy')
  }

  return Mailer
}

function optionalHeader (key, value) {
  if (value) {
    return { [key]: value }
  }
}

