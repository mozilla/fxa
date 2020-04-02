/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Shared helpers for mocking things out in the tests.
 */

'use strict';

const assert = require('assert');
const config = require('../config').getProperties();
const crypto = require('crypto');
const error = require('../lib/error');
const knownIpLocation = require('./known-ip-location');
const P = require('../lib/promise');
const sinon = require('sinon');
const { normalizeEmail } = require('../../fxa-shared/email/helpers');

const CUSTOMS_METHOD_NAMES = [
  'check',
  'checkAuthenticated',
  'checkIpOnly',
  'flag',
  'reset',
];

const DB_METHOD_NAMES = [
  'account',
  'accountEmails',
  'accountRecord',
  'accountResetToken',
  'checkPassword',
  'consumeUnblockCode',
  'consumeSigninCode',
  'consumeRecoveryCode',
  'createAccount',
  'createDevice',
  'createEmailBounce',
  'createEmail',
  'createKeyFetchToken',
  'createPasswordForgotToken',
  'createRecoveryKey',
  'createSessionToken',
  'createSigninCode',
  'createTotpToken',
  'createUnblockCode',
  'deleteAccount',
  'deleteDevice',
  'deleteEmail',
  'deleteKeyFetchToken',
  'deletePasswordChangeToken',
  'deleteSecurityEvents',
  'deleteSessionToken',
  'deviceFromTokenVerificationId',
  'deleteRecoveryKey',
  'deleteTotpToken',
  'devices',
  'device',
  'emailBounces',
  'emailRecord',
  'forgotPasswordVerified',
  'getRecoveryKey',
  'getSecondaryEmail',
  'keyFetchToken',
  'keyFetchTokenWithVerificationStatus',
  'passwordChangeToken',
  'passwordForgotToken',
  'pruneSessionTokens',
  'recoveryKeyExists',
  'replaceRecoveryCodes',
  'resetAccount',
  'resetAccountTokens',
  'securityEvent',
  'securityEvents',
  'securityEventsByUid',
  'sessions',
  'sessionToken',
  'setPrimaryEmail',
  'touchSessionToken',
  'totpToken',
  'updateDevice',
  'updateLocale',
  'updateRecoveryKey',
  'updateSessionToken',
  'updateTotpToken',
  'verifyEmail',
  'verifyTokens',
  'verifyTokenCode',
  'verifyTokensWithMethod',
  'createAccountSubscription',
  'getAccountSubscription',
  'deleteAccountSubscription',
  'cancelAccountSubscription',
  'reactivateAccountSubscription',
  'fetchAccountSubscriptions',
];

const OAUTHDB_METHOD_NAMES = [
  'checkAccessToken',
  'checkRefreshToken',
  'revokeAccessToken',
  'revokeRefreshToken',
  'revokeRefreshTokenById',
  'getClientInfo',
  'getScopedKeyData',
  'createAuthorizationCode',
  'grantTokensFromAuthorizationCode',
  'grantTokensFromRefreshToken',
  'grantTokensFromSessionToken',
  'listAuthorizedClients',
  'revokeAuthorizedClient',
];

const LOG_METHOD_NAMES = [
  'activityEvent',
  'amplitudeEvent',
  'begin',
  'error',
  'flowEvent',
  'info',
  'notifyAttachedServices',
  'warn',
  'summary',
  'trace',
];

const MAILER_METHOD_NAMES = [
  'sendSubscriptionAccountDeletionEmail',
  'sendSubscriptionCancellationEmail',
  'sendSubscriptionSubsequentInvoiceEmail',
  'sendSubscriptionFirstInvoiceEmail',
  'sendDownloadSubscriptionEmail',
  'sendLowRecoveryCodesEmail',
  'sendNewDeviceLoginEmail',
  'sendPasswordChangedEmail',
  'sendPasswordResetAccountRecoveryEmail',
  'sendPasswordResetEmail',
  'sendPostAddAccountRecoveryEmail',
  'sendPostAddTwoStepAuthenticationEmail',
  'sendPostChangePrimaryEmail',
  'sendPostConsumeRecoveryCodeEmail',
  'sendPostNewRecoveryCodesEmail',
  'sendPostRemoveAccountRecoveryEmail',
  'sendPostRemoveSecondaryEmail',
  'sendPostVerifyEmail',
  'sendPostRemoveTwoStepAuthenticationEmail',
  'sendPostVerifySecondaryEmail',
  'sendRecoveryEmail',
  'sendUnblockCodeEmail',
  'sendVerifyEmail',
  'sendVerifyShortCodeEmail',
  'sendVerifyLoginEmail',
  'sendVerifyLoginCodeEmail',
  'sendVerifySecondaryEmail',
  'sendVerifySecondaryCodeEmail',
];

