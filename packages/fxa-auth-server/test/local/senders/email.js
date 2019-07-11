/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const { assert } = require('chai');
const cp = require('child_process');
const mocks = require('../../mocks');
const P = require('bluebird');
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

cp.execAsync = P.promisify(cp.exec);

const config = require(`${ROOT_DIR}/config`);

const TEMPLATE_VERSIONS = require(`${ROOT_DIR}/lib/senders/templates/_versions.json`);
const SUBSCRIPTION_TEMPLATE_VERSIONS = require(`${ROOT_DIR}/lib/senders/subscription-templates/_versions.json`);

const messageTypes = [
  'downloadSubscriptionEmail',
  'lowRecoveryCodesEmail',
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'passwordResetRequiredEmail',
  'postAddAccountRecoveryEmail',
  'postAddTwoStepAuthenticationEmail',
  'postChangePrimaryEmail',
  'postConsumeRecoveryCodeEmail',
  'postNewRecoveryCodesEmail',
  'postVerifyEmail',
  'postVerifySecondaryEmail',
  'recoveryEmail',
  'unblockCodeEmail',
  'verificationReminderFirstEmail',
  'verificationReminderSecondEmail',
  'verifyEmail',
  'verifyLoginEmail',
  'verifyLoginCodeEmail',
  'verifyPrimaryEmail',
  'verifySecondaryEmail',
  'passwordResetAccountRecoveryEmail',
  'postAddAccountRecoveryEmail',
  'postRemoveAccountRecoveryEmail',
];

const typesContainSupportLinks = new Set([
  'lowRecoveryCodesEmail',
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'passwordResetEmail',
  'postAddTwoStepAuthenticationEmail',
  'postChangePrimaryEmail',
  'postRemoveSecondaryEmail',
  'postRemoveTwoStepAuthenticationEmail',
  'postVerifyEmail',
  'recoveryEmail',
  'verificationReminderFirstEmail',
  'verificationReminderSecondEmail',
  'verifyEmail',
  'verifyLoginCodeEmail',
  'verifyPrimaryEmail',
  'verifySecondaryEmail',
  'passwordResetAccountRecoveryEmail',
  'postAddAccountRecoveryEmail',
  'postRemoveAccountRecoveryEmail',
]);

const typesContainPasswordResetLinks = new Set([
  'passwordChangedEmail',
  'passwordResetEmail',
  'passwordResetRequiredEmail',
]);

const typesContainPasswordChangeLinks = new Set([
  'newDeviceLoginEmail',
  'verifyLoginEmail',
  'verifyLoginCodeEmail',
  'verifyPrimaryEmail',
  'postAddTwoStepAuthenticationEmail',
  'postChangePrimaryEmail',
  'postRemoveTwoStepAuthenticationEmail',
  'postVerifySecondaryEmail',
  'postConsumeRecoveryCodeEmail',
  'postNewRecoveryCodesEmail',
  'passwordResetAccountRecoveryEmail',
  'postAddAccountRecoveryEmail',
  'postRemoveAccountRecoveryEmail',
]);

const typesContainUnblockCode = new Set(['unblockCodeEmail']);

const typesContainTokenCode = new Set(['verifyLoginCodeEmail']);

const typesContainRevokeAccountRecoveryLinks = new Set([
  'postAddAccountRecoveryEmail',
]);

const typesContainCreateAccountRecoveryLinks = new Set([
  'passwordResetAccountRecoveryEmail',
]);

const typesContainReportSignInLinks = new Set(['unblockCodeEmail']);

const typesContainAndroidStoreLinks = new Set(['postVerifyEmail']);

const typesContainIOSStoreLinks = new Set(['postVerifyEmail']);

const typesContainLocationData = new Set([
  'newDeviceLoginEmail',
  'passwordChangedEmail',
  'unblockCodeEmail',
  'postAddTwoStepAuthenticationEmail',
  'postRemoveTwoStepAuthenticationEmail',
  'recoveryEmail',
  'verifyEmail',
  'verifyLoginEmail',
  'verifyPrimaryEmail',
  'verifySecondaryEmail',
  'verifyTrailheadEmail',
  'postConsumeRecoveryCodeEmail',
  'postNewRecoveryCodesEmail',
  'passwordResetAccountRecoveryEmail',
  'postRemoveAccountRecoveryEmail',
]);

const typesContainPasswordManagerInfoLinks = new Set([
  'passwordResetRequiredEmail',
]);

const typesContainManageSettingsLinks = new Set([
  'newDeviceLoginEmail',
  'postVerifySecondaryEmail',
  'postChangePrimaryEmail',
  'postRemoveSecondaryEmail',
  'postAddTwoStepAuthenticationEmail',
  'postRemoveTwoStepAuthenticationEmail',
  'postNewRecoveryCodesEmail',
  'postConsumeRecoveryCodeEmail',
  'postRemoveAccountRecoveryEmail',
]);

const typesContainRecoveryCodeLinks = new Set(['lowRecoveryCodesEmail']);

const typesPrependVerificationSubdomain = new Set([
  'verifyEmail',
  'verifyLoginEmail',
]);

const subscriptionTypes = new Set(['downloadSubscriptionEmail']);

function getLocationMessage(location) {
  return {
    email: 'a@b.com',
    ip: '219.129.234.194',
    location: location,
    service: 'sync',
    timeZone: 'America/Los_Angeles',
  };
}

function sesMessageTagsHeaderValue(templateName, serviceName) {
  return `messageType=fxa-${templateName}, app=fxa, service=${serviceName}`;
}

function stubSendMail(stub, status) {
  return (emailConfig, callback) => {
    try {
      stub(emailConfig);
      return callback(null, status);
    } catch (err) {
      return callback(err, status);
    }
  };
}

