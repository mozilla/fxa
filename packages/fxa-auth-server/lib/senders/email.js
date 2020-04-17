/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const emailUtils = require('../email/utils/helpers');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const P = require('bluebird');
const safeUserAgent = require('../userAgent/safe');
const url = require('url');
const { URL } = url;
const PostVerifyEmailGroupingRule = require('../experiments/post-verify-emails');

const TEMPLATE_VERSIONS = require('./templates/_versions.json');

const DEFAULT_LOCALE = 'en';
const DEFAULT_TIMEZONE = 'Etc/UTC';
const UTM_PREFIX = 'fx-';

const X_SES_CONFIGURATION_SET = 'X-SES-CONFIGURATION-SET';
const X_SES_MESSAGE_TAGS = 'X-SES-MESSAGE-TAGS';

module.exports = function(log, config, oauthdb) {
  const oauthClientInfo = require('./oauth_client_info')(log, config, oauthdb);
  const verificationReminders = require('../verification-reminders')(
    log,
    config
  );
  const postVerifyEmailsExperiment = new PostVerifyEmailGroupingRule(
    config.experiments.postVerifyEmails
  );

  // Email template to UTM campaign map, each of these should be unique and
  // map to exactly one email template.
  const templateNameToCampaignMap = {
    subscriptionReactivation: 'subscription-reactivation',
    subscriptionUpgrade: 'subscription-upgrade',
    subscriptionDowngrade: 'subscription-downgrade',
    subscriptionPaymentExpired: 'subscription-payment-expired',
    subscriptionPaymentFailed: 'subscription-payment-failed',
    subscriptionAccountDeletion: 'subscription-account-deletion',
    subscriptionCancellation: 'subscription-cancellation',
    subscriptionSubsequentInvoice: 'subscription-subsequent-invoice',
    subscriptionFirstInvoice: 'subscription-first-invoice',
    downloadSubscription: 'new-subscription',
    lowRecoveryCodes: 'low-recovery-codes',
    newDeviceLogin: 'new-device-signin',
    passwordResetRequired: 'password-reset-required',
    passwordChanged: 'password-changed-success',
    passwordReset: 'password-reset-success',
    passwordResetAccountRecovery: 'password-reset-account-recovery-success',
    postRemoveSecondary: 'account-email-removed',
    postVerify: 'account-verified',
    postVerifyAddRecoveryKey: 'account-verified',
    postVerifyAddSecondary: 'account-verified',
    postChangePrimary: 'account-email-changed',
    postVerifySecondary: 'account-email-verified',
    postAddTwoStepAuthentication: 'account-two-step-enabled',
    postRemoveTwoStepAuthentication: 'account-two-step-disabled',
    postConsumeRecoveryCode: 'account-consume-recovery-code',
    postNewRecoveryCodes: 'account-replace-recovery-codes',
    postAddAccountRecovery: 'account-recovery-generated',
    postRemoveAccountRecovery: 'account-recovery-removed',
    recovery: 'forgot-password',
    unblockCode: 'new-unblock',
    verify: 'welcome',
    verifyShortCode: 'welcome',
    verifyLogin: 'new-signin',
    verifyLoginCode: 'new-signin-verify-code',
    verifyPrimary: 'welcome-primary',
    verifySecondary: 'welcome-secondary',
    verifySecondaryCode: 'welcome-secondary',
  };

  // Email template to UTM content, this is typically the main call out link/button
  // in template.
  const templateNameToContentMap = {
    subscriptionReactivation: 'subscriptions',
    subscriptionUpgrade: 'subscriptions',
    subscriptionDowngrade: 'subscriptions',
    subscriptionPaymentExpired: 'subscriptions',
    subscriptionPaymentFailed: 'subscriptions',
    subscriptionAccountDeletion: 'subscriptions',
    subscriptionCancellation: 'subscriptions',
    subscriptionSubsequentInvoice: 'subscriptions',
    subscriptionFirstInvoice: 'subscriptions',
    downloadSubscription: 'subscriptions',
    lowRecoveryCodes: 'recovery-codes',
    newDeviceLogin: 'manage-account',
    passwordChanged: 'password-change',
    passwordReset: 'password-reset',
    passwordResetAccountRecovery: 'create-recovery-key',
    passwordResetRequired: 'password-reset',
    postRemoveSecondary: 'account-email-removed',
    postVerify: 'connect-device',
    postVerifyAddRecoveryKey: 'add-recovery-key',
    postVerifyAddSecondary: 'add-secondary-email',
    postChangePrimary: 'account-email-changed',
    postVerifySecondary: 'manage-account',
    postAddTwoStepAuthentication: 'manage-account',
    postRemoveTwoStepAuthentication: 'manage-account',
    postConsumeRecoveryCode: 'manage-account',
    postNewRecoveryCodes: 'manage-account',
    postAddAccountRecovery: 'manage-account',
    postRemoveAccountRecovery: 'manage-account',
    recovery: 'reset-password',
    unblockCode: 'unblock-code',
    verify: 'activate',
    verifyShortCode: 'activate',
    verifyLogin: 'confirm-signin',
    verifyLoginCode: 'new-signin-verify-code',
    verifyPrimary: 'activate',
    verifySecondary: 'activate',
    verifySecondaryCode: 'activate',
  };

  function extend(target, source) {
    for (const key in source) {
      target[key] = source[key];
    }

    return target;
  }

  // helper used to ensure strings are extracted
  function gettext(txt) {
    return txt;
  }

  function linkAttributes(url) {
    // Not very nice to have presentation code in here, but this is to help l10n
    // contributors not deal with extraneous noise in strings.
    return `href="${url}" style="color: #0a84ff; text-decoration: none; font-family: sans-serif;"`;
  }

  function constructLocalTimeString(timeZone, locale) {
    // if no timeZone is passed, use DEFAULT_TIMEZONE
    moment.tz.setDefault(DEFAULT_TIMEZONE);
    // if no locale is passed, use DEFAULT_LOCALE
    locale = locale || DEFAULT_LOCALE;
    moment.locale(locale);
    let time = moment();
    if (timeZone) {
      time = time.tz(timeZone);
    }
    // return a locale-specific time
    return time.format('LTS (z) dddd, ll');
  }

  function constructLocalDateString(timeZone, locale, date) {
    // if no timeZone is passed, use DEFAULT_TIMEZONE
    moment.tz.setDefault(DEFAULT_TIMEZONE);
    // if no locale is passed, use DEFAULT_LOCALE
    locale = locale || DEFAULT_LOCALE;
    moment.locale(locale);
    let time = moment(date);
    if (timeZone) {
      time = time.tz(timeZone);
    }
    // return a locale-specific date
    return time.format('L');
  }

  function sesMessageTagsHeaderValue(templateName, serviceName) {
    return `messageType=fxa-${templateName}, app=fxa, service=${serviceName}`;
  }

  // These are brand names, so they probably don't need l10n.
  const CARD_TYPE_TO_TEXT = {
    amex: 'American Express',
    diners: 'Diners Club',
    discover: 'Discover',
    jcb: 'JCB',
    mastercard: 'MasterCard',
    unionpay: 'UnionPay',
    visa: 'Visa',
    unknown: 'Unknown',
  };

  function cardTypeToText(cardType) {
    return CARD_TYPE_TO_TEXT[cardType] || CARD_TYPE_TO_TEXT.unknown;
  }

  function Mailer(translator, templates, mailerConfig, sender) {
    const options = {
      host: mailerConfig.host,
      secure: mailerConfig.secure,
      ignoreTLS: !mailerConfig.secure,
      port: mailerConfig.port,
    };

    if (mailerConfig.user && mailerConfig.password) {
      options.auth = {
        user: mailerConfig.user,
        pass: mailerConfig.password,
      };
    }

    this.accountSettingsUrl = mailerConfig.accountSettingsUrl;
    this.accountRecoveryCodesUrl = mailerConfig.accountRecoveryCodesUrl;
    this.androidUrl = mailerConfig.androidUrl;
    this.createAccountRecoveryUrl = mailerConfig.createAccountRecoveryUrl;
    this.emailService = sender || require('./email_service')(config);
    this.initiatePasswordChangeUrl = mailerConfig.initiatePasswordChangeUrl;
    this.initiatePasswordResetUrl = mailerConfig.initiatePasswordResetUrl;
    this.iosUrl = mailerConfig.iosUrl;
    this.iosAdjustUrl = mailerConfig.iosAdjustUrl;
    this.mailer = sender || nodemailer.createTransport(options);
    this.passwordManagerInfoUrl = mailerConfig.passwordManagerInfoUrl;
    this.passwordResetUrl = mailerConfig.passwordResetUrl;
    this.prependVerificationSubdomain =
      mailerConfig.prependVerificationSubdomain;
    this.privacyUrl = mailerConfig.privacyUrl;
    this.reportSignInUrl = mailerConfig.reportSignInUrl;
    this.revokeAccountRecoveryUrl = mailerConfig.revokeAccountRecoveryUrl;
    this.selectEmailServices = require('./select_email_services')(
      log,
      config,
      this.mailer,
      this.emailService
    );
    this.sender = mailerConfig.sender;
    this.sesConfigurationSet = mailerConfig.sesConfigurationSet;
    this.subscriptionSettingsUrl = mailerConfig.subscriptionSettingsUrl;
    this.subscriptionSupportUrl = mailerConfig.subscriptionSupportUrl;
    this.subscriptionTermsUrl = mailerConfig.subscriptionTermsUrl;
    this.supportUrl = mailerConfig.supportUrl;
    this.syncUrl = mailerConfig.syncUrl;
    this.templates = templates;
    this.translator = translator.getTranslator;
    this.verificationUrl = mailerConfig.verificationUrl;
    this.verifyLoginUrl = mailerConfig.verifyLoginUrl;
    this.verifySecondaryEmailUrl = mailerConfig.verifySecondaryEmailUrl;
    this.verifyPrimaryEmailUrl = mailerConfig.verifyPrimaryEmailUrl;
    this.postVerifyAddSecondaryEmailUrl =
      mailerConfig.postVerifyAddSecondaryEmailUrl;
    this.postVerifyAddRecoveryKeyUrl = mailerConfig.postVerifyAddRecoveryKeyUrl;
  }

  Mailer.prototype.stop = function() {
    this.mailer.close();
  };

  Mailer.prototype._supportLinkAttributes = function(templateName) {
    return linkAttributes(this.createSupportLink(templateName));
  };

  Mailer.prototype._passwordResetLinkAttributes = function(
    email,
    templateName,
    emailToHashWith
  ) {
    return linkAttributes(
      this.createPasswordResetLink(email, templateName, emailToHashWith)
    );
  };

  Mailer.prototype._passwordChangeLinkAttributes = function(
    email,
    templateName
  ) {
    return linkAttributes(this.createPasswordChangeLink(email, templateName));
  };

  Mailer.prototype._formatUserAgentInfo = function(message) {
    // Build a first cut at a device description,
    // without using any new strings.
    // Future iterations can localize this better.
    const translator = this.translator(message.acceptLanguage);
    const uaBrowser = safeUserAgent.name(message.uaBrowser);
    const uaOS = safeUserAgent.name(message.uaOS);
    const uaOSVersion = safeUserAgent.version(message.uaOSVersion);

    if (uaBrowser && uaOS && uaOSVersion) {
      return translator.format(
        translator.gettext('%(uaBrowser)s on %(uaOS)s %(uaOSVersion)s'),
        { uaBrowser: uaBrowser, uaOS: uaOS, uaOSVersion: uaOSVersion }
      );
    } else if (uaBrowser && uaOS) {
      return translator.format(
        translator.gettext('%(uaBrowser)s on %(uaOS)s'),
        { uaBrowser: uaBrowser, uaOS: uaOS }
      );
    } else {
      if (uaBrowser) {
        return uaBrowser;
      } else if (uaOS) {
        if (uaOSVersion) {
          const parts = `${uaOS} ${uaOSVersion}`;
          return parts;
        } else {
          return uaOS;
        }
      } else {
        return '';
      }
    }
  };

  Mailer.prototype._constructLocationString = function(message) {
    const translator = this.translator(message.acceptLanguage);
    const location = message.location;
    // construct the location string from the location object
    if (location) {
      if (location.city && location.stateCode) {
        return translator.format(
          translator.gettext(
            '%(city)s, %(stateCode)s, %(country)s (estimated)'
          ),
          location
        );
      } else if (location.city) {
        return translator.format(
          translator.gettext('%(city)s, %(country)s (estimated)'),
          location
        );
      } else if (location.stateCode) {
        return translator.format(
          translator.gettext('%(stateCode)s, %(country)s (estimated)'),
          location
        );
      } else {
        return translator.format(
          translator.gettext('%(country)s (estimated)'),
          location
        );
      }
    }
    return '';
  };

  Mailer.prototype._constructLocalTimeString = function(
    timeZone,
    acceptLanguage
  ) {
    const translator = this.translator(acceptLanguage);
    return constructLocalTimeString(timeZone, translator.language);
  };

  Mailer.prototype._constructLocalDateString = function(
    timeZone,
    acceptLanguage,
    date
  ) {
    const translator = this.translator(acceptLanguage);
    return constructLocalDateString(timeZone, translator.language, date);
  };

  Mailer.prototype.localize = function(message) {
    const translator = this.translator(message.acceptLanguage);

    const templateValues = {
      ...message.templateValues,
      action:
        message.templateValues.action &&
        translator.gettext(message.templateValues.action),
      language: translator.language,
      translator,
    };

    const localized = this.templates.render(
      message.template,
      message.layout || 'fxa',
      templateValues
    );

    return {
      html: localized.html,
      language: translator.language,
      subject: translator.format(
        translator.gettext(message.subject),
        templateValues,
        true
      ),
      text: localized.text,
    };
  };

  Mailer.prototype.send = function(message) {
    log.trace(`mailer.${message.template}`, {
      email: message.email,
      uid: message.uid,
    });
    const localized = this.localize(message);

    const template = message.template;
    let templateVersion = TEMPLATE_VERSIONS[template];
    if (!templateVersion) {
      log.error('emailTemplateVersion.missing', { template });
      templateVersion = 1;
    }
    message.templateVersion = templateVersion;

    return this.selectEmailServices(message).then(services => {
      return P.all(
        services.map(service => {
          const headers = {
            'Content-Language': localized.language,
            'X-Template-Name': template,
            'X-Template-Version': templateVersion,
            ...message.headers,
            ...optionalHeader('X-Device-Id', message.deviceId),
            ...optionalHeader('X-Flow-Id', message.flowId),
            ...optionalHeader('X-Flow-Begin-Time', message.flowBeginTime),
            ...optionalHeader('X-Service-Id', message.service),
            ...optionalHeader('X-Uid', message.uid),
          };

          const { mailer, emailAddresses, emailService, emailSender } = service;

          // Set headers that let us attribute success/failure correctly
          message.emailService = headers['X-Email-Service'] = emailService;
          message.emailSender = headers['X-Email-Sender'] = emailSender;

          if (this.sesConfigurationSet && emailSender === 'ses') {
            // Note on SES Event Publishing: The X-SES-CONFIGURATION-SET and
            // X-SES-MESSAGE-TAGS email headers will be stripped by SES from the
            // actual outgoing email messages.
            headers[X_SES_CONFIGURATION_SET] = this.sesConfigurationSet;
            headers[X_SES_MESSAGE_TAGS] = sesMessageTagsHeaderValue(
              message.metricsTemplate || template,
              emailService
            );
          }

          log.info('mailer.send', {
            email: emailAddresses[0],
            template,
            headers: Object.keys(headers).join(','),
          });

          const emailConfig = {
            sender: this.sender,
            from: this.sender,
            to: emailAddresses[0],
            subject: localized.subject,
            text: localized.text,
            html: localized.html,
            xMailer: false,
            headers,
          };

          if (emailAddresses.length > 1) {
            emailConfig.cc = emailAddresses.slice(1);
          }

          if (emailService === 'fxa-email-service') {
            emailConfig.provider = emailSender;
          }

          const d = P.defer();
          mailer.sendMail(emailConfig, (err, status) => {
            if (err) {
              log.error('mailer.send.error', {
                err: err.message,
                code: err.code,
                errno: err.errno,
                message: status && status.message,
                to: emailConfig && emailConfig.to,
                emailSender,
                emailService,
              });

              return d.reject(err);
            }

            log.info('mailer.send.1', {
              status: status && status.message,
              id: status && status.messageId,
              to: emailConfig && emailConfig.to,
              emailSender,
              emailService,
            });

            emailUtils.logEmailEventSent(log, {
              ...message,
              headers,
            });

            return d.resolve(status);
          });

          return d.promise;
        })
      );
    });
  };

  Mailer.prototype.verifyEmail = async function(message) {
    log.trace('mailer.verifyEmail', { email: message.email, uid: message.uid });

    const templateName = 'verify';
    const subject = gettext('Finish creating your account');
    const action = gettext('Confirm email');
    const query = {
      uid: message.uid,
      code: message.code,
    };

    if (message.service) {
      query.service = message.service;
    }
    if (message.redirectTo) {
      query.redirectTo = message.redirectTo;
    }
    if (message.resume) {
      query.resume = message.resume;
    }
    if (message.style) {
      query.style = message.style;
    }

    const links = this._generateLinks(
      this.verificationUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    const clientInfo = await oauthClientInfo.fetch(message.service);
    const serviceName = clientInfo.name;

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        privacyUrl: links.privacyUrl,
        serviceName: serviceName,
        style: message.style,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        sync: message.service === 'sync',
      },
    });
  };

  Mailer.prototype.verifyShortCodeEmail = async function(message) {
    log.trace('mailer.verifyShortCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyShortCode';
    const metricsTemplateName = 'verify';
    const code = message.code;
    const subject = gettext('Verification code: %(code)s');

    const links = this._generateLinks(
      this.verificationUrl,
      message,
      {},
      templateName
    );

    const headers = {
      'X-Verify-Short-Code': code,
    };

    return this.send({
      ...message,
      headers,
      metricsTemplate: metricsTemplateName,
      subject,
      template: templateName,
      templateValues: {
        code,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  verificationReminders.keys.forEach((key, index) => {
    // Template names are generated in the form `verificationReminderFirstEmail`,
    // where `First` is the key derived from config, with an initial capital letter.
    const template = `verificationReminder${key[0].toUpperCase()}${key.substr(
      1
    )}`;
    let subject;
    if (index < verificationReminders.keys.length - 1) {
      subject = gettext('Reminder: Finish creating your account');
    } else {
      subject = gettext('Final reminder: Activate your account');
    }

    templateNameToCampaignMap[template] = `${key}-verification-reminder`;
    templateNameToContentMap[template] = 'confirm-email';

    Mailer.prototype[`${template}Email`] = async function(message) {
      const { code, email, uid } = message;

      log.trace(`mailer.${template}`, { code, email, uid });

      const query = { code, reminder: key, uid };
      const links = this._generateLinks(
        this.verificationUrl,
        message,
        query,
        template
      );
      const action = gettext('Confirm email');
      const headers = {
        'X-Link': links.link,
        'X-Verify-Code': code,
      };

      return this.send({
        ...message,
        headers,
        subject,
        template,
        templateValues: {
          action,
          email,
          link: links.link,
          oneClickLink: links.oneClickLink,
          privacyUrl: links.privacyUrl,
          subject,
          supportUrl: links.supportUrl,
          supportLinkAttributes: links.supportLinkAttributes,
        },
      });
    };
  });

  Mailer.prototype.unblockCodeEmail = function(message) {
    log.trace('mailer.unblockCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'unblockCode';
    const query = {
      unblockCode: message.unblockCode,
      email: message.email,
      uid: message.uid,
    };
    const subject = gettext('Account authorization code');

    const links = this._generateLinks(null, message, query, templateName);

    const headers = {
      'X-Unblock-Code': message.unblockCode,
      'X-Report-SignIn-Link': links.reportSignInLink,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        reportSignInLink: links.reportSignInLink,
        reportSignInLinkAttributes: links.reportSignInLinkAttributes,
        subject,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
        unblockCode: message.unblockCode,
      },
    });
  };

  Mailer.prototype.verifyLoginEmail = function(message) {
    log.trace('mailer.verifyLoginEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyLogin';
    const query = {
      code: message.code,
      uid: message.uid,
    };
    const translator = this.translator(message.acceptLanguage);

    if (message.service) {
      query.service = message.service;
    }
    if (message.redirectTo) {
      query.redirectTo = message.redirectTo;
    }
    if (message.resume) {
      query.resume = message.resume;
    }

    const links = this._generateLinks(
      this.verifyLoginUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    return oauthClientInfo.fetch(message.service).then(clientInfo => {
      const clientName = clientInfo.name;
      const subject = translator.gettext(
        'Confirm new sign-in to %(clientName)s'
      );
      const action = gettext('Confirm sign-in');

      return this.send({
        ...message,
        headers,
        subject,
        template: templateName,
        templateValues: {
          action,
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
          subject,
          supportLinkAttributes: links.supportLinkAttributes,
          supportUrl: links.supportUrl,
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      });
    });
  };

  Mailer.prototype.verifyLoginCodeEmail = async function(message) {
    log.trace('mailer.verifyLoginCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyLoginCode';
    const query = {
      code: message.code,
      uid: message.uid,
    };
    const subject = gettext('Sign-in code for %(serviceName)s');

    if (message.service) {
      query.service = message.service;
    }
    if (message.redirectTo) {
      query.redirectTo = message.redirectTo;
    }
    if (message.resume) {
      query.resume = message.resume;
    }

    const links = this._generateLinks(
      this.verifyLoginUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Signin-Verify-Code': message.code,
    };

    const { name: serviceName } = await oauthClientInfo.fetch(message.service);

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        code: message.code,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        serviceName,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
        tokenCode: message.code,
      },
    });
  };

  Mailer.prototype.verifyPrimaryEmail = function(message) {
    log.trace('mailer.verifyPrimaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyPrimary';
    const query = {
      code: message.code,
      uid: message.uid,
      type: 'primary',
      primary_email_verified: message.email,
    };
    const subject = gettext('Confirm primary email');
    const action = gettext('Verify email');

    if (message.service) {
      query.service = message.service;
    }
    if (message.redirectTo) {
      query.redirectTo = message.redirectTo;
    }
    if (message.resume) {
      query.resume = message.resume;
    }

    const links = this._generateLinks(
      this.verifyPrimaryEmailUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        device: this._formatUserAgentInfo(message),
        email: message.primaryEmail,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.verifySecondaryEmail = function(message) {
    log.trace('mailer.verifySecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifySecondary';
    const subject = gettext('Confirm secondary email');
    const action = gettext('Verify email');
    const query = {
      code: message.code,
      uid: message.uid,
      type: 'secondary',
      secondary_email_verified: message.email,
    };

    if (message.service) {
      query.service = message.service;
    }
    if (message.redirectTo) {
      query.redirectTo = message.redirectTo;
    }
    if (message.resume) {
      query.resume = message.resume;
    }

    const links = this._generateLinks(
      this.verifySecondaryEmailUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        oneClickLink: links.oneClickLink,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        primaryEmail: message.primaryEmail,
        privacyUrl: links.privacyUrl,
        reportSignInLink: links.reportSignInLink,
        reportSignInLinkAttributes: links.reportSignInLinkAttributes,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.verifySecondaryCodeEmail = function(message) {
    log.trace('mailer.verifySecondaryCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifySecondaryCode';
    const subject = gettext('Confirm secondary email');
    const action = gettext('Verify email');

    const links = this._generateLinks(undefined, message, {}, templateName);

    const headers = {
      'X-Verify-Code': message.code,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        code: message.code,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        primaryEmail: message.primaryEmail,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.recoveryEmail = function(message) {
    const templateName = 'recovery';
    const query = {
      uid: message.uid,
      token: message.token,
      code: message.code,
      email: message.email,
    };
    if (message.service) {
      query.service = message.service;
    }
    if (message.redirectTo) {
      query.redirectTo = message.redirectTo;
    }
    if (message.resume) {
      query.resume = message.resume;
    }
    if (message.emailToHashWith) {
      query.emailToHashWith = message.emailToHashWith;
    }
    const subject = gettext('Reset your password');
    const action = gettext('Create new password');

    const links = this._generateLinks(
      this.passwordResetUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Recovery-Code': message.code,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        code: message.code,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.passwordChangedEmail = function(message) {
    const templateName = 'passwordChanged';
    const subject = gettext('Password updated');

    const links = this._generateLinks(
      this.initiatePasswordResetUrl,
      message,
      {},
      templateName
    );

    const headers = {
      'X-Link': links.resetLink,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        device: this._formatUserAgentInfo(message),
        ip: message.ip,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        resetLinkAttributes: links.resetLinkAttributes,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.passwordResetEmail = function(message) {
    const templateName = 'passwordReset';
    const subject = gettext('Password updated');
    const links = this._generateLinks(
      this.initiatePasswordResetUrl,
      message,
      {},
      templateName
    );

    const headers = {
      'X-Link': links.resetLink,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        resetLinkAttributes: links.resetLinkAttributes,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.passwordResetRequiredEmail = function(message) {
    const templateName = 'passwordResetRequired';
    const subject = gettext('Suspicious activity detected');
    const links = this._generateLinks(
      this.initiatePasswordResetUrl,
      message,
      {},
      templateName
    );

    const headers = {
      'X-Link': links.resetLink,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        passwordManagerInfoUrl: links.passwordManagerInfoUrl,
        privacyUrl: links.privacyUrl,
        resetLink: links.resetLink,
        subject,
      },
    });
  };

  Mailer.prototype.newDeviceLoginEmail = function(message) {
    log.trace('mailer.newDeviceLoginEmail', {
      email: message.email,
      uid: message.uid,
    });
    const templateName = 'newDeviceLogin';
    const links = this._generateSettingLinks(message, templateName);
    const translator = this.translator(message.acceptLanguage);

    const headers = {
      'X-Link': links.passwordChangeLink,
    };

    return oauthClientInfo.fetch(message.service).then(clientInfo => {
      const clientName = clientInfo.name;
      const subject = translator.gettext('New sign-in to %(clientName)s');
      const action = gettext('Manage account');

      return this.send({
        ...message,
        headers,
        subject,
        template: templateName,
        templateValues: {
          action,
          clientName,
          device: this._formatUserAgentInfo(message),
          ip: message.ip,
          link: links.link,
          location: this._constructLocationString(message),
          passwordChangeLink: links.passwordChangeLink,
          passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
          privacyUrl: links.privacyUrl,
          subject,
          supportLinkAttributes: links.supportLinkAttributes,
          supportUrl: links.supportUrl,
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      });
    });
  };

  Mailer.prototype.postVerifyEmail = function(message) {
    // If post verify email experiment is active, send the corresponding emails
    if (postVerifyEmailsExperiment.enabled) {
      const choice = postVerifyEmailsExperiment.choose({ uid: message.uid });
      switch (choice) {
        case 'treatment-secondary':
          return this.postVerifyAddSecondaryEmail(message);
        case 'treatment-recovery':
          return this.postVerifyAddRecoveryKeyEmail(message);
        case 'control':
          // The control for the experiment is the default `Connect another device` email
          break;
        default:
      }
    }

    log.trace('mailer.postVerifyEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postVerify';
    const subject = gettext('Account confirmed');
    const query = {};

    const action = gettext('Connect another device');

    const links = this._generateLinks(
      this.syncUrl,
      message,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLinkAttributes: linkAttributes(links.androidLink),
        androidUrl: links.androidLink,
        iosLinkAttributes: linkAttributes(links.iosLink),
        iosUrl: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        style: message.style,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postVerifySecondaryEmail = function(message) {
    log.trace('mailer.postVerifySecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postVerifySecondary';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Secondary email added');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        secondaryEmail: message.secondaryEmail,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postVerifyAddSecondaryEmail = function(message) {
    log.trace('mailer.postVerifyAddSecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postVerifyAddSecondary';
    const links = this._generateSettingLinks(
      message,
      templateName,
      this.postVerifyAddSecondaryEmailUrl
    );
    const subject = gettext('Set up recovery email');
    const action = gettext('Add a secondary email');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        email: message.email,
        action,
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        secondaryEmail: message.secondaryEmail,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postVerifyAddRecoveryKeyEmail = function(message) {
    log.trace('mailer.postVerifyAddRecoveryKeyEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postVerifyAddRecoveryKey';

    // To fetch encryption keys (required to enable recovery keys), the user must specify the `keys=true`
    const query = {
      email: message.email,
      uid: message.uid,
      keys: true,
    };

    const links = this._generateLinks(
      this.postVerifyAddRecoveryKeyUrl,
      message,
      query,
      templateName
    );

    const subject = gettext('Get a recovery key');
    const action = gettext('Get a recovery key');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        email: message.email,
        action,
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        secondaryEmail: message.secondaryEmail,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postChangePrimaryEmail = function(message) {
    log.trace('mailer.postChangePrimaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postChangePrimary';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Primary email updated');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        email: message.email,
        iosLink: links.iosLink,
        link: links.link,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postRemoveSecondaryEmail = function(message) {
    log.trace('mailer.postRemoveSecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postRemoveSecondary';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Secondary email removed');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        iosLink: links.iosLink,
        link: links.link,
        privacyUrl: links.privacyUrl,
        secondaryEmail: message.secondaryEmail,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postAddTwoStepAuthenticationEmail = function(message) {
    log.trace('mailer.postAddTwoStepAuthenticationEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postAddTwoStepAuthentication';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Two-step verification enabled');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        ip: message.ip,
        iosLink: links.iosLink,
        link: links.link,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.postRemoveTwoStepAuthenticationEmail = function(message) {
    log.trace('mailer.postRemoveTwoStepAuthenticationEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postRemoveTwoStepAuthentication';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Two-step verification is off');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        iosLink: links.iosLink,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.postNewRecoveryCodesEmail = function(message) {
    log.trace('mailer.postNewRecoveryCodesEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postNewRecoveryCodes';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('New recovery codes generated');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        iosLink: links.iosLink,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.postConsumeRecoveryCodeEmail = function(message) {
    log.trace('mailer.postConsumeRecoveryCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postConsumeRecoveryCode';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Recovery code used');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        iosLink: links.iosLink,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.lowRecoveryCodesEmail = function(message) {
    const { numberRemaining } = message;

    log.trace('mailer.lowRecoveryCodesEmail', {
      email: message.email,
      uid: message.uid,
      numberRemaining,
    });

    const templateName = 'lowRecoveryCodes';
    const links = this._generateLowRecoveryCodesLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    let subject;
    if (numberRemaining === 1) {
      subject = gettext('1 recovery code remaining');
    } else {
      subject = gettext('%(numberRemaining)s recovery codes remaining');
    }

    const action = gettext('Generate codes');

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        email: message.email,
        iosLink: links.iosLink,
        link: links.link,
        numberRemaining,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
      },
    });
  };

  Mailer.prototype.postAddAccountRecoveryEmail = function(message) {
    log.trace('mailer.postAddAccountRecoveryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postAddAccountRecovery';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Account recovery key generated');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        iosLink: links.iosLink,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        revokeAccountRecoveryLink: links.revokeAccountRecoveryLink,
        revokeAccountRecoveryLinkAttributes:
          links.revokeAccountRecoveryLinkAttributes,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.postRemoveAccountRecoveryEmail = function(message) {
    log.trace('mailer.postRemoveAccountRecoveryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postRemoveAccountRecovery';
    const links = this._generateSettingLinks(message, templateName);
    const subject = gettext('Account recovery key removed');
    const action = gettext('Manage account');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        iosLink: links.iosLink,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        privacyUrl: links.privacyUrl,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.passwordResetAccountRecoveryEmail = function(message) {
    log.trace('mailer.passwordResetAccountRecoveryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'passwordResetAccountRecovery';
    const links = this._generateCreateAccountRecoveryLinks(
      message,
      templateName
    );
    const subject = gettext('Password updated using recovery key');
    const action = gettext('Create new recovery key');

    const headers = {
      'X-Link': links.link,
    };

    return this.send({
      ...message,
      headers,
      subject,
      template: templateName,
      templateValues: {
        action,
        androidLink: links.androidLink,
        device: this._formatUserAgentInfo(message),
        email: message.email,
        iosLink: links.iosLink,
        ip: message.ip,
        link: links.link,
        location: this._constructLocationString(message),
        privacyUrl: links.privacyUrl,
        passwordChangeLink: links.passwordChangeLink,
        passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
        subject,
        supportLinkAttributes: links.supportLinkAttributes,
        supportUrl: links.supportUrl,
        timestamp: this._constructLocalTimeString(
          message.timeZone,
          message.acceptLanguage
        ),
      },
    });
  };

  Mailer.prototype.subscriptionUpgradeEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      productIconNew,
      productIconOld,
      productNameOld,
      productNameNew,
      paymentAmountOld,
      paymentAmountNew,
      paymentProrated,
      productPaymentCycle,
    } = message;

    const enabled = config.subscriptions.transactionalEmails.enabled;
    log.trace('mailer.subscriptionUpgrade', {
      enabled,
      email,
      productId,
      uid,
    });
    if (!enabled) {
      return;
    }

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionUpgrade';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      uid,
      email,
      productIconNew,
      productIconOld,
      productNameOld,
      productNameNew,
      paymentAmountOld,
      paymentAmountNew,
      paymentProrated,
      productPaymentCycle,
    };
    const subject = translator.gettext(
      'You have upgraded to %(productNameNew)s'
    );

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: productIconNew,
        product: productNameNew,
        subject: translator.format(subject, translatorParams),
      },
    });
  };

  Mailer.prototype.subscriptionDowngradeEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      productIconNew,
      productIconOld,
      productNameOld,
      productNameNew,
      paymentAmountOld,
      paymentAmountNew,
      paymentProrated,
      productPaymentCycle,
    } = message;

    const enabled = config.subscriptions.transactionalEmails.enabled;
    log.trace('mailer.subscriptionDowngrade', {
      enabled,
      email,
      productId,
      uid,
    });
    if (!enabled) {
      return;
    }

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionDowngrade';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      uid,
      email,
      productIconNew,
      productIconOld,
      productNameOld,
      productNameNew,
      paymentAmountOld,
      paymentAmountNew,
      paymentProrated,
      productPaymentCycle,
    };
    const subject = translator.gettext(
      'You have switched to %(productNameNew)s'
    );

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: productIconNew,
        product: productNameNew,
        subject: translator.format(subject, translatorParams),
      },
    });
  };

  Mailer.prototype.subscriptionPaymentExpiredEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
    } = message;

    const enabled = config.subscriptions.transactionalEmails.enabled;
    log.trace('mailer.subscriptionPaymentExpired', {
      enabled,
      email,
      productId,
      uid,
    });
    if (!enabled) {
      return;
    }

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionPaymentExpired';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
    };
    const subject = translator.gettext(
      'Credit card for %(productName)s expiring soon'
    );

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
      },
    });
  };

  Mailer.prototype.subscriptionPaymentFailedEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
    } = message;

    const enabled = config.subscriptions.transactionalEmails.enabled;
    log.trace('mailer.subscriptionPaymentFailed', {
      enabled,
      email,
      productId,
      uid,
    });
    if (!enabled) {
      return;
    }

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionPaymentFailed';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
    };
    const subject = translator.gettext('%(productName)s payment failed');

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
      },
    });
  };

  Mailer.prototype.subscriptionAccountDeletionEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceDate,
      invoiceTotal,
    } = message;

    if (!config.subscriptions.transactionalEmails.enabled) {
      log.trace('mailer.subscriptionAccountDeletion', {
        enabled: false,
        email,
        productId,
        uid,
      });
      return;
    }

    log.trace('mailer.subscriptionAccountDeletion', {
      enabled: true,
      email,
      productId,
      uid,
    });

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionAccountDeletion';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
      invoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        invoiceDate
      ),
    };
    const subject = translator.gettext(
      'Your %(productName)s subscription has been cancelled'
    );

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
        invoiceTotal,
      },
    });
  };

  Mailer.prototype.subscriptionCancellationEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceDate,
      invoiceTotal,
      serviceLastActiveDate,
    } = message;

    if (!config.subscriptions.transactionalEmails.enabled) {
      log.trace('mailer.subscriptionCancellation', {
        enabled: false,
        email,
        productId,
        uid,
      });
      return;
    }

    log.trace('mailer.subscriptionCancellation', {
      enabled: true,
      email,
      productId,
      uid,
    });

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionCancellation';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
      invoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        invoiceDate
      ),
      serviceLastActiveDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        serviceLastActiveDate
      ),
    };
    const subject = translator.gettext(
      'Your %(productName)s subscription has been cancelled'
    );

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
        invoiceTotal,
      },
    });
  };

  Mailer.prototype.subscriptionReactivationEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceTotal,
      cardType,
      lastFour,
      nextInvoiceDate,
    } = message;

    const enabled = config.subscriptions.transactionalEmails.enabled;
    log.trace('mailer.subscriptionReactivation', {
      enabled,
      email,
      productId,
      uid,
    });
    if (!enabled) {
      return;
    }

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionReactivation';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
      nextInvoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        nextInvoiceDate
      ),
    };
    const subject = translator.gettext(
      '%(productName)s subscription reactivated'
    );

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
        invoiceTotal,
        cardType: cardTypeToText(cardType),
        lastFour,
        nextInvoiceDate,
      },
    });
  };

  Mailer.prototype.subscriptionSubsequentInvoiceEmail = async function(
    message
  ) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceNumber,
      invoiceDate,
      invoiceTotal,
      cardType,
      lastFour,
      nextInvoiceDate,
      proratedAmount,
    } = message;

    if (!config.subscriptions.transactionalEmails.enabled) {
      log.trace('mailer.subscriptionSubsequentInvoice', {
        enabled: false,
        email,
        productId,
        uid,
      });
      return;
    }

    log.trace('mailer.subscriptionSubsequentInvoice', {
      enabled: true,
      email,
      productId,
      uid,
    });

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionSubsequentInvoice';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
      invoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        invoiceDate
      ),
      nextInvoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        nextInvoiceDate
      ),
    };
    const subject = translator.gettext('%(productName)s payment received');

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
        invoiceNumber,
        invoiceDate,
        invoiceTotal,
        cardType: cardTypeToText(cardType),
        lastFour,
        nextInvoiceDate,
        proratedAmount,
        showProratedAmount: !!proratedAmount,
      },
    });
  };

  Mailer.prototype.subscriptionFirstInvoiceEmail = async function(message) {
    const {
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceNumber,
      invoiceDate,
      invoiceTotal,
      cardType,
      lastFour,
      nextInvoiceDate,
    } = message;

    if (!config.subscriptions.transactionalEmails.enabled) {
      log.trace('mailer.subscriptionFirstInvoice', {
        enabled: false,
        email,
        productId,
        uid,
      });
      return;
    }

    log.trace('mailer.subscriptionFirstInvoice', {
      enabled: true,
      email,
      productId,
      uid,
    });

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'subscriptionFirstInvoice';
    const translator = this.translator(message.acceptLanguage);

    const links = this._generateLinks(null, message, query, template);
    const headers = {};
    const translatorParams = {
      productName,
      uid,
      email,
      invoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        invoiceDate
      ),
      nextInvoiceDateOnly: this._constructLocalDateString(
        message.timeZone,
        message.acceptLanguage,
        nextInvoiceDate
      ),
    };
    const subject = translator.gettext('%(productName)s payment confirmed');

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        uid,
        email,
        icon: planEmailIconURL,
        product: productName,
        subject: translator.format(subject, translatorParams),
        invoiceNumber,
        invoiceDate,
        invoiceTotal,
        cardType: cardTypeToText(cardType),
        lastFour,
        nextInvoiceDate,
      },
    });
  };

  Mailer.prototype.downloadSubscriptionEmail = async function(message) {
    const {
      email,
      productId,
      planId,
      productName,
      planEmailIconURL,
      planDownloadURL,
      uid,
      appStoreLink,
      playStoreLink,
    } = message;

    log.trace('mailer.downloadSubscription', { email, productId, uid });

    const query = { plan_id: planId, product_id: productId, uid };
    const template = 'downloadSubscription';
    const translator = this.translator(message.acceptLanguage);
    const links = this._generateLinks(
      planDownloadURL,
      message,
      query,
      template,
      appStoreLink,
      playStoreLink
    );

    const headers = {
      'X-Link': links.link,
    };

    const translatorParams = { productName, uid, email };
    const subject = translator.gettext('Welcome to %(productName)s');
    const action = translator.gettext('Download %(productName)s');

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        ...translatorParams,
        action: translator.format(action, translatorParams),
        subject: translator.format(subject, translatorParams),
        icon: planEmailIconURL,
      },
    });
  };

  Mailer.prototype._generateUTMLink = function(
    link,
    query,
    templateName,
    content
  ) {
    const parsedLink = new URL(link);

    Object.keys(query).forEach(key => {
      const value = typeof query[key] !== 'undefined' ? query[key] : '';
      parsedLink.searchParams.set(key, value);
    });

    parsedLink.searchParams.set('utm_medium', 'email');

    const campaign = templateNameToCampaignMap[templateName];
    if (campaign && !parsedLink.searchParams.has('utm_campaign')) {
      parsedLink.searchParams.set('utm_campaign', UTM_PREFIX + campaign);
    }

    if (content) {
      parsedLink.searchParams.set('utm_content', UTM_PREFIX + content);
    }

    const isAccountOrEmailVerification =
      link === this.verificationUrl || link === this.verifyLoginUrl;
    if (
      this.prependVerificationSubdomain.enabled &&
      isAccountOrEmailVerification
    ) {
      parsedLink.host = `${this.prependVerificationSubdomain.subdomain}.${parsedLink.host}`;
    }

    return parsedLink.toString();
  };

  Mailer.prototype._generateLinks = function(
    primaryLink,
    { email, uid },
    query,
    templateName,
    appStoreLink,
    playStoreLink
  ) {
    // Generate all possible links. The option to use a specific link
    // is left up to the template.
    const links = {};

    const utmContent = templateNameToContentMap[templateName];

    if (primaryLink && utmContent) {
      links['link'] = this._generateUTMLink(
        primaryLink,
        query,
        templateName,
        utmContent
      );
    }

    if (appStoreLink && utmContent) {
      links['appStoreLink'] = this._generateUTMLink(
        appStoreLink,
        query,
        templateName,
        utmContent
      );
    }

    if (playStoreLink && utmContent) {
      links['playStoreLink'] = this._generateUTMLink(
        playStoreLink,
        query,
        templateName,
        utmContent
      );
    }

    links['privacyUrl'] = this.createPrivacyLink(templateName);

    links['supportLinkAttributes'] = this._supportLinkAttributes(templateName);
    links['supportUrl'] = this.createSupportLink(templateName);
    links['subscriptionSupportUrl'] = this._generateUTMLink(
      this.subscriptionSupportUrl,
      {},
      templateName,
      'subscription-support'
    );

    links['passwordChangeLink'] = this.createPasswordChangeLink(
      email,
      templateName
    );
    links['passwordChangeLinkAttributes'] = this._passwordChangeLinkAttributes(
      email,
      templateName
    );

    links['resetLink'] = this.createPasswordResetLink(
      email,
      templateName,
      query.emailToHashWith
    );
    links['resetLinkAttributes'] = this._passwordResetLinkAttributes(
      email,
      templateName,
      query.emailToHashWith
    );

    links['androidLink'] = this._generateUTMLink(
      this.androidUrl,
      query,
      templateName,
      'connect-android'
    );
    links['iosLink'] = this._generateUTMLink(
      this.iosUrl,
      query,
      templateName,
      'connect-ios'
    );

    links['passwordManagerInfoUrl'] = this._generateUTMLink(
      this.passwordManagerInfoUrl,
      query,
      templateName,
      'password-info'
    );

    links['reportSignInLink'] = this.createReportSignInLink(
      templateName,
      query
    );
    links['reportSignInLinkAttributes'] = this._reportSignInLinkAttributes(
      email,
      templateName,
      query
    );

    links['revokeAccountRecoveryLink'] = this.createRevokeAccountRecoveryLink(
      templateName
    );
    links[
      'revokeAccountRecoveryLinkAttributes'
    ] = this._revokeAccountRecoveryLinkAttributes(templateName);

    links['createAccountRecoveryLink'] = this.createAccountRecoveryLink(
      templateName
    );

    links.accountSettingsUrl = this._generateUTMLink(
      this.accountSettingsUrl,
      { ...query, email, uid },
      templateName,
      'account-settings'
    );
    links.accountSettingsLinkAttributes = `href="${links.accountSettingsUrl}" target="_blank" rel="noopener noreferrer" style="color:#ffffff;font-weight:500;"`;

    links.cancellationSurveyUrl =
      'https://qsurvey.mozilla.com/s3/fpn-cancellation';

    links.cancellationSurveyLinkAttributes = `href="${links.cancellationSurveyUrl}" style="text-decoration: none; color: #0060DF;"`;

    links.subscriptionTermsUrl = this._generateUTMLink(
      this.subscriptionTermsUrl,
      {},
      templateName,
      'subscription-terms'
    );
    links.cancelSubscriptionUrl = this._generateUTMLink(
      this.subscriptionSettingsUrl,
      { ...query, email, uid },
      templateName,
      'cancel-subscription'
    );
    links.updateBillingUrl = this._generateUTMLink(
      this.subscriptionSettingsUrl,
      { ...query, email, uid },
      templateName,
      'update-billing'
    );

    const queryOneClick = extend(query, { one_click: true });
    if (primaryLink && utmContent) {
      links['oneClickLink'] = this._generateUTMLink(
        primaryLink,
        queryOneClick,
        templateName,
        `${utmContent}-oneclick`
      );
    }

    return links;
  };

  Mailer.prototype._generateSettingLinks = function(
    message,
    templateName,
    link = this.accountSettingsUrl
  ) {
    // Generate all possible links where the primary link is `accountSettingsUrl`.
    const query = {};
    if (message.email) {
      query.email = message.email;
    }
    if (message.uid) {
      query.uid = message.uid;
    }

    return this._generateLinks(link, message, query, templateName);
  };

  Mailer.prototype._generateLowRecoveryCodesLinks = function(
    message,
    templateName
  ) {
    // Generate all possible links where the primary link is `accountRecoveryCodesUrl`.
    const query = { low_recovery_codes: true };
    if (message.email) {
      query.email = message.email;
    }
    if (message.uid) {
      query.uid = message.uid;
    }

    return this._generateLinks(
      this.accountRecoveryCodesUrl,
      message,
      query,
      templateName
    );
  };

  Mailer.prototype._generateCreateAccountRecoveryLinks = function(
    message,
    templateName
  ) {
    // Generate all possible links where the primary link is `createAccountRecoveryUrl`.
    const query = {};
    if (message.email) {
      query.email = message.email;
    }
    if (message.uid) {
      query.uid = message.uid;
    }

    return this._generateLinks(
      this.createAccountRecoveryUrl,
      message,
      query,
      templateName
    );
  };

  Mailer.prototype.createPasswordResetLink = function(
    email,
    templateName,
    emailToHashWith
  ) {
    // Default `reset_password_confirm` to false, to show warnings about
    // resetting password and sync data
    const query = {
      email: email,
      reset_password_confirm: false,
      email_to_hash_with: emailToHashWith,
    };

    return this._generateUTMLink(
      this.initiatePasswordResetUrl,
      query,
      templateName,
      'reset-password'
    );
  };

  Mailer.prototype.createPasswordChangeLink = function(email, templateName) {
    const query = { email: email };

    return this._generateUTMLink(
      this.initiatePasswordChangeUrl,
      query,
      templateName,
      'change-password'
    );
  };

  Mailer.prototype.createReportSignInLink = function(templateName, data) {
    const query = {
      uid: data.uid,
      unblockCode: data.unblockCode,
    };
    return this._generateUTMLink(
      this.reportSignInUrl,
      query,
      templateName,
      'report'
    );
  };

  Mailer.prototype._reportSignInLinkAttributes = function(
    email,
    templateName,
    query
  ) {
    return linkAttributes(this.createReportSignInLink(templateName, query));
  };

  Mailer.prototype.createSupportLink = function(templateName) {
    return this._generateUTMLink(this.supportUrl, {}, templateName, 'support');
  };

  Mailer.prototype.createPrivacyLink = function(templateName) {
    return this._generateUTMLink(this.privacyUrl, {}, templateName, 'privacy');
  };

  Mailer.prototype.createRevokeAccountRecoveryLink = function(templateName) {
    return this._generateUTMLink(
      this.revokeAccountRecoveryUrl,
      {},
      templateName,
      'report'
    );
  };

  Mailer.prototype._revokeAccountRecoveryLinkAttributes = function(
    templateName
  ) {
    return linkAttributes(this.createRevokeAccountRecoveryLink(templateName));
  };

  Mailer.prototype.createAccountRecoveryLink = function(templateName) {
    return this._generateUTMLink(
      this.createAccountRecoveryUrl,
      {},
      templateName
    );
  };

  return Mailer;
};

function optionalHeader(key, value) {
  if (value) {
    return { [key]: value };
  }
}