const METRICS_CONTEXT_METHOD_NAMES = [
  'clear',
  'gather',
  'propagate',
  'setFlowCompleteSignal',
  'stash',
  'validate',
];

const PUSH_METHOD_NAMES = [
  'notifyDeviceConnected',
  'notifyDeviceDisconnected',
  'notifyPasswordChanged',
  'notifyPasswordReset',
  'notifyAccountUpdated',
  'notifyAccountDestroyed',
  'notifyCommandReceived',
  'notifyProfileUpdated',
  'sendPush',
];

const PUSHBOX_METHOD_NAMES = ['retrieve', 'store'];

const SUBHUB_METHOD_NAMES = [
  'listPlans',
  'getCustomer',
  'updateCustomer',
  'deleteCustomer',
  'listSubscriptions',
  'createSubscription',
  'cancelSubscription',
  'reactivateSubscription',
];

const PROFILE_METHOD_NAMES = ['deleteCache'];

module.exports = {
  MOCK_PUSH_KEY:
    'BDLugiRzQCANNj5KI1fAqui8ELrE7qboxzfa5K_R0wnUoJ89xY1D_SOXI_QJKNmellykaW_7U2BZ7hnrPW3A3LM',
  generateMetricsContext: generateMetricsContext,
  mockBounces: mockObject(['check']),
  mockCustoms,
  mockDB,
  mockOAuthDB,
  mockDevices,
  mockLog: mockObject(LOG_METHOD_NAMES),
  mockMailer: mockObject(MAILER_METHOD_NAMES),
  mockMetricsContext,
  mockPush,
  mockPushbox,
  mockRequest,
  mockSubHub,
  mockProfile,
  mockVerificationReminders,
  mockStripeHelper,
};

function mockCustoms(errors) {
  errors = errors || {};

  return mockObject(CUSTOMS_METHOD_NAMES)({
    checkAuthenticated: optionallyThrow(errors, 'checkAuthenticated'),
    checkIpOnly: optionallyThrow(errors, 'checkIpOnly'),
  });
}

function optionallyThrow(errors, methodName) {
  return sinon.spy(() => {
    if (errors[methodName]) {
      return P.reject(errors[methodName]);
    }
    return P.resolve();
  });
}

