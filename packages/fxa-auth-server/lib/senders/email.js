/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const emailUtils = require('../email/utils/helpers');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const P = require('bluebird');
const qs = require('querystring');
const safeRegex = require('safe-regex');
const safeUserAgent = require('../userAgent/safe');
const Sandbox = require('sandbox');
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

const SERVICES = {
  internal: Symbol(),
  external: {
    sendgrid: Symbol(),
    socketlabs: Symbol(),
    ses: Symbol(),
  },
};

module.exports = function(log, config, oauthdb) {
  const oauthClientInfo = require('./oauth_client_info')(log, config, oauthdb);
  const redis = require('../redis')(
    Object.assign({}, config.redis, config.redis.email),
    log
  ) || {
    // Fallback to a stub implementation if redis is disabled
    get: () => P.resolve(),
  };
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
    unblockCode: 'new-unblock',
    verifyEmail: 'welcome',
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
      subject: translator.gettext(message.subject),
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

  // Based on the to and cc email addresses of a message, return an array of
  // `Service` objects that control how email traffic will be routed.
  //
  // It will attempt to read live config data from Redis and live config takes
  // precedence over local static config. If no config is found at all, email
  // will be routed locally via the auth server.
  //
  // Live config looks like this (every property is optional):
  //
  // {
  //   sendgrid: {
  //     percentage: 100,
  //     regex: "^.+@example\.com$"
  //   },
  //   socketlabs: {
  //     percentage: 100,
  //     regex: "^.+@example\.org$"
  //   },
  //   ses: {
  //     percentage: 10,
  //     regex: ".*",
  //   }
  // }
  //
  // Where a percentage and a regex are both present, an email address must
  // satisfy both criteria to count as a match. Where an email address matches
  // sendgrid and ses, sendgrid wins. Where an email address matches socketlabs
  // and ses, socketlabs wins. Where an email address matches sendgrid and
  // socketlabs, sendgrid wins.
  //
  // If a regex has a star height greater than 1, the email address will be
  // treated as a non-match without executing the regex (to prevent us redosing
  // ourselves). If a regex takes longer than 100 milliseconds to execute,
  // it will be killed and the email address will be treated as a non-match.
  //
  // @param {Object} message
  //
  // @returns {Promise} Resolves to an array of `Service` objects.
  //
  // @typedef {Object} Service
  //
  // @property {Object} mailer           The object on which to invoke the `sendMail`
  //                                     method.
  //
  // @property {String[]} emailAddresses The array of email addresses to send to.
  //                                     The address at index 0 will be used as the
  //                                     `to` address and any remaining addresses
  //                                     will be included as `cc` addresses.
  //
  // @property {String} emailService     The name of the email service for metrics.
  //
  // @property {String} emailSender      The name of the underlying email sender,
  //                                     used for both metrics and sent as the
  //                                     `provider` param in external requests.
  Mailer.prototype.selectEmailServices = function(message) {
    const emailAddresses = [message.email];
    if (Array.isArray(message.ccEmails)) {
      emailAddresses.push(...message.ccEmails);
    }

    return redis
      .get('config')
      .catch(err => log.error('emailConfig.read.error', { err: err.message }))
      .then(liveConfig => {
        if (liveConfig) {
          try {
            liveConfig = JSON.parse(liveConfig);
          } catch (err) {
            log.error('emailConfig.parse.error', { err: err.message });
          }
        }

        return emailAddresses.reduce((promise, emailAddress) => {
          let services, isMatched;

          return promise
            .then(s => {
              services = s;

              if (liveConfig) {
                return ['sendgrid', 'socketlabs', 'ses'].reduce(
                  (promise, key) => {
                    const senderConfig = liveConfig[key];

                    return promise
                      .then(() => {
                        if (senderConfig) {
                          return isLiveConfigMatch(senderConfig, emailAddress);
                        }
                      })
                      .then(result => {
                        if (isMatched) {
                          return;
                        }

                        isMatched = result;

                        if (isMatched) {
                          upsertServicesMap(
                            services,
                            SERVICES.external[key],
                            emailAddress,
                            {
                              mailer: this.emailService,
                              emailService: 'fxa-email-service',
                              emailSender: key,
                            }
                          );
                        }
                      });
                  },
                  promise
                );
              }
            })
            .then(() => {
              if (isMatched) {
                return services;
              }

              if (config.emailService.forcedEmailAddresses.test(emailAddress)) {
                return upsertServicesMap(
                  services,
                  SERVICES.external.ses,
                  emailAddress,
                  {
                    mailer: this.emailService,
                    emailService: 'fxa-email-service',
                    emailSender: 'ses',
                  }
                );
              }

              return upsertServicesMap(
                services,
                SERVICES.internal,
                emailAddress,
                {
                  mailer: this.mailer,
                  emailService: 'fxa-auth-server',
                  emailSender: 'ses',
                }
              );
            });
        }, P.resolve(new Map()));
      })
      .then(services => Array.from(services.values()));

    function isLiveConfigMatch(liveConfig, emailAddress) {
      return new P(resolve => {
        const { percentage, regex } = liveConfig;

        if (
          percentage >= 0 &&
          percentage < 100 &&
          Math.floor(Math.random() * 100) >= percentage
        ) {
          resolve(false);
          return;
        }

        if (regex) {
          if (
            regex.indexOf('"') !== -1 ||
            emailAddress.indexOf('"') !== -1 ||
            !safeRegex(regex)
          ) {
            resolve(false);
            return;
          }

          // Execute the regex inside a sandbox and kill it if it takes > 100 ms
          const sandbox = new Sandbox({ timeout: 100 });
          sandbox.run(
            `new RegExp("${regex}").test("${emailAddress}")`,
            output => {
              resolve(output.result === 'true');
            }
          );
          return;
        }

        resolve(true);
      });
    }

    function upsertServicesMap(services, service, emailAddress, data) {
      if (services.has(service)) {
        services.get(service).emailAddresses.push(emailAddress);
      } else {
        services.set(
          service,
          Object.assign(
            {
              emailAddresses: [emailAddress],
            },
            data
          )
        );
      }

      return services;
    }
  };

  Mailer.prototype.verifyEmail = async function(message) {
    log.trace('mailer.verifyEmail', { email: message.email, uid: message.uid });

    let templateName = 'verifyEmail';
    const metricsTemplateName = templateName;
    let subject = gettext('Verify your Firefox Account');
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

  verificationReminders.keys.forEach((key, index) => {
    // Template names are generated in the form `verificationReminderFirstEmail`,
    // where `First` is the key derived from config, with an initial capital letter.
    const template = `verificationReminder${key[0].toUpperCase()}${key.substr(
      1
    )}Email`;
    let subject;
    if (index < verificationReminders.keys.length - 1) {
      subject = gettext('Reminder: Finish Creating Your Account');
    } else {
      subject = gettext(
        'Final reminder: Confirm your email to activate your Firefox Account'
      );
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

    return this.send(
      Object.assign({}, message, {
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
      const subject = translator.format(
        translator.gettext('Confirm new sign-in to %(clientName)s'),
        {
          clientName: clientName,
        }
      );

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

  Mailer.prototype.verifyLoginCodeEmail = function(message) {
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

    return this.send(
      Object.assign({}, message, {
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
          timestamp: this._constructLocalTimeString(
            message.timeZone,
            message.acceptLanguage
          ),
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
        subject: gettext('Firefox Account password changed'),
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
        subject: gettext('Firefox Account password reset required'),
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
      const subject = translator.format(
        translator.gettext('New sign-in to %(clientName)s'),
        {
          clientName: clientName,
        }
      );

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
    let subject = gettext('Firefox Account verified');
    const query = {};

    if (message.style === 'trailhead') {
      templateName = 'postVerifyTrailheadEmail';
      subject = gettext('Your Firefox Account is Confirmed');
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
        subject: gettext('Secondary Firefox Account email removed'),
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
        subject: gettext('Two-step authentication disabled'),
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
        subject: gettext('New recovery codes generated'),
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
        subject: gettext('Recovery code consumed'),
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
    log.trace('mailer.lowRecoveryCodesEmail', {
      email: message.email,
      uid: message.uid,
    });

    const templateName = 'lowRecoveryCodesEmail';
    const links = this._generateLowRecoveryCodesLinks(message, templateName);

    const headers = {
      'X-Link': links.link,
    };

    return this.send(
      Object.assign({}, message, {
        headers,
        subject: gettext('Low recovery codes remaining'),
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
        subject: gettext('Account recovery key generated'),
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
        subject: gettext('Account recovery key removed'),
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
        subject: gettext('Firefox Account password reset with recovery key'),
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
    // TODO: subject, action and icon must vary per subscription for phase 2
    const subject = gettext('Welcome to Secure Proxy!');
    const action = gettext('Download Secure Proxy');
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