describe('lib/senders/email:', () => {
  let mockLog, redis, mailer, oauthClientInfo;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`).init(),
      require(`${ROOT_DIR}/lib/senders/subscription-templates`)(mockLog),
    ]).spread((translator, templates, subscriptionTemplates) => {
      oauthClientInfo = {
        fetch: sinon.spy(async service => {
          if (service === 'sync') {
            return {
              name: 'Firefox',
            };
          } else if (service === 'foo') {
            return {
              name: 'biz baz relier name',
            };
          }
        }),
      };
      redis = {
        get: sinon.spy(() => P.resolve()),
      };
      const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, {
        './oauth_client_info': () => oauthClientInfo,
        '../redis': () => redis,
      })(mockLog, config.getProperties());
      mailer = new Mailer(
        translator,
        templates,
        subscriptionTemplates,
        config.get('smtp')
      );
    });
  });

  afterEach(() => mailer.stop());

  it('mailer and emailService are not mocked', () => {
    assert.isObject(mailer.mailer);
    assert.isFunction(mailer.mailer.sendMail);
    assert.isObject(mailer.emailService);
    assert.isFunction(mailer.emailService.sendMail);
    assert.notEqual(mailer.mailer, mailer.emailService);
  });

  messageTypes.forEach(type => {
    const message = {
      code: 'abc123',
      deviceId: 'foo',
      email: 'a@b.com',
      locations: [],
      productId: 'wibble',
      service: 'sync',
      tokenCode: 'abc123',
      uid: 'uid',
      unblockCode: 'AS6334PK',
      type: 'secondary',
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      flowBeginTime: Date.now(),
    };

    let expectedTemplateName;
    if (subscriptionTypes.has(type)) {
      expectedTemplateName = type.substr(0, type.lastIndexOf('Email'));
    } else {
      expectedTemplateName = type;
    }

    it(`Contains template header for ${type}`, () => {
      mailer.mailer.sendMail = stubSendMail(emailConfig => {
        assert.equal(
          emailConfig.from,
          config.get('smtp.sender'),
          'from header is correct'
        );
        assert.equal(
          emailConfig.sender,
          config.get('smtp.sender'),
          'sender header is correct'
        );
        const templateName = emailConfig.headers['X-Template-Name'];
        const templateVersion = emailConfig.headers['X-Template-Version'];

        if (type === 'verifyEmail') {
          // Handle special case for verify email
          assert.equal(templateName, 'verifySyncEmail');
        } else {
          assert.equal(templateName, expectedTemplateName);
        }

        if (subscriptionTypes.has(type)) {
          assert.equal(
            templateVersion,
            SUBSCRIPTION_TEMPLATE_VERSIONS[templateName]
          );
        } else {
          assert.equal(templateVersion, TEMPLATE_VERSIONS[templateName]);
        }
      });
      return mailer[type](message);
    });

    it(`Contains metrics headers for ${type}`, () => {
      mailer.mailer.sendMail = stubSendMail(emailConfig => {
        const headers = emailConfig.headers;
        assert.equal(
          headers['X-Device-Id'],
          message.deviceId,
          'device id header is correct'
        );
        assert.equal(
          headers['X-Flow-Id'],
          message.flowId,
          'flow id header is correct'
        );
        assert.equal(
          headers['X-Flow-Begin-Time'],
          message.flowBeginTime,
          'flow begin time header is correct'
        );
        assert.equal(
          headers['X-Service-Id'],
          message.service,
          'service id header is correct'
        );
        assert.equal(headers['X-Uid'], message.uid, 'uid header is correct');
        assert.equal(headers['X-Email-Service'], 'fxa-auth-server');
      });
      return mailer[type](message);
    });

    if (!subscriptionTypes.has(type)) {
      it(`test privacy link is in email template output for ${type}`, () => {
        const privacyLink = mailer.createPrivacyLink(type);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, privacyLink);
          assert.include(emailConfig.text, privacyLink);
        });
        return mailer[type](message);
      });
    }

    if (type === 'verifySecondaryEmail') {
      it(`contains correct type ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.headers['X-Link'], 'type=secondary');
          assert.include(emailConfig.html, 'type=secondary');
          assert.include(emailConfig.text, 'type=secondary');
          assert.notInclude(emailConfig.headers['X-Link'], 'utm_source=email');
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    it(`If sesConfigurationSet is not defined, then outgoing email does not contain X-SES* headers, for type ${type}`, () => {
      assert.ok('sesConfigurationSet' in mailer, 'configuration key exists');
      mailer.mailer.sendMail = stubSendMail(emailConfig => {
        const sesConfigurationSetHeader =
          emailConfig.headers['X-SES-CONFIGURATION-SET'];
        assert.ok(!sesConfigurationSetHeader);
        const sesMessageTags = emailConfig.headers['X-SES-MESSAGE-TAGS'];
        assert.ok(!sesMessageTags);
      });

      return mailer[type](message);
    });

    it(`If sesConfigurationSet is defined, then outgoing email will contain X-SES* headers, for type ${type}`, () => {
      assert.ok('sesConfigurationSet' in mailer, 'configuration key exists');
      const savedSesConfigurationSet = mailer.sesConfigurationSet;
      mailer.sesConfigurationSet = 'some-defined-value';

      mailer.mailer.sendMail = stubSendMail(emailConfig => {
        const sesConfigurationSetHeader =
          emailConfig.headers['X-SES-CONFIGURATION-SET'];
        assert.equal(sesConfigurationSetHeader, 'some-defined-value');

        const sesMessageTags = emailConfig.headers['X-SES-MESSAGE-TAGS'];
        const expectedSesMessageTags = sesMessageTagsHeaderValue(
          expectedTemplateName,
          'fxa-auth-server'
        );
        assert.equal(sesMessageTags, expectedSesMessageTags);

        mailer.sesConfigurationSet = savedSesConfigurationSet;
      });

      return mailer[type](message);
    });

    if (typesContainSupportLinks.has(type)) {
      it(`test support link is in email template output for ${type}`, () => {
        const supportTextLink = mailer.createSupportLink(type);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, supportTextLink);
          assert.include(emailConfig.text, supportTextLink);
        });
        return mailer[type](message);
      });
    }

    if (typesContainPasswordResetLinks.has(type)) {
      it(`reset password link is in email template output for ${type}`, () => {
        const resetPasswordLink = mailer.createPasswordResetLink(
          message.email,
          type
        );

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, resetPasswordLink);
          assert.include(emailConfig.text, resetPasswordLink);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainPasswordChangeLinks.has(type)) {
      it(`password change link is in email template output for ${type}`, () => {
        const passwordChangeLink = mailer.createPasswordChangeLink(
          message.email,
          type
        );

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, passwordChangeLink);
          assert.include(emailConfig.text, passwordChangeLink);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainUnblockCode.has(type)) {
      it(`unblock code is in email template output for ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, message.unblockCode);
          assert.include(emailConfig.text, message.unblockCode);
        });
        return mailer[type](message);
      });
    }

    if (typesPrependVerificationSubdomain.has(type)) {
      it(`can prepend verification subdomain for ${type}`, () => {
        mailer.prependVerificationSubdomain.enabled = true;
        const subdomain = mailer.prependVerificationSubdomain.subdomain;
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          const link = emailConfig.headers['X-Link'];
          assert.equal(
            link.indexOf(`http://${subdomain}.`),
            0,
            'link prepend with domain'
          );
        });
        return mailer[type](message);
      });
    }

    if (typesContainTokenCode.has(type)) {
      it(`login code is in email template output for ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, message.tokenCode);
          assert.include(emailConfig.text, message.tokenCode);
        });
        return mailer[type](message);
      });
    }

    if (typesContainReportSignInLinks.has(type)) {
      it(`report sign-in link is in email template output for ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          const reportSignInLink = mailer.createReportSignInLink(type, message);
          assert.include(emailConfig.html, reportSignInLink);
          assert.include(emailConfig.text, reportSignInLink);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainRevokeAccountRecoveryLinks.has(type)) {
      it(`revoke account recovery link is in email template output for ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          const link = mailer.createRevokeAccountRecoveryLink(type, message);
          assert.include(emailConfig.html, link);
          assert.include(emailConfig.text, link);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainCreateAccountRecoveryLinks.has(type)) {
      it(`create account recovery link is in email template output for ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          const link = mailer._generateCreateAccountRecoveryLinks(message, type)
            .link;
          assert.include(emailConfig.html, link);
          assert.include(emailConfig.text, link);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainAndroidStoreLinks.has(type)) {
      it(`Android store link is in email template output for ${type}`, () => {
        const androidStoreLink = mailer.androidUrl;

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, androidStoreLink);
          assert.include(emailConfig.html, 'utm_source=email');
          // only the html email contains links to the store
        });
        return mailer[type](message);
      });
    }

    if (typesContainIOSStoreLinks.has(type)) {
      it(`IOS store link is in email template output for ${type}`, () => {
        const iosStoreLink = mailer.iosUrl;

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, iosStoreLink);
          assert.include(emailConfig.html, 'utm_source=email');
          // only the html email contains links to the store
        });
        return mailer[type](message);
      });
    }

    if (typesContainPasswordManagerInfoLinks.has(type)) {
      it(`password manager info link is in email template output for ${type}`, () => {
        const passwordManagerInfoUrl = mailer._generateLinks(
          config.get('smtp').passwordManagerInfoUrl,
          message.email,
          {},
          type
        ).passwordManagerInfoUrl;

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, passwordManagerInfoUrl);
          assert.include(emailConfig.text, passwordManagerInfoUrl);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainManageSettingsLinks.has(type)) {
      it(`account settings info link is in email template output for ${type}`, () => {
        const accountSettingsUrl = mailer._generateSettingLinks(message, type)
          .link;

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, accountSettingsUrl);
          assert.include(emailConfig.text, accountSettingsUrl);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainRecoveryCodeLinks.has(type)) {
      it(`recovery code settings info link is in email template output for ${type}`, () => {
        const url = mailer._generateLowRecoveryCodesLinks(message, type).link;

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, url);
          assert.include(emailConfig.text, url);
          assert.notInclude(emailConfig.html, 'utm_source=email');
          assert.notInclude(emailConfig.text, 'utm_source=email');
        });
        return mailer[type](message);
      });
    }

    if (typesContainLocationData.has(type)) {
      const defaultLocation = {
        city: 'Mountain View',
        country: 'USA',
        stateCode: 'CA',
      };

      if (type === 'verifySecondaryEmail') {
        it(`original user email data is in template for ${type}`, () => {
          const message = getLocationMessage(defaultLocation);
          message.primaryEmail = 'user@email.com';
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.include(emailConfig.html, message.primaryEmail);
            assert.include(emailConfig.html, message.email);
            assert.include(emailConfig.text, message.primaryEmail);
            assert.include(emailConfig.text, message.email);
          });
          return mailer[type](message);
        });
      }

      it(`ip data is in template for ${type}`, () => {
        const message = getLocationMessage(defaultLocation);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, message.ip);

          assert.include(emailConfig.text, message.ip);
        });
        return mailer[type](message);
      });

      it(`location is correct with city, country, stateCode for ${type}`, () => {
        const location = defaultLocation;
        const message = getLocationMessage(defaultLocation);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(
            emailConfig.html,
            `${location.city}, ${location.stateCode}, ${location.country}`
          );
          assert.include(
            emailConfig.text,
            `${location.city}, ${location.stateCode}, ${location.country}`
          );
        });
        return mailer[type](message);
      });

      it(`location is correct with city, country for ${type}`, () => {
        const location = Object.assign({}, defaultLocation);
        delete location.stateCode;
        const message = getLocationMessage(location);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(
            emailConfig.html,
            `${location.city}, ${location.country}`
          );
          assert.include(
            emailConfig.text,
            `${location.city}, ${location.country}`
          );
        });
        return mailer[type](message);
      });

      it(`location is correct with stateCode, country for ${type}`, () => {
        const location = Object.assign({}, defaultLocation);
        delete location.city;
        const message = getLocationMessage(location);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(
            emailConfig.html,
            `${location.stateCode}, ${location.country}`
          );
          assert.include(
            emailConfig.text,
            `${location.stateCode}, ${location.country}`
          );
        });
        return mailer[type](message);
      });

      it(`location is correct with country for ${type}`, () => {
        const location = Object.assign({}, defaultLocation);
        delete location.city;
        delete location.stateCode;
        const message = getLocationMessage(location);

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, location.country);
          assert.include(emailConfig.text, location.country);
        });
        return mailer[type](message);
      });

      it(`device name is correct for ${type}`, () => {
        const message = getLocationMessage(defaultLocation);
        message.uaBrowser = 'Firefox';
        message.uaOS = 'BeOS';
        message.uaOSVersion = '1.0';

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.include(emailConfig.html, 'Firefox on BeOS 1.0');
          assert.include(emailConfig.text, 'Firefox on BeOS 1.0');
        });
        return mailer[type](message);
      });

      it(`drops dodgy-looking uaBrowser property for ${type}`, () => {
        const message = getLocationMessage(defaultLocation);
        message.uaBrowser = '<a>Firefox</a>';
        message.uaOS = 'Android';

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.notInclude(emailConfig.html, '<a>Firefox</a> on Android');
          assert.include(emailConfig.html, 'Android');
          assert.notInclude(emailConfig.text, '<a>Firefox</a> on Android');
          assert.include(emailConfig.text, 'Android');
        });
        return mailer[type](message);
      });

      it(`drops dodgy-looking uaOS property for ${type}`, () => {
        const message = getLocationMessage(defaultLocation);
        message.uaBrowser = 'Firefox';
        message.uaOS = 'http://example.com';

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.notInclude(emailConfig.html, 'http://example.com');
          assert.notInclude(emailConfig.text, 'http://example.com');
        });
        return mailer[type](message);
      });

      it(`drops dodgy-looking uaOSVersion property for ${type}`, () => {
        const message = getLocationMessage(defaultLocation);
        message.uaBrowser = 'Firefox';
        message.uaOS = 'Android';
        message.uaOSVersion = 'dodgy-looking';

        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.notInclude(emailConfig.html, 'dodgy-looking');
          assert.notInclude(emailConfig.text, 'dodgy-looking');
        });
        return mailer[type](message);
      });
    }

    switch (type) {
      case 'verifyEmail':
        it('passes the OAuth relier name to the template', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.equal(oauthClientInfo.fetch.callCount, 1);
            assert.equal(oauthClientInfo.fetch.args[0][0], 'foo');
            assert.include(emailConfig.html, 'biz baz relier name');
            assert.include(emailConfig.text, 'biz baz relier name');
          });
          message.service = 'foo';
          return mailer[type](message);
        });
        it('works without a service', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.isFalse(oauthClientInfo.fetch.called);
            assert.notInclude(emailConfig.html, 'and continue to');
            assert.notInclude(emailConfig.text, 'and continue to');
          });
          delete message.service;
          return mailer[type](message);
        });
        break;

      case 'verifyLoginEmail':
        it('test verify token email', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            const verifyLoginUrl = config.get('smtp').verifyLoginUrl;
            assert.equal(emailConfig.subject, 'Confirm new sign-in to Firefox');
            assert.ok(emailConfig.html.indexOf(verifyLoginUrl) > 0);
            assert.ok(emailConfig.text.indexOf(verifyLoginUrl) > 0);
          });
          return mailer[type](message);
        });
        break;

      case 'newDeviceLoginEmail':
        it('test new device login email', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.equal(emailConfig.subject, 'New sign-in to Firefox');
          });
          return mailer[type](message);
        });
        break;

      case 'postVerifyEmail':
        it(`test utm params for ${type}`, () => {
          const syncLink = mailer._generateUTMLink(
            config.get('smtp').syncUrl,
            {},
            type,
            'connect-device'
          );
          const androidLink = mailer._generateUTMLink(
            config.get('smtp').androidUrl,
            {},
            type,
            'connect-android'
          );
          const iosLink = mailer._generateUTMLink(
            config.get('smtp').iosUrl,
            {},
            type,
            'connect-ios'
          );

          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.include(emailConfig.html, syncLink);
            assert.include(emailConfig.html, androidLink);
            assert.include(emailConfig.html, iosLink);
            assert.include(emailConfig.html, 'utm_source=email');
          });
          return mailer[type](message);
        });
        break;

      case 'verifyPrimaryEmail':
        it('test verify token email', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            const verifyPrimaryEmailUrl = config.get('smtp')
              .verifyPrimaryEmailUrl;
            assert.include(emailConfig.html, verifyPrimaryEmailUrl);
            assert.include(emailConfig.text, verifyPrimaryEmailUrl);
            assert.notInclude(emailConfig.html, 'utm_source=email');
            assert.notInclude(emailConfig.text, 'utm_source=email');
          });
          return mailer[type](message);
        });
        break;

      case 'verificationReminderFirstEmail':
        it('emailConfig includes data specific to verificationReminderFirstEmail', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.include(emailConfig.html, 'reminder=first');
            assert.include(emailConfig.text, 'reminder=first');
            assert.include(
              emailConfig.html,
              'utm_campaign=fx-first-verification-reminder'
            );
            assert.include(
              emailConfig.text,
              'utm_campaign=fx-first-verification-reminder'
            );
            assert.include(
              emailConfig.html,
              'utm_content=fx-confirm-email-oneclick'
            );
            assert.include(emailConfig.text, 'utm_content=fx-confirm-email');
            assert.equal(
              emailConfig.subject,
              'Reminder: Finish Creating Your Account'
            );
          });
          return mailer[type](message);
        });
        break;

      case 'verificationReminderSecondEmail':
        it('emailConfig includes data specific to verificationReminderSecondEmail', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.include(emailConfig.html, 'reminder=second');
            assert.include(emailConfig.text, 'reminder=second');
            assert.include(
              emailConfig.html,
              'utm_campaign=fx-second-verification-reminder'
            );
            assert.include(
              emailConfig.text,
              'utm_campaign=fx-second-verification-reminder'
            );
            assert.include(
              emailConfig.html,
              'utm_content=fx-confirm-email-oneclick'
            );
            assert.include(emailConfig.text, 'utm_content=fx-confirm-email');
            assert.equal(
              emailConfig.subject,
              'Final reminder: Confirm your email to activate your Firefox Account'
            );
          });
          return mailer[type](message);
        });
        break;

      case 'downloadSubscriptionEmail':
        it('rendered the correct data', () => {
          mailer.mailer.sendMail = stubSendMail(emailConfig => {
            assert.equal(emailConfig.subject, 'Welcome to Secure Proxy!');
            assert.include(emailConfig.html, 'Welcome to Secure Proxy!');
            assert.include(emailConfig.text, 'Welcome to Secure Proxy!');
            assert.include(emailConfig.html, '>Download Secure Proxy</a>');
            assert.include(
              emailConfig.html,
              `href="${config.get(
                'smtp.privacyUrl'
              )}?utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-privacy"`
            );
            assert.include(
              emailConfig.text,
              `${config.get(
                'smtp.privacyUrl'
              )}?utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-privacy`
            );
            assert.include(
              emailConfig.html,
              `href="${config.get(
                'smtp.subscriptionDownloadUrl'
              )}?product_id=wibble&uid=uid&utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-download-subscription"`
            );
            assert.include(
              emailConfig.text,
              `${config.get(
                'smtp.subscriptionDownloadUrl'
              )}?product_id=wibble&uid=uid&utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-download-subscription`
            );
            assert.include(
              emailConfig.html,
              `href="${config.get(
                'smtp.subscriptionSettingsUrl'
              )}?product_id=wibble&uid=uid&utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-cancel-subscription"`
            );
            assert.include(
              emailConfig.text,
              `${config.get(
                'smtp.subscriptionSettingsUrl'
              )}?product_id=wibble&uid=uid&utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-cancel-subscription`
            );
            assert.include(
              emailConfig.html,
              `href="${config.get(
                'smtp.subscriptionSettingsUrl'
              )}?product_id=wibble&uid=uid&utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-update-billing"`
            );
            assert.include(
              emailConfig.text,
              `${config.get(
                'smtp.subscriptionSettingsUrl'
              )}?product_id=wibble&uid=uid&utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-update-billing`
            );
            assert.include(
              emailConfig.html,
              `href="${config.get(
                'smtp.subscriptionTermsUrl'
              )}?utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-subscription-terms"`
            );
            assert.include(
              emailConfig.text,
              `${config.get(
                'smtp.subscriptionTermsUrl'
              )}?utm_medium=email&utm_campaign=fx-new-subscription&utm_content=fx-subscription-terms`
            );
          });
          return mailer[type](message);
        });
        break;
    }
  });

  it('test user-agent info rendering', () => {
    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: 'Firefox',
        uaBrowserVersion: '32',
        uaOS: 'Windows',
        uaOSVersion: '8.1',
      }),
      'Firefox on Windows 8.1'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: 'Chrome',
        uaBrowserVersion: undefined,
        uaOS: 'Windows',
        uaOSVersion: '10',
      }),
      'Chrome on Windows 10'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: undefined,
        uaBrowserVersion: '12',
        uaOS: 'Windows',
        uaOSVersion: '10',
      }),
      'Windows 10'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: 'MSIE',
        uaBrowserVersion: '6',
        uaOS: 'Linux',
        uaOSVersion: '9',
      }),
      'MSIE on Linux 9'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: 'MSIE',
        uaBrowserVersion: undefined,
        uaOS: 'Linux',
        uaOSVersion: undefined,
      }),
      'MSIE on Linux'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: 'MSIE',
        uaBrowserVersion: '8',
        uaOS: undefined,
        uaOSVersion: '4',
      }),
      'MSIE'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: 'MSIE',
        uaBrowserVersion: undefined,
        uaOS: undefined,
        uaOSVersion: undefined,
      }),
      'MSIE'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: undefined,
        uaBrowserVersion: undefined,
        uaOS: 'Windows',
        uaOSVersion: undefined,
      }),
      'Windows'
    );

    assert.equal(
      mailer._formatUserAgentInfo({
        uaBrowser: undefined,
        uaBrowserVersion: undefined,
        uaOS: undefined,
        uaOSVersion: undefined,
      }),
      ''
    );
  });

  describe('mock sendMail method:', () => {
    beforeEach(() => {
      sinon.stub(mailer.mailer, 'sendMail').callsFake((config, cb) => {
        cb(null, { resp: 'ok' });
      });
    });

    it('resolves sendMail status', () => {
      const message = {
        email: 'test@restmail.net',
        subject: 'subject',
        template: 'verifyLoginEmail',
        uid: 'foo',
      };

      return mailer.send(message).then(status => {
        assert.deepEqual(status, [{ resp: 'ok' }]);
      });
    });

    it('logs emailEvent on send', () => {
      const message = {
        email: 'test@restmail.net',
        flowId: 'wibble',
        subject: 'subject',
        template: 'verifyLoginEmail',
        uid: 'foo',
      };

      return mailer.send(message).then(() => {
        assert.equal(mockLog.info.callCount, 4);
        const emailEventLog = mockLog.info.getCalls()[3];
        assert.equal(emailEventLog.args[0], 'emailEvent');
        assert.equal(emailEventLog.args[1].domain, 'other');
        assert.equal(emailEventLog.args[1].flow_id, 'wibble');
        assert.equal(emailEventLog.args[1].template, 'verifyLoginEmail');
        assert.equal(emailEventLog.args[1].type, 'sent');
        assert.equal(emailEventLog.args[1].locale, 'en');
        const mailerSend1 = mockLog.info.getCalls()[2];
        assert.equal(mailerSend1.args[0], 'mailer.send.1');
        assert.equal(mailerSend1.args[1].to, message.email);
      });
    });
  });

  describe('mock failing sendMail method:', () => {
    beforeEach(() => {
      sinon
        .stub(mailer.mailer, 'sendMail')
        .callsFake((config, cb) => cb(new Error('Fail')));
    });

    it('rejects sendMail status', () => {
      const message = {
        email: 'test@restmail.net',
        subject: 'subject',
        template: 'verifyLoginEmail',
        uid: 'foo',
      };

      return mailer.send(message).then(assert.notOk, err => {
        assert.equal(err.message, 'Fail');
      });
    });
  });

  describe('custom templates', () => {
    const templateVersions = require(`${ROOT_DIR}/lib/senders/templates/_versions.json`);

    function checkCustomEmailProperties(emailConfig, message, templateName) {
      assert.equal(
        emailConfig.from,
        config.get('smtp.sender'),
        'from header is correct'
      );
      assert.equal(
        emailConfig.sender,
        config.get('smtp.sender'),
        'sender header is correct'
      );
      assert.equal(
        emailConfig.headers['X-Template-Name'],
        templateName,
        'correct template name set'
      );

      const templateVersion = emailConfig.headers['X-Template-Version'];
      assert.equal(
        templateVersion,
        templateVersions[templateName],
        'template version is correct'
      );

      const headers = emailConfig.headers;
      assert.equal(
        headers['X-Flow-Id'],
        message.flowId,
        'flow id header is correct'
      );
      assert.equal(
        headers['X-Flow-Begin-Time'],
        message.flowBeginTime,
        'flow begin time header is correct'
      );
      assert.equal(
        headers['X-Service-Id'],
        message.service,
        'service id header is correct'
      );
      assert.equal(headers['X-Uid'], message.uid, 'uid header is correct');
      assert.equal(headers['X-Email-Service'], 'fxa-auth-server');
    }

    describe('trailhead templates', () => {
      const message = {
        email: 'a@b.com',
        service: 'sync',
        style: 'trailhead',
        uid: 'uid',
        flowId:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        flowBeginTime: Date.now(),
      };

      it('should send `verifyTrailheadEmail`', () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          checkCustomEmailProperties(
            emailConfig,
            message,
            'verifyTrailheadEmail'
          );

          const headers = emailConfig.headers;
          assert.include(
            headers['X-Link'],
            'style=trailhead',
            'contains trailhead style'
          );
        });
        return mailer.verifyEmail(message);
      });

      it('should send `postVerifyTrailheadEmail`', () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          checkCustomEmailProperties(
            emailConfig,
            message,
            'postVerifyTrailheadEmail'
          );
        });
        return mailer.postVerifyEmail(message);
      });
    });
  });

  describe('delete template versions', () => {
    beforeEach(() => {
      Object.keys(TEMPLATE_VERSIONS).forEach(
        key => (TEMPLATE_VERSIONS[key] = undefined)
      );
    });

    messageTypes.forEach(type => {
      const message = {
        code: 'code',
        deviceId: 'deviceId',
        email: 'foo@example.com',
        locations: [],
        service: 'sync',
        uid: 'uid',
        unblockCode: 'unblockCode',
        type: 'secondary',
        flowId: 'flowId',
        flowBeginTime: Date.now(),
      };

      it(`uses default template version for ${type}`, () => {
        mailer.mailer.sendMail = stubSendMail(emailConfig => {
          assert.equal(
            emailConfig.headers['X-Template-Version'],
            1,
            'template version defaults to 1'
          );
        });
        return mailer[type](message);
      });
    });
  });

  describe('sends request to the right mailer', () => {
    beforeEach(() => {
      sinon.stub(mailer.mailer, 'sendMail').callsFake((config, cb) => {
        cb(null, { resp: 'whatevs' });
      });
      sinon.stub(mailer.emailService, 'sendMail').callsFake((config, cb) => {
        cb(null, { resp: 'whatevs' });
      });
    });

    it('sends request to fxa-email-service when the email pattern is right', () => {
      const message = {
        email: 'emailservice.foo@restmail.net',
        subject: 'subject',
        template: 'verifyLoginEmail',
        uid: 'foo',
      };
      mailer.sesConfigurationSet = 'wibble';

      return mailer.send(message).then(response => {
        assert(mailer.emailService.sendMail.calledOnce);
        assert(!mailer.mailer.sendMail.called);

        const args = mailer.emailService.sendMail.args[0];

        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'emailservice.foo@restmail.net');
        assert.equal(args[0].subject, 'subject');
        assert.equal(args[0].provider, 'ses');

        const headers = args[0].headers;

        assert.equal(headers['X-Template-Name'], 'verifyLoginEmail');
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'ses');
        assert.equal(headers['X-Uid'], 'foo');

        const expectedSesMessageTags = sesMessageTagsHeaderValue(
          message.template,
          'fxa-email-service'
        );
        assert.equal(headers['X-SES-MESSAGE-TAGS'], expectedSesMessageTags);
        assert.equal(headers['X-SES-CONFIGURATION-SET'], 'wibble');

        assert.equal(typeof args[1], 'function');

        assert.equal(redis.get.callCount, 1);
      });
    });

    it("doesn't send request to fxa-email-service when the email pattern is not right", () => {
      const message = {
        email: 'foo@restmail.net',
        subject: 'subject',
        template: 'verifyLoginEmail',
        uid: 'foo',
      };

      return mailer.send(message).then(response => {
        assert(!mailer.emailService.sendMail.called);
        assert(mailer.mailer.sendMail.calledOnce);
        const args = mailer.mailer.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@restmail.net');
        assert.equal(args[0].subject, 'subject');
        assert.equal(args[0].headers['X-Template-Name'], 'verifyLoginEmail');
        assert.equal(args[0].headers['X-Uid'], 'foo');
        assert.equal(args[0].provider, undefined);
        assert.equal(typeof mailer.mailer.sendMail.args[0][1], 'function');

        assert.equal(redis.get.callCount, 1);
      });
    });

    it('sends request to fxa-email-service when selectEmailServices tells it to', () => {
      const message = {
        email: 'foo@example.com',
        subject: 'subject',
        template: 'verifyLoginEmail',
      };
      mailer.selectEmailServices = sinon.spy(() =>
        P.resolve([
          {
            emailAddresses: [message.email],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
            mailer: mailer.emailService,
          },
        ])
      );

      return mailer.send(message).then(() => {
        assert.equal(mailer.selectEmailServices.callCount, 1);

        let args = mailer.selectEmailServices.args[0];
        assert.equal(args.length, 1);
        assert.equal(args[0], message);

        assert.equal(mailer.emailService.sendMail.callCount, 1);
        assert.equal(mailer.mailer.sendMail.callCount, 0);

        args = mailer.emailService.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@example.com');
        assert.equal(args[0].provider, 'sendgrid');

        const headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'sendgrid');
      });
    });

    it('correctly handles multiple email addresses from selectEmailServices', () => {
      const message = {
        email: 'foo@example.com',
        ccEmails: ['bar@example.com', 'baz@example.com'],
        subject: 'subject',
        template: 'verifyLoginEmail',
      };
      mailer.selectEmailServices = sinon.spy(() =>
        P.resolve([
          {
            emailAddresses: [message.email, ...message.ccEmails],
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
            mailer: mailer.mailer,
          },
        ])
      );

      return mailer.send(message).then(() => {
        assert.equal(mailer.selectEmailServices.callCount, 1);
        assert.equal(mailer.mailer.sendMail.callCount, 1);
        assert.equal(mailer.emailService.sendMail.callCount, 0);

        const args = mailer.mailer.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@example.com');
        assert.deepEqual(args[0].cc, ['bar@example.com', 'baz@example.com']);

        const headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-auth-server');
        assert.equal(headers['X-Email-Sender'], 'ses');
      });
    });

    it('correctly handles multiple services from selectEmailServices', () => {
      const message = {
        email: 'foo@example.com',
        ccEmails: ['bar@example.com', 'baz@example.com'],
        subject: 'subject',
        template: 'verifyLoginEmail',
      };
      mailer.selectEmailServices = sinon.spy(() =>
        P.resolve([
          {
            emailAddresses: [message.email],
            emailService: 'fxa-email-service',
            emailSender: 'sendgrid',
            mailer: mailer.emailService,
          },
          {
            emailAddresses: message.ccEmails.slice(0, 1),
            emailService: 'fxa-email-service',
            emailSender: 'ses',
            mailer: mailer.emailService,
          },
          {
            emailAddresses: message.ccEmails.slice(1),
            emailService: 'fxa-auth-server',
            emailSender: 'ses',
            mailer: mailer.mailer,
          },
        ])
      );

      return mailer.send(message).then(() => {
        assert.equal(mailer.selectEmailServices.callCount, 1);
        assert.equal(mailer.emailService.sendMail.callCount, 2);
        assert.equal(mailer.mailer.sendMail.callCount, 1);

        let args = mailer.emailService.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'foo@example.com');
        assert.equal(args[0].cc, undefined);
        assert.equal(args[0].provider, 'sendgrid');

        let headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'sendgrid');

        args = mailer.emailService.sendMail.args[1];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'bar@example.com');
        assert.equal(args[0].cc, undefined);
        assert.equal(args[0].provider, 'ses');

        headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-email-service');
        assert.equal(headers['X-Email-Sender'], 'ses');

        args = mailer.mailer.sendMail.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0].to, 'baz@example.com');
        assert.equal(args[0].cc, undefined);
        assert.equal(args[0].provider, undefined);

        headers = args[0].headers;
        assert.equal(headers['X-Email-Service'], 'fxa-auth-server');
        assert.equal(headers['X-Email-Sender'], 'ses');
      });
    });
  });

  describe('single email address:', () => {
    const emailAddress = 'foo@example.com';

    describe('redis.get returns sendgrid percentage-only match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { percentage: 11 } }))
        );
        sinon.stub(Math, 'random').callsFake(() => 0.109);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid percentage-only mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { percentage: 11 } }))
        );
        sinon.stub(Math, 'random').callsFake(() => 0.11);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid regex-only match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({ sendgrid: { regex: '^foo@example.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid regex-only mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { regex: '^fo@example.com$' } }))
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid combined match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: {
                percentage: 1,
                regex: '^foo@example.com$',
              },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0.009);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid combined mismatch (percentage):', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: {
                percentage: 1,
                regex: '^foo@example.com$',
              },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0.01);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid combined mismatch (regex):', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: {
                percentage: 1,
                regex: '^ffoo@example.com$',
              },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns socketlabs percentage-only match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ socketlabs: { percentage: 42 } }))
        );
        sinon.stub(Math, 'random').callsFake(() => 0.419);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'socketlabs',
              },
            ])
          );
      });
    });

    describe('redis.get returns socketlabs percentage-only mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ socketlabs: { percentage: 42 } }))
        );
        sinon.stub(Math, 'random').callsFake(() => 0.42);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns socketlabs regex-only match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({ socketlabs: { regex: '^foo@example.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'socketlabs',
              },
            ])
          );
      });
    });

    describe('redis.get returns ses percentage-only match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ ses: { percentage: 100 } }))
        );
        sinon.stub(Math, 'random').callsFake(() => 0.999);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns ses percentage-only mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ ses: { percentage: 99 } }))
        );
        sinon.stub(Math, 'random').callsFake(() => 0.999);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns ses regex-only match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ ses: { regex: '^foo@example.com$' } }))
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid and ses matches:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^foo@example.com$' },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0.09);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid match and ses mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^ffoo@example.com$' },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0.09);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid mismatch and ses match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^foo@example.com$' },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0.1);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid and ses mismatches:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { percentage: 10 },
              ses: { regex: '^ffoo@example.com$' },
            })
          )
        );
        sinon.stub(Math, 'random').callsFake(() => 0.1);
      });

      afterEach(() => Math.random.restore());

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns undefined:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() => P.resolve());
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns unsafe regex:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({ sendgrid: { regex: '^(.+)+@example.com$' } })
          )
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns quote-terminating regex:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { regex: '"@example.com$' } }))
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('email address contains quote-terminator:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { regex: '@example.com$' } }))
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: '"@example.com' })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: ['"@example.com'],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get fails:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() => P.reject({ message: 'wibble' }));
      });

      it('selectEmailServices returns fallback data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result => {
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ]);
            assert.equal(mockLog.error.callCount, 1);
            const args = mockLog.error.args[0];
            assert.equal(args.length, 2);
            assert.equal(args[0], 'emailConfig.read.error');
            assert.deepEqual(args[1], {
              err: 'wibble',
            });
          });
      });
    });

    describe('redis.get returns invalid JSON:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() => P.resolve('wibble'));
      });

      it('selectEmailServices returns fallback data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result => {
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: [emailAddress],
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ]);
            assert.equal(mockLog.error.callCount, 1);
            assert.equal(mockLog.error.args[0][0], 'emailConfig.parse.error');
          });
      });
    });
  });

  describe('single email address matching local static email service config:', () => {
    const emailAddress = 'emailservice.1@restmail.net';

    describe('redis.get returns sendgrid match:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { regex: 'restmail' } }))
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
            ])
          );
      });
    });

    describe('redis.get returns sendgrid mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(JSON.stringify({ sendgrid: { regex: 'rustmail' } }))
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({ email: emailAddress })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: 'ses',
              },
            ])
          );
      });
    });
  });

  describe('multiple email addresses:', () => {
    const emailAddresses = ['a@example.com', 'b@example.com', 'c@example.com'];

    describe('redis.get returns sendgrid and ses matches and a mismatch:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { regex: '^a' },
              ses: { regex: '^b' },
            })
          )
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({
            email: emailAddresses[0],
            ccEmails: emailAddresses.slice(1),
          })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: emailAddresses.slice(0, 1),
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
              {
                mailer: mailer.emailService,
                emailAddresses: emailAddresses.slice(1, 2),
                emailService: 'fxa-email-service',
                emailSender: 'ses',
              },
              {
                mailer: mailer.mailer,
                emailAddresses: emailAddresses.slice(2),
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns a sendgrid match and two ses matches:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { regex: '^a' },
              ses: { regex: '^b|c' },
            })
          )
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({
            email: emailAddresses[0],
            ccEmails: emailAddresses.slice(1),
          })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.emailService,
                emailAddresses: emailAddresses.slice(0, 1),
                emailService: 'fxa-email-service',
                emailSender: 'sendgrid',
              },
              {
                mailer: mailer.emailService,
                emailAddresses: emailAddresses.slice(1),
                emailService: 'fxa-email-service',
                emailSender: 'ses',
              },
            ])
          );
      });
    });

    describe('redis.get returns three mismatches:', () => {
      beforeEach(() => {
        redis.get = sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { regex: 'wibble' },
              ses: { regex: 'blee' },
            })
          )
        );
      });

      it('selectEmailServices returns the correct data', () => {
        return mailer
          .selectEmailServices({
            email: emailAddresses[0],
            ccEmails: emailAddresses.slice(1),
          })
          .then(result =>
            assert.deepEqual(result, [
              {
                mailer: mailer.mailer,
                emailAddresses: emailAddresses,
                emailService: 'fxa-auth-server',
                emailSender: 'ses',
              },
            ])
          );
      });
    });
  });
});