function mockDB(data, errors) {
  data = data || {};
  errors = errors || {};

  return mockObject(DB_METHOD_NAMES)({
    account: sinon.spy(uid => {
      assert.ok(typeof uid === 'string');
      return P.resolve({
        email: data.email,
        emailCode: data.emailCode,
        emailVerified: data.emailVerified || false,
        locale: data.locale,
        primaryEmail: {
          normalizedEmail: normalizeEmail(data.email),
          email: data.email,
          isVerified: data.emailVerified || false,
          isPrimary: true,
          emailCode: data.emailCode,
        },
        emails: [
          {
            normalizedEmail: normalizeEmail(data.email),
            email: data.email,
            isVerified: data.emailVerified || false,
            isPrimary: true,
          },
        ],
        uid: data.uid,
        verifierSetAt: Date.now(),
        wrapWrapKb: data.wrapWrapKb,
      });
    }),
    accountEmails: sinon.spy(uid => {
      assert.ok(typeof uid === 'string');
      return P.resolve([
        {
          email: data.email || 'primary@email.com',
          normalizedEmail: normalizeEmail(data.email || 'primary@email.com'),
          emailCode: data.emailCode,
          isPrimary: true,
          isVerified: data.emailVerified,
        },
        {
          email: data.secondEmail || 'secondEmail@email.com',
          normalizedEmail: normalizeEmail(
            data.secondEmail || 'secondEmail@email.com'
          ),
          emailCode:
            data.secondEmailCode || crypto.randomBytes(16).toString('hex'),
          isVerified: data.secondEmailisVerified || false,
          isPrimary: false,
        },
      ]);
    }),
    accountRecord: sinon.spy(() => {
      if (errors.emailRecord) {
        return P.reject(errors.emailRecord);
      }
      return P.resolve({
        authSalt: crypto.randomBytes(32),
        createdAt: data.createdAt || Date.now(),
        data: crypto.randomBytes(32),
        email: data.email,
        emailVerified: data.emailVerified,
        primaryEmail: {
          normalizedEmail: normalizeEmail(data.email),
          email: data.email,
          isVerified: data.emailVerified,
          isPrimary: true,
        },
        emails: [
          {
            normalizedEmail: normalizeEmail(data.email),
            email: data.email,
            isVerified: data.emailVerified,
            isPrimary: true,
          },
        ],
        kA: crypto.randomBytes(32),
        lastAuthAt: () => {
          return Date.now();
        },
        uid: data.uid,
        wrapWrapKb: crypto.randomBytes(32),
      });
    }),
    consumeSigninCode: sinon.spy(() => {
      if (errors.consumeSigninCode) {
        return P.reject(errors.consumeSigninCode);
      }
      return P.resolve({
        email: data.email,
        flowId: data.flowId,
      });
    }),
    createAccount: sinon.spy(() => {
      return P.resolve({
        uid: data.uid,
        email: data.email,
        emailCode: data.emailCode,
        emailVerified: data.emailVerified,
        locale: data.locale,
        wrapWrapKb: data.wrapWrapKb,
      });
    }),
    createDevice: sinon.spy(uid => {
      assert.ok(typeof uid === 'string');
      return P.resolve(
        Object.keys(data.device).reduce(
          (result, key) => {
            result[key] = data.device[key];
            return result;
          },
          {
            id: data.deviceId,
            createdAt: data.deviceCreatedAt,
          }
        )
      );
    }),
    createKeyFetchToken: sinon.spy(() => {
      return P.resolve({
        data: crypto.randomBytes(32).toString('hex'),
        id: data.keyFetchTokenId,
        uid: data.uid,
      });
    }),
    createPasswordForgotToken: sinon.spy(() => {
      return P.resolve({
        data: crypto.randomBytes(32).toString('hex'),
        passCode: data.passCode,
        id: data.passwordForgotTokenId,
        uid: data.uid,
        ttl: function() {
          return data.passwordForgotTokenTTL || 100;
        },
      });
    }),
    createSessionToken: sinon.spy(opts => {
      return P.resolve({
        createdAt: opts.createdAt || Date.now(),
        data: crypto.randomBytes(32).toString('hex'),
        email: opts.email || data.email,
        emailVerified:
          typeof opts.emailVerified !== 'undefined'
            ? opts.emailVerified
            : data.emailVerified,
        lastAuthAt: () => {
          return opts.createdAt || Date.now();
        },
        id: data.sessionTokenId,
        tokenVerificationId:
          opts.tokenVerificationId || data.tokenVerificationId,
        tokenVerified: !(opts.tokenVerificationId || data.tokenVerificationId),
        mustVerify:
          typeof opts.mustVerify !== 'undefined'
            ? opts.mustVerify
            : data.mustVerify,
        uaBrowser: opts.uaBrowser || data.uaBrowser,
        uaBrowserVersion: opts.uaBrowserVersion || data.uaBrowserVersion,
        uaOS: opts.uaOS || data.uaOS,
        uaOSVersion: opts.uaOSVersion || data.uaOSVersion,
        uaDeviceType: opts.uaDeviceType || data.uaDeviceType,
        uaFormFactor: opts.uaFormFactor || data.uaFormFactor,
        uid: opts.uid || data.uid,
      });
    }),
    createSigninCode: sinon.spy((uid, flowId) => {
      assert.ok(typeof uid === 'string');
      assert.ok(typeof flowId === 'string');
      return P.resolve(data.signinCode || []);
    }),
    devices: sinon.spy(uid => {
      assert.ok(typeof uid === 'string');
      return P.resolve(data.devices || []);
    }),
    device: sinon.spy((uid, deviceId) => {
      assert.ok(typeof uid === 'string');
      assert.ok(typeof deviceId === 'string');
      const device = data.devices.find(d => d.id === deviceId);
      assert.ok(device);
      return P.resolve(device);
    }),
    deleteSecurityEvents: sinon.spy(() => {
      return P.resolve({});
    }),
    deleteSessionToken: sinon.spy(() => {
      return P.resolve();
    }),
    deleteAccountSubscription: sinon.spy(async (uid, subscriptionId) => true),
    emailRecord: sinon.spy(() => {
      if (errors.emailRecord) {
        return P.reject(errors.emailRecord);
      }
      return P.resolve({
        authSalt: crypto.randomBytes(32).toString('hex'),
        createdAt: data.createdAt || Date.now(),
        data: crypto.randomBytes(32).toString('hex'),
        email: data.email,
        emailVerified: data.emailVerified,
        primaryEmail: {
          normalizedEmail: normalizeEmail(data.email),
          email: data.email,
          isVerified: data.emailVerified,
          isPrimary: true,
        },
        emails: [
          {
            normalizedEmail: normalizeEmail(data.email),
            email: data.email,
            isVerified: data.emailVerified,
            isPrimary: true,
          },
        ],
        kA: crypto.randomBytes(32).toString('hex'),
        lastAuthAt: () => {
          return Date.now();
        },
        uid: data.uid,
        wrapWrapKb: crypto.randomBytes(32).toString('hex'),
      });
    }),
    forgotPasswordVerified: sinon.spy(() => {
      return P.resolve(data.accountResetToken);
    }),
    getSecondaryEmail: sinon.spy(() => {
      return P.reject(error.unknownSecondaryEmail());
    }),
    getRecoveryKey: sinon.spy(() => {
      if (data.recoveryKeyIdInvalid) {
        return P.reject(error.recoveryKeyInvalid());
      }

      return P.resolve({
        recoveryData: data.recoveryData,
      });
    }),
    recoveryKeyExists: sinon.spy(() => {
      return P.resolve({
        exists: !!data.recoveryData,
      });
    }),
    securityEvents: sinon.spy(() => {
      return P.resolve([]);
    }),
    securityEventsByUid: sinon.spy(() => {
      return P.resolve([
        {
          name: 'account.create',
          verified: 1,
          createdAt: Date.now() - 2000,
        },
        {
          name: 'account.login',
          verified: 1,
          createdAt: Date.now() - 2000,
        },
        {
          name: 'account.reset',
          verified: 1,
          createdAt: Date.now() - 2000,
        },
      ]);
    }),
    sessions: sinon.spy(uid => {
      assert.ok(typeof uid === 'string');
      return P.resolve(data.sessions || []);
    }),
    updateDevice: sinon.spy((uid, device) => {
      assert.ok(typeof uid === 'string');
      return P.resolve(device);
    }),
    sessionToken: sinon.spy(() => {
      const res = {
        id: data.sessionTokenId || 'fake session token id',
        uid: data.uid || 'fake uid',
        tokenVerified: true,
        uaBrowser: data.uaBrowser,
        uaBrowserVersion: data.uaBrowserVersion,
        uaOS: data.uaOS,
        uaOSVersion: data.uaOSVersion,
        uaDeviceType: data.uaDeviceType,
        expired: () => data.expired || false,
      };
      // SessionToken is a class, and tokenTypeID is a class attribute. Fake that.
      res.constructor.tokenTypeID = 'sessionToken';
      if (data.devices && data.devices.length > 0) {
        Object.keys(data.devices[0]).forEach(key => {
          const keyOnSession = `device${key
            .charAt(0)
            .toUpperCase()}${key.substr(1)}`;
          res[keyOnSession] = data.devices[0][key];
        });
      }
      return P.resolve(res);
    }),
    verifyTokens: optionallyThrow(errors, 'verifyTokens'),
    verifyTokenCode: sinon.spy(() => {
      if (errors.verifyTokenCode) {
        return P.reject(errors.verifyTokenCode);
      }
      return P.resolve({});
    }),
    replaceRecoveryCodes: sinon.spy(() => {
      return P.resolve(['12312312', '12312312']);
    }),
  });
}

