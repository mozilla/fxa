/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const emailUtils = require('../email/utils/helpers');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const P = require('bluebird');
const qs = require('querystring');
const safeUserAgent = require('../userAgent/safe');
const url = require('url');

const TEMPLATE_VERSIONS = {
  ...require('./templates/_versions.json'),
  ...require('./subscription-templates/_versions.json'),
};

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

  // Email template to UTM campaign map, each of these should be unique and
  // map to exactly one email template.
  const templateNameToCampaignMap = {
    downloadSubscription: 'new-subscription',
    lowRecoveryCodesEmail: 'low-recovery-codes',
    newDeviceLoginEmail: 'new-device-signin',
    passwordResetRequiredEmail: 'password-reset-required',
    passwordChangedEmail: 'password-changed-success',
    passwordResetEmail: 'password-reset-success',
    passwordResetAccountRecoveryEmail:
      'password-reset-account-recovery-success',
    postRemoveSecondaryEmail: 'account-email-removed',
    postVerifyEmail: 'account-verified',
    postChangePrimaryEmail: 'account-email-changed',
    postVerifySecondaryEmail: 'account-email-verified',
    postVerifyTrailheadEmail: 'account-verified',
    postAddTwoStepAuthenticationEmail: 'account-two-step-enabled',
    postRemoveTwoStepAuthenticationEmail: 'account-two-step-disabled',
    postConsumeRecoveryCodeEmail: 'account-consume-recovery-code',
    postNewRecoveryCodesEmail: 'account-replace-recovery-codes',
    postAddAccountRecoveryEmail: 'account-recovery-generated',
    postRemoveAccountRecoveryEmail: 'account-recovery-removed',
    recoveryEmail: 'forgot-password',
    unblockCodeEmail: 'new-unblock',
    verifyEmail: 'welcome',
    verifyShortCodeEmail: 'welcome',
    verifyLoginEmail: 'new-signin',
    verifyLoginCodeEmail: 'new-signin-verify-code',
    verifyPrimaryEmail: 'welcome-primary',
    verifySyncEmail: 'welcome-sync',
    verifySecondaryEmail: 'welcome-secondary',
    verifyTrailheadEmail: 'welcome-trailhead',
  };

  // Email template to UTM content, this is typically the main call out link/button
  // in template.
  const templateNameToContentMap = {
    downloadSubscription: 'download-subscription',
    lowRecoveryCodesEmail: 'recovery-codes',
    newDeviceLoginEmail: 'manage-account',
    passwordChangedEmail: 'password-change',
    passwordResetEmail: 'password-reset',
    passwordResetAccountRecoveryEmail: 'create-recovery-key',
    passwordResetRequiredEmail: 'password-reset',
    postRemoveSecondaryEmail: 'account-email-removed',
    postVerifyEmail: 'connect-device',
    postChangePrimaryEmail: 'account-email-changed',
    postVerifySecondaryEmail: 'manage-account',
    postVerifyTrailheadEmail: 'connect-device',
    postAddTwoStepAuthenticationEmail: 'manage-account',
    postRemoveTwoStepAuthenticationEmail: 'manage-account',
    postConsumeRecoveryCodeEmail: 'manage-account',
    postNewRecoveryCodesEmail: 'manage-account',
    postAddAccountRecoveryEmail: 'manage-account',
    postRemoveAccountRecoveryEmail: 'manage-account',
    recoveryEmail: 'reset-password',
    unblockCode: 'unblock-code',
    verifyEmail: 'activate',
    verifyShortCodeEmail: 'activate',
    verifyLoginEmail: 'confirm-signin',
    verifyLoginCodeEmail: 'new-signin-verify-code',
    verifyPrimaryEmail: 'activate',
    verifySyncEmail: 'activate-sync',
    verifySecondaryEmail: 'activate',
    verifyTrailheadEmail: 'confirm-trailhead',
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

  function sesMessageTagsHeaderValue(templateName, serviceName) {
    return `messageType=fxa-${templateName}, app=fxa, service=${serviceName}`;
  }

  function Mailer(
    translator,
    templates,
    subscriptionTemplates,
    mailerConfig,
    sender
  ) {
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
    this.subscriptionDownloadUrl = mailerConfig.subscriptionDownloadUrl;
    this.subscriptionSettingsUrl = mailerConfig.subscriptionSettingsUrl;
    this.subscriptionTermsUrl = mailerConfig.subscriptionTermsUrl;
    this.subscriptionTemplates = subscriptionTemplates;
    this.supportUrl = mailerConfig.supportUrl;
    this.syncUrl = mailerConfig.syncUrl;
    this.templates = templates;
    this.translator = translator.getTranslator;
    this.verificationUrl = mailerConfig.verificationUrl;
    this.verifyLoginUrl = mailerConfig.verifyLoginUrl;
    this.verifySecondaryEmailUrl = mailerConfig.verifySecondaryEmailUrl;
    this.verifyPrimaryEmailUrl = mailerConfig.verifyPrimaryEmailUrl;
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

  Mailer.prototype.localize = function(message) {
    const translator = this.translator(message.acceptLanguage);

    let localized;
    if (message.layout === 'subscription') {
      localized = this.subscriptionTemplates.render(
        message.template,
        message.layout,
        {
          ...message.templateValues,
          language: translator.language,
          translator,
        }
      );
    } else {
      localized = this.templates[message.template](
        extend(
          {
            translator: translator,
          },
          message.templateValues
        )
      );
    }

    return {
      html: localized.html,
      language: translator.language,
      subject: translator.format(
        translator.gettext(message.subject),
        message.templateValues,
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
          const headers = Object.assign(
            {
              'Content-Language': localized.language,
              'X-Template-Name': template,
              'X-Template-Version': templateVersion,
            },
            message.headers,
            optionalHeader('X-Device-Id', message.deviceId),
            optionalHeader('X-Flow-Id', message.flowId),
            optionalHeader('X-Flow-Begin-Time', message.flowBeginTime),
            optionalHeader('X-Service-Id', message.service),
            optionalHeader('X-Uid', message.uid)
          );

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

            emailUtils.logEmailEventSent(
              log,
              Object.assign({}, message, { headers })
            );

            return d.resolve(status);
          });

          return d.promise;
        })
      );
    });
  };

  Mailer.prototype.verifyEmail = async function(message) {
    log.trace('mailer.verifyEmail', { email: message.email, uid: message.uid });

    let templateName = 'verifyEmail';
    const metricsTemplateName = templateName;
    let subject = gettext('Verify Your Account');
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
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    let serviceName;

    if (message.service === 'sync') {
      subject = gettext('Confirm your email and start to sync!');
      templateName = 'verifySyncEmail';
    } else if (message.service) {
      const clientInfo = await oauthClientInfo.fetch(message.service);
      serviceName = clientInfo.name;
    }

    if (message.style === 'trailhead') {
      subject = gettext('Finish Creating Your Account');
      templateName = 'verifyTrailheadEmail';
    }

    return this.send(
      Object.assign({}, message, {
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
          serviceName: serviceName,
          style: message.style,
          sync: message.service === 'sync',
          supportUrl: links.supportUrl,
          supportLinkAttributes: links.supportLinkAttributes,
        },
        metricsTemplate: metricsTemplateName,
      })
    );
  };

  Mailer.prototype.verifyShortCodeEmail = async function(message) {
    log.trace('mailer.verifyShortCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyShortCodeEmail';
    const metricsTemplateName = 'verifyEmail';
    const code = message.code;
    const subject = gettext('Verification code: %(code)s');

    const links = this._generateLinks(
      this.verificationUrl,
      message.email,
      {},
      templateName
    );

    const headers = {
      'X-Verify-Short-Code': message.code,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject,
        template: templateName,
        templateValues: {
          code,
          device: this._formatUserAgentInfo(message),
          email: message.email,
          ip: message.ip,
          location: this._constructLocationString(message),
          privacyUrl: links.privacyUrl,
          supportUrl: links.supportUrl,
          supportLinkAttributes: links.supportLinkAttributes,
        },
        metricsTemplate: metricsTemplateName,
      })
    );
  };

  verificationReminders.keys.forEach((key, index) => {
    // Template names are generated in the form `verificationReminderFirstEmail`,
    // where `First` is the key derived from config, with an initial capital letter.
    const template = `verificationReminder${key[0].toUpperCase()}${key.substr(
      1
    )}Email`;
    let subject;
    if (index < verificationReminders.keys.length - 1) {
      subject = gettext('Reminder: Complete Registration');
    } else {
      subject = gettext('Final Reminder: Activate Your Account');
    }

    templateNameToCampaignMap[template] = `${key}-verification-reminder`;
    templateNameToContentMap[template] = 'confirm-email';

    Mailer.prototype[template] = async function(message) {
      const { code, email, uid } = message;

      log.trace(`mailer.${template}`, { code, email, uid });

      const query = { code, reminder: key, uid };
      const links = this._generateLinks(
        this.verificationUrl,
        email,
        query,
        template
      );
      const headers = {
        'X-Link': links.link,
        'X-Verify-Code': code,
      };

      return this.send(
        Object.assign({}, message, {
          headers,
          subject,
          template,
          templateValues: {
            email,
            link: links.link,
            oneClickLink: links.oneClickLink,
            privacyUrl: links.privacyUrl,
            supportUrl: links.supportUrl,
            supportLinkAttributes: links.supportLinkAttributes,
          },
        })
      );
    };
  });

  Mailer.prototype.unblockCodeEmail = function(message) {
    log.trace('mailer.unblockCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'unblockCodeEmail';
    const query = {
      unblockCode: message.unblockCode,
      email: message.email,
      uid: message.uid,
    };

    const links = this._generateLinks(null, message.email, query, templateName);

    const headers = {
      'X-Unblock-Code': message.unblockCode,
      'X-Report-SignIn-Link': links.reportSignInLink,
    };

    const clientName = safeUserAgent.name(message.uaBrowser);

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Authorization Code for %(clientName)s'),
        template: templateName,
        templateValues: {
          clientName,
          device: this._formatUserAgentInfo(message),
          email: message.email,
          ip: message.ip,
          location: this._constructLocationString(message),
          privacyUrl: links.privacyUrl,
          reportSignInLink: links.reportSignInLink,
          reportSignInLinkAttributes: links.reportSignInLinkAttributes,
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
          unblockCode: message.unblockCode,
        },
      })
    );
  };

  Mailer.prototype.verifyLoginEmail = function(message) {
    log.trace('mailer.verifyLoginEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyLoginEmail';
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
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    return oauthClientInfo.fetch(message.service).then(clientInfo => {
      const clientName = clientInfo.name;
      const subject = translator.gettext('Confirm New Sign-in');

      return this.send(
        Object.assign({}, message, {
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
            timestamp: this._constructLocalTimeString(
              message.timeZone,
              message.acceptLanguage
            ),
          },
        })
      );
    });
  };

  Mailer.prototype.verifyLoginCodeEmail = async function(message) {
    log.trace('mailer.verifyLoginCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyLoginCodeEmail';
    const query = {
      code: message.code,
      uid: message.uid,
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
      this.verifyLoginUrl,
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Signin-Verify-Code': message.code,
    };

    const { name: serviceName } = await oauthClientInfo.fetch(message.service);

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Sign-in Code for %(serviceName)s'),
        template: templateName,
        templateValues: {
          device: this._formatUserAgentInfo(message),
          email: message.email,
          ip: message.ip,
          location: this._constructLocationString(message),
          passwordChangeLink: links.passwordChangeLink,
          passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
          privacyUrl: links.privacyUrl,
          serviceName,
          supportLinkAttributes: links.supportLinkAttributes,
          supportUrl: links.supportUrl,
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
          tokenCode: message.code,
        },
      })
    );
  };

  Mailer.prototype.verifyPrimaryEmail = function(message) {
    log.trace('mailer.verifyPrimaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifyPrimaryEmail';
    const query = {
      code: message.code,
      uid: message.uid,
      type: 'primary',
      primary_email_verified: message.email,
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
      this.verifyPrimaryEmailUrl,
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Verify Primary Email'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.verifySecondaryEmail = function(message) {
    log.trace('mailer.verifySecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'verifySecondaryEmail';
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
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Verify-Code': message.code,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Verify Secondary Email'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
          primaryEmail: message.primaryEmail,
        },
      })
    );
  };

  Mailer.prototype.recoveryEmail = function(message) {
    const templateName = 'recoveryEmail';
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

    const links = this._generateLinks(
      this.passwordResetUrl,
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
      'X-Recovery-Code': message.code,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Reset Your Password'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.passwordChangedEmail = function(message) {
    const templateName = 'passwordChangedEmail';

    const links = this._generateLinks(
      this.initiatePasswordResetUrl,
      message.email,
      {},
      templateName
    );

    const headers = {
      'X-Link': links.resetLink,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Password Changed'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.passwordResetEmail = function(message) {
    const templateName = 'passwordResetEmail';
    const links = this._generateLinks(
      this.initiatePasswordResetUrl,
      message.email,
      {},
      templateName
    );

    const headers = {
      'X-Link': links.resetLink,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Password Updated'),
        template: templateName,
        templateValues: {
          privacyUrl: links.privacyUrl,
          resetLink: links.resetLink,
          resetLinkAttributes: links.resetLinkAttributes,
          supportLinkAttributes: links.supportLinkAttributes,
          supportUrl: links.supportUrl,
        },
      })
    );
  };

  Mailer.prototype.passwordResetRequiredEmail = function(message) {
    const templateName = 'passwordResetRequiredEmail';
    const links = this._generateLinks(
      this.initiatePasswordResetUrl,
      message.email,
      {},
      templateName
    );

    const headers = {
      'X-Link': links.resetLink,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Suspicious Activity: Password Reset Required'),
        template: templateName,
        templateValues: {
          passwordManagerInfoUrl: links.passwordManagerInfoUrl,
          privacyUrl: links.privacyUrl,
          resetLink: links.resetLink,
        },
      })
    );
  };

  Mailer.prototype.newDeviceLoginEmail = function(message) {
    log.trace('mailer.newDeviceLoginEmail', {
      email: message.email,
      uid: message.uid,
    });
    const templateName = 'newDeviceLoginEmail';
    const links = this._generateSettingLinks(message, templateName);
    const translator = this.translator(message.acceptLanguage);

    const headers = {
      'X-Link': links.passwordChangeLink,
    };

    return oauthClientInfo.fetch(message.service).then(clientInfo => {
      const clientName = clientInfo.name;
      const subject = translator.gettext('New Sign-in to %(clientName)s');

      return this.send(
        Object.assign({}, message, {
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
            link: links.link,
            privacyUrl: links.privacyUrl,
            supportLinkAttributes: links.supportLinkAttributes,
            supportUrl: links.supportUrl,
            timestamp: this._constructLocalTimeString(
              message.timeZone,
              message.acceptLanguage
            ),
          },
        })
      );
    });
  };

  Mailer.prototype.postVerifyEmail = function(message) {
    log.trace('mailer.postVerifyEmail', {
      email: message.email,
      uid: message.uid,
    });

    let templateName = 'postVerifyEmail';
    let subject = gettext('Account Verified');
    const query = {};

    if (message.style === 'trailhead') {
      templateName = 'postVerifyTrailheadEmail';
      subject = gettext('Account Confirmed');
      query.style = 'trailhead';
    }

    const links = this._generateLinks(
      this.syncUrl,
      message.email,
      query,
      templateName
    );

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject,
        template: templateName,
        templateValues: {
          androidUrl: links.androidLink,
          androidLinkAttributes: linkAttributes(links.androidLink),
          link: links.link,
          iosUrl: links.iosLink,
          iosLinkAttributes: linkAttributes(links.iosLink),
          privacyUrl: links.privacyUrl,
          supportUrl: links.supportUrl,
          supportLinkAttributes: links.supportLinkAttributes,
          style: message.style,
        },
      })
    );
  };

  Mailer.prototype.postVerifySecondaryEmail = function(message) {
    log.trace('mailer.postVerifySecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postVerifySecondaryEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Secondary Email Added'),
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
          supportLinkAttributes: links.supportLinkAttributes,
        },
      })
    );
  };

  Mailer.prototype.postChangePrimaryEmail = function(message) {
    log.trace('mailer.postChangePrimaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postChangePrimaryEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('New Primary Email'),
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
        },
      })
    );
  };

  Mailer.prototype.postRemoveSecondaryEmail = function(message) {
    log.trace('mailer.postRemoveSecondaryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postRemoveSecondaryEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Secondary Email Removed'),
        template: templateName,
        templateValues: {
          androidLink: links.androidLink,
          iosLink: links.iosLink,
          link: links.link,
          privacyUrl: links.privacyUrl,
          supportUrl: links.supportUrl,
          secondaryEmail: message.secondaryEmail,
          supportLinkAttributes: links.supportLinkAttributes,
        },
      })
    );
  };

  Mailer.prototype.postAddTwoStepAuthenticationEmail = function(message) {
    log.trace('mailer.postAddTwoStepAuthenticationEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postAddTwoStepAuthenticationEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Two-Step Authentication Enabled'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.postRemoveTwoStepAuthenticationEmail = function(message) {
    log.trace('mailer.postRemoveTwoStepAuthenticationEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postRemoveTwoStepAuthenticationEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Two-Step Authentication Disabled'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.postNewRecoveryCodesEmail = function(message) {
    log.trace('mailer.postNewRecoveryCodesEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postNewRecoveryCodesEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('New Recovery Codes Generated'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.postConsumeRecoveryCodeEmail = function(message) {
    log.trace('mailer.postConsumeRecoveryCodeEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postConsumeRecoveryCodeEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Recovery Code Used'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.lowRecoveryCodesEmail = function(message) {
    const { numberRemaining } = message;

    log.trace('mailer.lowRecoveryCodesEmail', {
      email: message.email,
      uid: message.uid,
      numberRemaining,
    });

    const templateName = 'lowRecoveryCodesEmail';
    const links = this._generateLowRecoveryCodesLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    let subject;
    if (numberRemaining === 1) {
      subject = gettext('1 Recovery Code Remaining');
    } else {
      subject = gettext('%(numberRemaining)s Recovery Codes Remaining');
    }

    return this.send(
      Object.assign({}, message, {
        headers,
        subject,
        template: templateName,
        templateValues: {
          androidLink: links.androidLink,
          iosLink: links.iosLink,
          link: links.link,
          numberRemaining,
          privacyUrl: links.privacyUrl,
          passwordChangeLinkAttributes: links.passwordChangeLinkAttributes,
          passwordChangeLink: links.passwordChangeLink,
          supportUrl: links.supportUrl,
          email: message.email,
          supportLinkAttributes: links.supportLinkAttributes,
        },
      })
    );
  };

  Mailer.prototype.postAddAccountRecoveryEmail = function(message) {
    log.trace('mailer.postAddAccountRecoveryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postAddAccountRecoveryEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Account Recovery Key Generated'),
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
          revokeAccountRecoveryLink: links.revokeAccountRecoveryLink,
          revokeAccountRecoveryLinkAttributes:
            links.revokeAccountRecoveryLinkAttributes,
          device: this._formatUserAgentInfo(message),
          ip: message.ip,
          location: this._constructLocationString(message),
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.postRemoveAccountRecoveryEmail = function(message) {
    log.trace('mailer.postRemoveAccountRecoveryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'postRemoveAccountRecoveryEmail';
    const links = this._generateSettingLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Account Recovery Key Removed'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.passwordResetAccountRecoveryEmail = function(message) {
    log.trace('mailer.passwordResetAccountRecoveryEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'passwordResetAccountRecoveryEmail';
    const links = this._generateCreateAccountRecoveryLinks(
      message,
      templateName
    );

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Password Updated Using Recovery Key'),
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
        },
      })
    );
  };

  Mailer.prototype.downloadSubscriptionEmail = async function(message) {
    const { email, productId, uid } = message;

    log.trace('mailer.downloadSubscription', { email, productId, uid });

    const query = { product_id: productId, uid };
    const template = 'downloadSubscription';
    const links = this._generateLinks(
      this.subscriptionDownloadUrl,
      email,
      query,
      template
    );
    const headers = {
      'X-Link': links.link,
    };
    // TODO: product, subject, action and icon must vary per subscription for phase 2
    // TODO: re-enable translations when subscriptions are more widely available
    const product = 'Secure Proxy';
    const subject = 'Welcome to Secure Proxy!';
    const action = 'Download Secure Proxy';
    // TODO: we're waiting on a production-ready icon for Secure Proxy
    //const icon = 'https://image.e.mozilla.org/lib/fe9915707361037e75/m/4/todo.png';

    return this.send({
      ...message,
      headers,
      layout: 'subscription',
      subject,
      template,
      templateValues: {
        ...links,
        action,
        email,
        //icon,
        product,
        subject,
      },
    });
  };

  Mailer.prototype._generateUTMLink = function(
    link,
    query,
    templateName,
    content
  ) {
    const parsedLink = url.parse(link);

    // Extract current params from link, passed in query params will override any param in a link
    const parsedQuery = qs.parse(parsedLink.query);
    Object.keys(query).forEach(key => {
      parsedQuery[key] = query[key];
    });

    parsedQuery['utm_medium'] = 'email';

    const campaign = templateNameToCampaignMap[templateName];
    if (campaign && !parsedQuery['utm_campaign']) {
      parsedQuery['utm_campaign'] = UTM_PREFIX + campaign;
    }

    if (content) {
      parsedQuery['utm_content'] = UTM_PREFIX + content;
    }

    parsedLink.query = parsedQuery;

    const isAccountOrEmailVerification =
      link === this.verificationUrl || link === this.verifyLoginUrl;
    if (
      this.prependVerificationSubdomain.enabled &&
      isAccountOrEmailVerification
    ) {
      parsedLink.host = `${this.prependVerificationSubdomain.subdomain}.${parsedLink.host}`;
    }

    return url.format(parsedLink);
  };

  Mailer.prototype._generateLinks = function(
    primaryLink,
    email,
    query,
    templateName
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
    links['privacyUrl'] = this.createPrivacyLink(templateName);

    links['supportLinkAttributes'] = this._supportLinkAttributes(templateName);
    links['supportUrl'] = this.createSupportLink(templateName);

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

    links.subscriptionTermsUrl = this._generateUTMLink(
      this.subscriptionTermsUrl,
      {},
      templateName,
      'subscription-terms'
    );
    links.cancelSubscriptionUrl = this._generateUTMLink(
      this.subscriptionSettingsUrl,
      query,
      templateName,
      'cancel-subscription'
    );
    links.updateBillingUrl = this._generateUTMLink(
      this.subscriptionSettingsUrl,
      query,
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

  Mailer.prototype._generateSettingLinks = function(message, templateName) {
    // Generate all possible links where the primary link is `accountSettingsUrl`.
    const query = {};
    if (message.email) {
      query.email = message.email;
    }
    if (message.uid) {
      query.uid = message.uid;
    }

    return this._generateLinks(
      this.accountSettingsUrl,
      message.email,
      query,
      templateName
    );
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
      message.email,
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
      message.email,
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