describe('mailer constructor:', () => {
  let mailerConfig, mockLog, mailer;

  beforeEach(() => {
    mailerConfig = [
      'accountSettingsUrl',
      'accountRecoveryCodesUrl',
      'androidUrl',
      'initiatePasswordChangeUrl',
      'initiatePasswordResetUrl',
      'iosUrl',
      'iosAdjustUrl',
      'passwordManagerInfoUrl',
      'passwordResetUrl',
      'privacyUrl',
      'reportSignInUrl',
      'sender',
      'sesConfigurationSet',
      'supportUrl',
      'syncUrl',
      'verificationUrl',
      'verifyLoginUrl',
      'verifySecondaryEmailUrl',
      'verifyPrimaryEmailUrl',
    ].reduce((target, key) => {
      target[key] = `mock ${key}`;
      return target;
    }, {});
    mockLog = mocks.mockLog();

    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`).init(),
      require(`${ROOT_DIR}/lib/senders/subscription-templates`)(mockLog),
    ]).spread((translator, templates, subscriptionTemplates) => {
      const Mailer = require(`${ROOT_DIR}/lib/senders/email`)(
        mockLog,
        config.getProperties()
      );
      mailer = new Mailer(
        translator,
        templates,
        subscriptionTemplates,
        mailerConfig,
        'wibble'
      );
    });
  });

  it('mailer and emailService are both mocked', () => {
    assert.equal(mailer.mailer, 'wibble');
    assert.equal(mailer.emailService, 'wibble');
  });

  it('set properties on self from config correctly', () => {
    Object.entries(mailerConfig).forEach(([key, expected]) => {
      assert.equal(mailer[key], expected, `${key} was correct`);
    });
  });
});

describe('call selectEmailServices with mocked sandbox:', () => {
  const emailAddress = 'foo@example.com';
  let mockLog, redis, Sandbox, sandbox, mailer, promise, result, failed;

  beforeEach(done => {
    mockLog = mocks.mockLog();
    P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`).init(),
      require(`${ROOT_DIR}/lib/senders/subscription-templates`)(mockLog),
    ]).spread((translator, templates, subscriptionTemplates) => {
      redis = {
        get: sinon.spy(() =>
          P.resolve(
            JSON.stringify({ sendgrid: { regex: '^foo@example.com$' } })
          )
        ),
      };
      // eslint-disable-next-line prefer-arrow-callback
      Sandbox = sinon.spy(function() {
        return sandbox;
      });
      sandbox = {
        run: sinon.spy(),
      };
      const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, {
        '../redis': () => redis,
        sandbox: Sandbox,
      })(mockLog, config.getProperties());
      mailer = new Mailer(
        translator,
        templates,
        subscriptionTemplates,
        config.get('smtp')
      );
      promise = mailer
        .selectEmailServices({
          email: emailAddress,
        })
        .then(r => (result = r))
        .catch(() => (failed = true));
      setImmediate(done);
    });
  });

  afterEach(() => mailer.stop());

  it('called the sandbox correctly', () => {
    assert.equal(Sandbox.callCount, 1);

    let args = Sandbox.args[0];
    assert.equal(args.length, 1);
    assert.deepEqual(args[0], {
      timeout: 100,
    });

    assert.equal(sandbox.run.callCount, 1);

    args = sandbox.run.args[0];
    assert.equal(args.length, 2);
    assert.equal(
      args[0],
      'new RegExp("^foo@example.com$").test("foo@example.com")'
    );
    assert.equal(typeof args[1], 'function');
  });

  describe('call sandbox result handler with match:', () => {
    beforeEach(() => {
      sandbox.run.args[0][1]({ result: 'true' });
      return promise;
    });

    it('resolved', () => {
      assert.deepEqual(result, [
        {
          emailAddresses: ['foo@example.com'],
          mailer: mailer.emailService,
          emailService: 'fxa-email-service',
          emailSender: 'sendgrid',
        },
      ]);
    });

    it('did not fail', () => {
      assert.equal(failed, undefined);
    });
  });

  describe('call sandbox result handler with timeout:', () => {
    beforeEach(() => {
      sandbox.run.args[0][1]({ result: 'TimeoutError' });
      return promise;
    });

    it('resolved', () => {
      assert.deepEqual(result, [
        {
          emailAddresses: ['foo@example.com'],
          mailer: mailer.mailer,
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        },
      ]);
    });

    it('did not fail', () => {
      assert.equal(failed, undefined);
    });
  });
});