function mockOAuthDB(methods = {}) {
  // For OAuthDB, the mock object needs to expose a `.api` property
  // with route validation info, so we load the module directly.
  const log = methods.log || module.exports.mockLog();
  const config = methods.config || {
    oauth: { url: 'http://mocked-oauth-url.net' },
  };
  return mockObject(
    OAUTHDB_METHOD_NAMES,
    require('../lib/oauthdb')(log, config)
  )(methods);
}

function mockObject(methodNames, baseObj) {
  return methods => {
    methods = methods || {};
    return methodNames.reduce((object, name) => {
      object[name] = methods[name] || sinon.spy(() => P.resolve());
      return object;
    }, baseObj || {});
  };
}

function mockPush(methods) {
  const push = Object.assign({}, methods);
  PUSH_METHOD_NAMES.forEach(name => {
    if (!push[name]) {
      push[name] = sinon.spy(() => P.resolve());
    }
  });
  return push;
}

function mockPushbox(methods) {
  const pushbox = Object.assign({}, methods);
  PUSHBOX_METHOD_NAMES.forEach(name => {
    if (!pushbox[name]) {
      pushbox[name] = sinon.spy(() => P.resolve());
    }
  });
  return pushbox;
}

function mockSubHub(methods) {
  const subscriptionsBackend = Object.assign({}, methods);
  SUBHUB_METHOD_NAMES.forEach(name => {
    if (!subscriptionsBackend[name]) {
      subscriptionsBackend[name] = sinon.spy(() => P.resolve());
    }
  });
  return subscriptionsBackend;
}

function mockProfile(methods) {
  const profileBackend = Object.assign({}, methods);
  PROFILE_METHOD_NAMES.forEach(name => {
    if (!profileBackend[name]) {
      profileBackend[name] = sinon.spy(() => P.resolve());
    }
  });
  return profileBackend;
}

function mockDevices(data, errors) {
  data = data || {};
  errors = errors || {};

  return {
    isSpuriousUpdate: sinon.spy(() => data.spurious || false),
    upsert: sinon.spy(() => {
      if (errors.upsert) {
        return P.reject(errors.upsert);
      }
      return P.resolve({
        id: data.deviceId || crypto.randomBytes(16).toString('hex'),
        name: data.deviceName || 'mock device name',
        type: data.deviceType || 'desktop',
      });
    }),
    destroy: sinon.spy(async () => {
      return data;
    }),
    synthesizeName: sinon.spy(() => {
      return data.deviceName || null;
    }),
  };
}

function mockMetricsContext(methods) {
  methods = methods || {};
  return mockObject(METRICS_CONTEXT_METHOD_NAMES)({
    gather:
      methods.gather ||
      sinon.spy(function(data) {
        const time = Date.now();
        return P.resolve().then(() => {
          if (this.payload && this.payload.metricsContext) {
            return Object.assign(
              data,
              {
                time: time,
                flow_id: this.payload.metricsContext.flowId,
                flow_time: time - this.payload.metricsContext.flowBeginTime,
                flowBeginTime: this.payload.metricsContext.flowBeginTime,
                flowCompleteSignal: this.payload.metricsContext
                  .flowCompleteSignal,
                flowType: this.payload.metricsContext.flowType,
              },
              this.headers && this.headers.dnt === '1'
                ? {}
                : {
                    entrypoint: this.payload.metricsContext.entrypoint,
                    entrypoint_experiment: this.payload.metricsContext
                      .entrypointExperiment,
                    entrypoint_variation: this.payload.metricsContext
                      .entrypointVariation,
                    utm_campaign: this.payload.metricsContext.utmCampaign,
                    utm_content: this.payload.metricsContext.utmContent,
                    utm_medium: this.payload.metricsContext.utmMedium,
                    utm_source: this.payload.metricsContext.utmSource,
                    utm_term: this.payload.metricsContext.utmTerm,
                    product_id: this.payload.metricsContext.productId,
                    plan_id: this.payload.metricsContext.planId,
                  }
            );
          }

          return data;
        });
      }),

    setFlowCompleteSignal: sinon.spy(function(flowCompleteSignal) {
      if (this.payload && this.payload.metricsContext) {
        this.payload.metricsContext.flowCompleteSignal = flowCompleteSignal;
      }
    }),

    validate: methods.validate || sinon.spy(() => true),
  });
}