describe('call selectEmailServices with mocked safe-regex, regex-only match and redos regex:', () => {
  const emailAddress = 'foo@example.com';
  let mockLog, redis, safeRegex, mailer;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`).init(),
      require(`${ROOT_DIR}/lib/senders/subscription-templates`)(mockLog),
    ]).spread((translator, templates, subscriptionTemplates) => {
      redis = {
        get: sinon.spy(() =>
          P.resolve(
            JSON.stringify({
              sendgrid: { regex: '^((((.*)*)*)*)*@example.com$' },
            })
          )
        ),
      };
      // eslint-disable-next-line prefer-arrow-callback
      safeRegex = sinon.spy(function() {
        return true;
      });
      const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, {
        '../redis': () => redis,
        'safe-regex': safeRegex,
      })(mockLog, config.getProperties());
      mailer = new Mailer(
        translator,
        templates,
        subscriptionTemplates,
        config.get('smtp')
      );
    });
  });

  afterEach(() => mailer.stop());

  it('email address was treated as mismatch', () => {
    return mailer.selectEmailServices({ email: emailAddress }).then(result => {
      assert.deepEqual(result, [
        {
          mailer: mailer.mailer,
          emailAddresses: [emailAddress],
          emailService: 'fxa-auth-server',
          emailSender: 'ses',
        },
      ]);

      assert.equal(safeRegex.callCount, 1);
      const args = safeRegex.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], '^((((.*)*)*)*)*@example.com$');
    });
  });
});

describe('email translations', () => {
  let mockLog, redis, mailer;
  const message = {
    email: 'a@b.com',
  };

  function setupMailerWithTranslations(locale) {
    mockLog = mocks.mockLog();
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)([locale], locale),
      require(`${ROOT_DIR}/lib/senders/templates`).init(),
      require(`${ROOT_DIR}/lib/senders/subscription-templates`)(mockLog),
    ]).spread((translator, templates, subscriptionTemplates) => {
      redis = {
        get: sinon.spy(() => P.resolve()),
      };
      const Mailer = proxyquire(`${ROOT_DIR}/lib/senders/email`, {
        '../redis': () => redis,
      })(mockLog, config.getProperties());
      mailer = new Mailer(
        translator,
        templates,
        subscriptionTemplates,
        config.get('smtp')
      );
    });
  }

  afterEach(() => mailer.stop());

  it('arabic emails are translated', () => {
    return setupMailerWithTranslations('ar').then(() => {
      mailer.mailer.sendMail = stubSendMail(emailConfig => {
        assert.equal(
          emailConfig.headers['Content-Language'],
          'ar',
          'language header is correct'
        );
        // NOTE: translation might change, but we use the subject, we don't change that often.
        assert.equal(
          emailConfig.subject,
          'أكّد حساب فَيَرفُكس الخاص بك',
          'translation is correct'
        );
      });

      return mailer['verifyEmail'](message);
    });
  });

  it('russian emails are translated', () => {
    return setupMailerWithTranslations('ru').then(() => {
      mailer.mailer.sendMail = stubSendMail(emailConfig => {
        assert.equal(
          emailConfig.headers['Content-Language'],
          'ru',
          'language header is correct'
        );
        // NOTE: translation might change, but we use the subject, we don't change that often.
        assert.equal(
          emailConfig.subject,
          'Подтвердите ваш Аккаунт Firefox',
          'translation is correct'
        );
      });

      return mailer['verifyEmail'](message);
    });
  });
});

if (config.get('redis.email.enabled')) {
  const emailAddress = 'foo@example.com';

  ['sendgrid', 'ses', 'socketlabs'].reduce((promise, service) => {
    return promise.then(() => {
      return new P((resolve, reject) => {
        describe(`call selectEmailServices with real redis containing ${service} config:`, function() {
          this.timeout(10000);
          let mailer, result;

          before(() => {
            const mockLog = mocks.mockLog();
            return P.all([
              require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
              require(`${ROOT_DIR}/lib/senders/templates`).init(),
              require(`${ROOT_DIR}/lib/senders/subscription-templates`)(
                mockLog
              ),
            ])
              .spread((translator, templates, subscriptionTemplates) => {
                const Mailer = require(`${ROOT_DIR}/lib/senders/email`)(
                  mockLog,
                  config.getProperties()
                );
                mailer = new Mailer(
                  translator,
                  templates,
                  subscriptionTemplates,
                  config.get('smtp')
                );
                return redisWrite({
                  [service]: {
                    regex: '^foo@example.com$',
                    percentage: 100,
                  },
                });
              })
              .then(() => mailer.selectEmailServices({ email: emailAddress }))
              .then(r => (result = r));
          });

          after(() => {
            return redisRevert()
              .then(() => mailer.stop())
              .then(resolve)
              .catch(reject);
          });

          it('returned the correct result', () => {
            assert.deepEqual(result, [
              {
                emailAddresses: [emailAddress],
                emailService: 'fxa-email-service',
                emailSender: service,
                mailer: mailer.emailService,
              },
            ]);
          });
        });
      });
    });
  }, P.resolve());
}

function redisWrite(config) {
  return cp.execAsync(
    `echo '${JSON.stringify(config)}' | node scripts/email-config write`,
    {
      cwd: path.resolve(__dirname, '../../..'),
    }
  );
}

function redisRevert() {
  return cp.execAsync('node scripts/email-config revert', {
    cwd: path.resolve(__dirname, '../../..'),
  });
}