function generateMetricsContext() {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const flowBeginTime = Date.now();
  const flowSignature = crypto
    .createHmac('sha256', config.metrics.flow_id_key)
    .update([randomBytes, flowBeginTime.toString(16)].join('\n'))
    .digest('hex')
    .substr(0, 32);

  return {
    flowBeginTime: flowBeginTime,
    flowId: randomBytes + flowSignature,
  };
}

function mockRequest(data, errors) {
  const events = require('../lib/metrics/events')(
    data.log || module.exports.mockLog(),
    {
      oauth: {
        clientIds: data.clientIds || {},
      },
      verificationReminders: {},
    }
  );
  const metricsContext =
    data.metricsContext || module.exports.mockMetricsContext();

  const geo = data.geo || {
    timeZone: knownIpLocation.location.tz,
    location: {
      city: knownIpLocation.location.city.values().next().value,
      country: knownIpLocation.location.country,
      countryCode: knownIpLocation.location.countryCode,
      state: knownIpLocation.location.state,
      stateCode: knownIpLocation.location.stateCode,
    },
  };

  let devices;
  if (errors && errors.devices) {
    devices = P.reject(errors.devices);
  } else {
    devices = P.resolve(data.devices || []);
  }

  let metricsContextData = data.payload && data.payload.metricsContext;
  if (!metricsContextData) {
    metricsContextData = {};
  }

  return {
    app: {
      acceptLanguage: data.acceptLanguage || 'en-US',
      clientAddress: data.clientAddress || knownIpLocation.ip,
      devices,
      features: new Set(data.features),
      geo,
      locale: data.locale || 'en-US',
      metricsContext: P.resolve(metricsContextData),
      ua: {
        browser: data.uaBrowser || 'Firefox',
        browserVersion: data.uaBrowserVersion || '57.0',
        os: data.uaOS || 'Mac OS X',
        osVersion: data.uaOSVersion || '10.13',
        deviceType: data.uaDeviceType || null,
        formFactor: data.uaFormFactor || null,
      },
    },
    auth: {
      credentials: data.credentials,
      ...data.auth,
    },
    clearMetricsContext: metricsContext.clear,
    emitMetricsEvent: events.emit,
    emitRouteFlowEvent: events.emitRouteFlowEvent,
    gatherMetricsContext: metricsContext.gather,
    headers: data.headers || {
      'user-agent': 'test user-agent',
    },
    info: {
      received: data.received || Date.now() - 1,
      completed: data.completed || 0,
    },
    method: data.method || undefined,
    params: data.params || {},
    path: data.path,
    payload: data.payload || {},
    propagateMetricsContext: metricsContext.propagate,
    query: data.query || {},
    setMetricsFlowCompleteSignal: metricsContext.setFlowCompleteSignal,
    stashMetricsContext: metricsContext.stash,
    validateMetricsContext: metricsContext.validate,
  };
}

function mockVerificationReminders(data = {}) {
  return {
    keys: ['first', 'second', 'third'],
    create: sinon.spy(() => data.create || { first: 1, second: 1, third: 1 }),
    delete: sinon.spy(() => data.delete || { first: 1, second: 1, third: 1 }),
    process: sinon.spy(
      () => data.process || { first: [], second: [], third: [] }
    ),
  };
}

function mockStripeHelper(methods) {
  return mockObject(methods, require('../lib/payments/stripe').StripeHelper);
}
