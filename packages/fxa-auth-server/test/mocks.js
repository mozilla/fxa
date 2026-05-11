/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Shared helpers for mocking things out in the tests.
 */

'use strict';

const assert = require('assert');
const config = require('../config').default.getProperties();
const crypto = require('crypto');
const { AppError: error } = require('@fxa/accounts/errors');
const knownIpLocation = require('./known-ip-location');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const { Container } = require('typedi');
const { AccountEventsManager } = require('../lib/account-events');
const { gleanMetrics } = require('../lib/metrics/glean');
const { PriceManager } = require('@fxa/payments/customer');
const { ProductConfigurationManager } = require('@fxa/shared/cms');
const { FxaMailer } = require('../lib/senders/fxa-mailer');

// Patch Account.metricsEnabled before loading amplitude (replicates what
// proxyquire used to do without replacing the entire auth models module).
// Guard: some test files mock 'fxa-shared/db/models/auth' as {} before this runs.
const _authModels = require('fxa-shared/db/models/auth');
const _Account = _authModels.Account;
let _origMetricsEnabled;
if (_Account) {
  _origMetricsEnabled = _Account.metricsEnabled;
  _Account.metricsEnabled = jest.fn().mockResolvedValue(true);
}
const OAuthClientInfoServiceName = 'OAuthClientInfo';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const amplitudeModule = require('../lib/metrics/amplitude');
// Restore so other tests see the real function (or their own mock)
if (_Account && _origMetricsEnabled) {
  _Account.metricsEnabled = _origMetricsEnabled;
}

const CUSTOMS_METHOD_NAMES = [
  'check',
  'checkAuthenticated',
  'checkIpOnly',
  'flag',
  'reset',
  'v2Enabled',
  'checkV2',
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
  'createPassword',
  'createPasswordChangeToken',
  'createPasswordForgotToken',
  'createRecoveryCodes',
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
  'deleteSessionToken',
  'deviceFromTokenVerificationId',
  'deviceFromRefreshTokenId',
  'deleteRecoveryKey',
  'deleteTotpToken',
  'devices',
  'device',
  'emailBounces',
  'emailRecord',
  'forgotPasswordVerified',
  'getRecoveryCodesExist',
  'getRecoveryKey',
  'getRecoveryKeyRecordWithHint',
  'getSecondaryEmail',
  'keyFetchToken',
  'keyFetchTokenWithVerificationStatus',
  'passwordChangeToken',
  'passwordForgotToken',
  'pruneSessionTokens',
  'recoveryKeyExists',
  'replaceRecoveryCodes',
  'replaceTotpToken',
  'resetAccount',
  'resetAccountTokens',
  'securityEvent',
  'securityEvents',
  'securityEventsByUid',
  'sessions',
  'sessionToken',
  'setPrimaryEmail',
  'setRecoveryCodes',
  'touchSessionToken',
  'totpToken',
  'updateDevice',
  'updateLocale',
  'updateRecoveryCodes',
  'updateRecoveryKey',
  'updateRecoveryKeyHint',
  'updateSessionToken',
  'updateTotpToken',
  'verifiedLoginSecurityEvents',
  'verifyEmail',
  'verifyTokens',
  'verifyTokensWithMethod',
  'createAccountSubscription',
  'getAccountSubscription',
  'deleteAccountSubscription',
  'cancelAccountSubscription',
  'reactivateAccountSubscription',
  'fetchAccountSubscriptions',
  'getLinkedAccount',
  'getLinkedAccounts',
  'createLinkedAccount',
  'deleteLinkedAccount',
  'accountExists',
  'verifyPasswordForgotTokenWithMethod',
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
  'debug',
];

const MAILER_METHOD_NAMES = [
  'sendSubscriptionUpgradeEmail',
  'sendSubscriptionDowngradeEmail',
  'sendSubscriptionPaymentExpiredEmail',
  'sendSubscriptionPaymentProviderCancelledEmail',
  'sendSubscriptionPaymentFailedEmail',
  'sendSubscriptionFailedPaymentsCancellationEmail',
  'sendSubscriptionAccountDeletionEmail',
  'sendSubscriptionCancellationEmail',
  'sendSubscriptionReactivationEmail',
  'sendSubscriptionReplaced',
  'sendSubscriptionSubsequentInvoiceEmail',
  'sendSubscriptionFirstInvoiceEmail',
  'sendDownloadSubscriptionEmail',
  'sendFraudulentAccountDeletionEmail',
  'sendInactiveAccountFirstWarningEmail',
  'sendInactiveAccountSecondWarningEmail',
  'sendInactiveAccountFinalWarningEmail',
  'sendLowRecoveryCodesEmail',
  'sendNewDeviceLoginEmail',
  'sendPasswordChangedEmail',
  'sendPasswordForgotOtpEmail',
  'sendPasswordResetAccountRecoveryEmail',
  'sendPasswordResetRecoveryPhoneEmail',
  'sendPasswordResetWithRecoveryKeyPromptEmail',
  'sendPasswordResetEmail',
  'sendPostAddAccountRecoveryEmail',
  'sendPostChangeAccountRecoveryEmail',
  'sendPostAddLinkedAccountEmail',
  'sendPostAddTwoStepAuthenticationEmail',
  'sendPostChangeTwoStepAuthenticationEmail',
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
  'sendVerifySecondaryCodeEmail',
  'sendPostAddRecoveryPhoneEmail',
  'sendPostRemoveRecoveryPhoneEmail',
  'sendPostSigninRecoveryPhoneEmail',
  'sendPostSigninRecoveryCodeEmail',
  'sendPostChangeRecoveryPhoneEmail',
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
  'notifyVerifyLoginRequest',
  'sendPush',
];

const PUSHBOX_METHOD_NAMES = [
  'retrieve',
  'store',
  'deleteDevice',
  'deleteAccount',
];

const SUBHUB_METHOD_NAMES = [
  'updateCustomer',
  'deleteCustomer',
  'listSubscriptions',
  'createSubscription',
  'cancelSubscription',
  'reactivateSubscription',
];

const STATSD_METHOD_NAMES = ['increment', 'timing', 'histogram'];

const PROFILE_METHOD_NAMES = ['deleteCache', 'updateDisplayName'];

const MOCK_CMS_CLIENTS = [
  {
    capabilities: ['exampleCap0', 'exampleCap1', 'exampleCap3'],
    clientId: 'client1',
  },
  {
    capabilities: [
      'exampleCap0',
      'exampleCap2',
      'exampleCap4',
      'exampleCap5',
      'exampleCap6',
      'exampleCap7',
    ],
    clientId: 'client2',
  },
];

const MOCK_CMS_CLIENT_CAPABILITIES = {
  c1: ['capZZ', 'cap4', 'cap5', 'capAlpha'],
  '*': ['capAll'],
  c2: ['cap5', 'cap6', 'capC', 'capD'],
  c3: ['capD', 'capE'],
};

const MOCK_PLANS = [
  {
    plan_id: 'firefox_pro_basic_823',
    product_id: 'firefox_pro_basic',
    product_name: 'Firefox Pro Basic',
    interval: 'week',
    amount: '123',
    currency: 'usd',
    plan_metadata: {},
    product_metadata: {
      emailIconURL: 'http://example.com/image.jpg',
      successActionButtonURL: 'http://getfirefox.com',
      capabilities: 'exampleCap0',
      'capabilities:client1': 'exampleCap1',
      promotionCodes: 'earlybirds',
    },
  },
  {
    plan_id: 'firefox_pro_basic_999',
    product_id: 'firefox_pro_pro',
    product_name: 'Firefox Pro Pro',
    interval: 'month',
    amount: '456',
    currency: 'usd',
    plan_metadata: {},
    product_metadata: {
      'capabilities:client2': 'exampleCap2, exampleCap4',
    },
  },
  {
    plan_id: 'plan_G93lTs8hfK7NNG',
    product_id: 'prod_G93l8Yn7XJHYUs',
    product_name: 'FN Tier 1',
    interval: 'month',
    amount: 499,
    current: 'usd',
    plan_metadata: {
      'capabilities:client1': 'exampleCap3',
      // NOTE: whitespace in capabilities list should be flexible for human entry
      'capabilities:client2': 'exampleCap5,exampleCap6,   exampleCap7',
      promotionCodes: 'gettheworms?',
    },
    product_metadata: {},
  },
];

const mockCloudTasksConfig = {
  projectId: 'fxa-testo',
  locationId: 'us-north1',
  credentials: {
    keyFilename: '/c/secrets/task-key.json',
  },
  oidc: {
    aud: 'https://tasks.example.io/v1/cloud-tasks',
    serviceAccountEmail: 'testo-tasks@iam.cloud.g.co',
  },
  deleteAccounts: {
    queueName: 'del-accts',
  },
};

module.exports = {
  MOCK_PUSH_KEY:
    'BDLugiRzQCANNj5KI1fAqui8ELrE7qboxzfa5K_R0wnUoJ89xY1D_SOXI_QJKNmellykaW_7U2BZ7hnrPW3A3LM',
  asyncIterable: asyncIterable,
  generateMetricsContext: generateMetricsContext,
  mockBounces: mockObject(['check']),
  mockCMSClients: MOCK_CMS_CLIENTS,
  mockCMSPlanIdsToClientCapabilities: MOCK_CMS_CLIENT_CAPABILITIES,
  mockCloudTasksConfig,
  mockCustoms,
  mockDB,
  mockDevices,
  mockGlean,
  mockLog: mockObject(LOG_METHOD_NAMES),
  mockMailer: mockObject(MAILER_METHOD_NAMES),
  mockMetricsContext,
  mockPlans: MOCK_PLANS,
  mockPush,
  mockPushbox,
  mockRequest,
  mockSubHub,
  mockStatsd: mockObject(STATSD_METHOD_NAMES),
  mockProfile,
  mockVerificationReminders,
  mockCadReminders,
  mockStripeHelper,
  mockPayPalHelper,
  mockPlaySubscriptions,
  mockAppStoreSubscriptions,
  mockAccountEventsManager,
  unMockAccountEventsManager,
  mockPriceManager,
  mockProductConfigurationManager,
  mockFxaMailer,
  mockOAuthClientInfo,
};

function mockCustoms(errors) {
  errors = errors || {};

  return mockObject(CUSTOMS_METHOD_NAMES)({
    checkAuthenticated: optionallyThrow(errors, 'checkAuthenticated'),
    checkIpOnly: optionallyThrow(errors, 'checkIpOnly'),
    v2Enabled: jest.fn(() => true),
    resetV2: jest.fn(() => Promise.resolve()),
  });
}

function optionallyThrow(errors, methodName) {
  return jest.fn(() => {
    if (errors[methodName]) {
      return Promise.reject(errors[methodName]);
    }
    return Promise.resolve();
  });
}

function mockDB(data, errors) {
  data = data || {};
  errors = errors || {};

  return mockObject(DB_METHOD_NAMES)({
    account: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve({
        createdAt: data.createdAt,
        email: data.email,
        authSalt:
          '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
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
        uid: uid || data.uid, // Prefer the uid parameter, fall back to data.uid
        verifierSetAt: data.verifierSetAt ?? Date.now(),
        wrapWrapKb: data.wrapWrapKb,
        metricsOptOutAt: data.metricsOptOutAt || null,
      });
    }),
    accountEmails: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve([
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
    accountExists: jest.fn(() => {
      return Promise.resolve(data.exists ?? true);
    }),
    accountRecord: jest.fn(() => {
      if (errors.emailRecord) {
        return Promise.reject(errors.emailRecord);
      }
      return Promise.resolve({
        authSalt: crypto.randomBytes(32),
        createdAt: data.createdAt || Date.now(),
        data: crypto.randomBytes(32),
        email: data.email,
        emailVerified: data.emailVerified,
        emailCode: data.emailCode,
        primaryEmail: {
          normalizedEmail: normalizeEmail(data.email),
          email: data.email,
          emailCode: data.emailCode,
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
        verifierSetAt: data.verifierSetAt ?? Date.now(),
        linkedAccounts: data.linkedAccounts,
      });
    }),
    consumeSigninCode: jest.fn(() => {
      if (errors.consumeSigninCode) {
        return Promise.reject(errors.consumeSigninCode);
      }
      return Promise.resolve({
        email: data.email,
        flowId: data.flowId,
      });
    }),
    createAccount: jest.fn(() => {
      return Promise.resolve({
        uid: data.uid,
        email: data.email,
        emailCode: data.emailCode,
        emailVerified: data.emailVerified,
        locale: data.locale,
        wrapWrapKb: data.wrapWrapKb,
        primaryEmail: {
          email: data.email,
        },
      });
    }),
    createDevice: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve(
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
    createKeyFetchToken: jest.fn(() => {
      return Promise.resolve({
        data: crypto.randomBytes(32).toString('hex'),
        id: data.keyFetchTokenId,
        uid: data.uid,
      });
    }),
    createPasswordChangeToken: jest.fn(() => {
      return Promise.resolve({
        data: crypto.randomBytes(32).toString('hex'),
      });
    }),
    createPasswordForgotToken: jest.fn(() => {
      return Promise.resolve({
        data: data.data || crypto.randomBytes(32).toString('hex'),
        passCode: data.passCode,
        id: data.passwordForgotTokenId,
        uid: data.uid,
        ttl: function () {
          return data.passwordForgotTokenTTL || 100;
        },
        email: data.emailToHashWith || 'emailToHashWith@email.com',
      });
    }),
    createSessionToken: jest.fn((opts) => {
      return Promise.resolve({
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
    createSigninCode: jest.fn((uid, flowId) => {
      assert.ok(typeof uid === 'string');
      assert.ok(typeof flowId === 'string');
      return Promise.resolve(data.signinCode || []);
    }),
    devices: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve(data.devices || []);
    }),
    device: jest.fn((uid, deviceId) => {
      assert.ok(typeof uid === 'string');
      assert.ok(typeof deviceId === 'string');
      const device = data.devices.find((d) => d.id === deviceId);
      assert.ok(device);
      return Promise.resolve(device);
    }),
    deviceFromRefreshTokenId: jest.fn(() => {
      return Promise.resolve(null);
    }),
    deleteSessionToken: jest.fn(() => {
      return Promise.resolve();
    }),
    deleteAccountSubscription: jest.fn(async (uid, subscriptionId) => true),
    emailRecord: jest.fn(() => {
      if (errors.emailRecord) {
        return Promise.reject(errors.emailRecord);
      }
      return Promise.resolve({
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
    forgotPasswordVerified: jest.fn(() => {
      return Promise.resolve(data.accountResetToken);
    }),
    getSecondaryEmail: jest.fn(() => {
      return Promise.reject(error.unknownSecondaryEmail());
    }),
    getRecoveryKey: jest.fn(() => {
      if (data.recoveryKeyIdInvalid) {
        return Promise.reject(error.recoveryKeyInvalid());
      }

      return Promise.resolve({
        recoveryData: data.recoveryData,
      });
    }),
    getRecoveryKeyRecordWithHint: jest.fn(() => {
      return Promise.resolve({ hint: data.hint });
    }),
    recoveryKeyExists: jest.fn(() => {
      return Promise.resolve({
        exists: !!data.recoveryData,
      });
    }),
    securityEvents: jest.fn(() => {
      return Promise.resolve([]);
    }),
    securityEventsByUid: jest.fn(() => {
      return Promise.resolve([
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
    sessions: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve(data.sessions || []);
    }),
    updateDevice: jest.fn((uid, device) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve(device);
    }),
    verifiedLoginSecurityEvents: jest.fn(() => {
      return Promise.resolve([]);
    }),
    verifiedLoginSecurityEventsByUid: jest.fn(() => {
      return Promise.resolve([]);
    }),
    sessionToken: jest.fn(() => {
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
        setUserAgentInfo: jest.fn(() => {}),
      };
      // SessionToken is a class, and tokenTypeID is a class attribute. Fake that.
      res.constructor.tokenTypeID = 'sessionToken';
      if (data.devices && data.devices.length > 0) {
        Object.keys(data.devices[0]).forEach((key) => {
          const keyOnSession = `device${key
            .charAt(0)
            .toUpperCase()}${key.substr(1)}`;
          res[keyOnSession] = data.devices[0][key];
        });
      }
      return Promise.resolve(res);
    }),
    verifyTokens: optionallyThrow(errors, 'verifyTokens'),
    replaceRecoveryCodes: jest.fn(() => {
      return Promise.resolve(['12312312', '12312312']);
    }),
    setRecoveryCodes: jest.fn(() => {
      return Promise.resolve({ success: true });
    }),
    createRecoveryCodes: jest.fn(() => {
      return Promise.resolve(['12312312', '12312312']);
    }),
    updateRecoveryCodes: jest.fn(() => {
      return Promise.resolve({ success: true });
    }),
    createPassword: jest.fn(() => {
      return Promise.resolve(1584397692000);
    }),
    checkPassword: jest.fn(() => {
      return Promise.resolve({
        v1: data.isPasswordMatchV1 === true,
        v2: data.isPasswordMatchV2 === true,
      });
    }),
    resetAccount: jest.fn(() => {
      return Promise.resolve({
        uid: data.uid,
        verifierSetAt: Date.now(),
        email: data.email,
      });
    }),
    totpToken: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve({
        enabled: false,
      });
    }),
    getLinkedAccounts: jest.fn((uid) => {
      assert.ok(typeof uid === 'string');
      return Promise.resolve(data.linkedAccounts || []);
    }),
  });
}

function mockObject(methodNames, baseObj) {
  return (methods) => {
    methods = methods || {};
    return methodNames.reduce((object, name) => {
      object[name] = methods[name] || jest.fn(() => Promise.resolve());
      return object;
    }, baseObj || {});
  };
}

function mockPush(methods) {
  const push = Object.assign({}, methods);
  PUSH_METHOD_NAMES.forEach((name) => {
    if (!push[name]) {
      push[name] = jest.fn(() => Promise.resolve());
    }
  });
  return push;
}

function mockPushbox(methods) {
  const pushbox = Object.assign({}, methods);
  if (!pushbox.retrieve) {
    // Route code expects the `retrieve` method to return a properly-structured object.
    pushbox.retrieve = jest.fn(() =>
      Promise.resolve({
        last: true,
        index: 0,
        messages: [],
      })
    );
  }
  PUSHBOX_METHOD_NAMES.forEach((name) => {
    if (!pushbox[name]) {
      pushbox[name] = jest.fn(() => Promise.resolve());
    }
  });
  return pushbox;
}

function mockSubHub(methods) {
  const subscriptionsBackend = Object.assign({}, methods);
  SUBHUB_METHOD_NAMES.forEach((name) => {
    if (!subscriptionsBackend[name]) {
      subscriptionsBackend[name] = jest.fn(() => Promise.resolve());
    }
  });
  return subscriptionsBackend;
}

function mockProfile(methods) {
  const profileBackend = Object.assign({}, methods);
  PROFILE_METHOD_NAMES.forEach((name) => {
    if (!profileBackend[name]) {
      profileBackend[name] = jest.fn(() => Promise.resolve());
    }
  });
  return profileBackend;
}

function mockDevices(data, errors) {
  data = data || {};
  errors = errors || {};

  return {
    isSpuriousUpdate: jest.fn(() => data.spurious || false),
    upsert: jest.fn(() => {
      if (errors.upsert) {
        return Promise.reject(errors.upsert);
      }
      return Promise.resolve({
        id: data.deviceId || crypto.randomBytes(16).toString('hex'),
        name: data.deviceName || 'mock device name',
        type: data.deviceType || 'desktop',
      });
    }),
    destroy: jest.fn(async () => {
      return data;
    }),
    synthesizeName: jest.fn(() => {
      return data.deviceName || '';
    }),
  };
}

function mockMetricsContext(methods) {
  methods = methods || {};
  return mockObject(METRICS_CONTEXT_METHOD_NAMES)({
    gather:
      methods.gather ||
      jest.fn(function (data) {
        const time = Date.now();
        return Promise.resolve().then(() => {
          if (this.payload && this.payload.metricsContext) {
            return Object.assign(
              data,
              {
                time: time,
                flow_id: this.payload.metricsContext.flowId,
                flow_time: time - this.payload.metricsContext.flowBeginTime,
                flowBeginTime: this.payload.metricsContext.flowBeginTime,
                flowCompleteSignal:
                  this.payload.metricsContext.flowCompleteSignal,
                flowType: this.payload.metricsContext.flowType,
              },
              this.headers && this.headers.dnt === '1'
                ? {}
                : {
                    entrypoint: this.payload.metricsContext.entrypoint,
                    entrypoint_experiment:
                      this.payload.metricsContext.entrypointExperiment,
                    entrypoint_variation:
                      this.payload.metricsContext.entrypointVariation,
                    ...(this.payload.metricsContext.service
                      ? { service: this.payload.metricsContext.service }
                      : {}),
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

    setFlowCompleteSignal: jest.fn(function (flowCompleteSignal) {
      if (this.payload && this.payload.metricsContext) {
        this.payload.metricsContext.flowCompleteSignal = flowCompleteSignal;
      }
    }),

    validate: methods.validate || jest.fn(() => true),
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
      amplitude: { rawEvents: false },
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
    devices = Promise.reject(errors.devices);
  } else {
    devices = Promise.resolve(data.devices || []);
  }

  let metricsContextData = data.payload && data.payload.metricsContext;
  if (!metricsContextData) {
    metricsContextData = {};
  }
  const app = data.app || {};
  const isMetricsEnabledValue =
    data.isMetricsEnabledValue === undefined ||
    data.isMetricsEnabledValue === null
      ? true
      : false;
  return {
    app: {
      acceptLanguage: data.acceptLanguage || 'en-US',
      clientAddress: data.clientAddress || knownIpLocation.ip,
      devices,
      features: new Set(data.features),
      geo,
      locale: data.locale || 'en-US',
      metricsContext: Promise.resolve(metricsContextData),
      ua: {
        browser: data.uaBrowser || 'Firefox',
        browserVersion: data.uaBrowserVersion || '57.0',
        os: data.uaOS || 'Mac OS X',
        osVersion: data.uaOSVersion || '10.13',
        deviceType: data.uaDeviceType || null,
        formFactor: data.uaFormFactor || null,
      },
      isMetricsEnabled: Promise.resolve(isMetricsEnabledValue),
      ...app,
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
      'x-sigsci-requestid': 'test-sigsci-id',
      'client-ja4': 'test-ja4',
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
    keys: ['first', 'second', 'third', 'final'],
    create: jest.fn(
      () => data.create || { first: 1, second: 1, third: 1, final: 1 }
    ),
    delete: jest.fn(
      () => data.delete || { first: 1, second: 1, third: 1, final: 1 }
    ),
    process: jest.fn(
      () => data.process || { first: [], second: [], third: [], final: [] }
    ),
  };
}

function asyncIterable(lst) {
  const asyncIter = {
    items: lst,
    next() {
      const value = this.items.shift();
      return value
        ? Promise.resolve({ value, done: false })
        : Promise.resolve({ done: true });
    },
  };
  return {
    [Symbol.asyncIterator]: () => asyncIter,
  };
}

function mockCadReminders(data = {}) {
  return {
    keys: ['first', 'second', 'third'],
    create: jest.fn(() => data.create || { first: 1, second: 1, third: 1 }),
    delete: jest.fn(() => data.delete || { first: 1, second: 1, third: 1 }),
    get: jest.fn(() => data.get || { first: null, second: null, third: null }),
    process: jest.fn(
      () => data.process || { first: [], second: [], third: [] }
    ),
  };
}

function mockStripeHelper(methods) {
  return mockObject(methods, require('../lib/payments/stripe').StripeHelper);
}

function mockPayPalHelper(methods) {
  return mockObject(
    methods,
    require('../lib/payments/paypal/helper').PayPalHelper
  );
}

function mockPlaySubscriptions(methods) {
  return mockObject(
    methods,
    require('../lib/payments/iap/google-play/subscriptions').PlaySubscriptions
  );
}

function mockAppStoreSubscriptions(methods) {
  return mockObject(
    methods,
    require('../lib/payments/iap/apple-app-store/subscriptions')
      .AppStoreSubscriptions
  );
}

function mockAccountEventsManager() {
  const mgr = {
    recordSecurityEvent: jest.fn().mockResolvedValue({}),
    recordEmailEvent: jest.fn().mockResolvedValue({}),
  };
  Container.set(AccountEventsManager, mgr);
  return mgr;
}

function unMockAccountEventsManager() {
  Container.remove(AccountEventsManager);
}

function mockGlean() {
  const glean = gleanMetrics({
    gleanMetrics: {
      enabled: true,
      applicationId: 'accounts_backend_test',
      channel: 'test',
      loggerAppName: 'auth-server-tests',
    },
  });

  for (const i in glean) {
    for (const j in glean[i]) {
      glean[i][j] = jest.fn();
    }
  }

  return glean;
}

function mockPriceManager() {
  const priceManager = {
    retrieve: jest.fn(),
  };
  Container.set(PriceManager, priceManager);
  return priceManager;
}

function mockProductConfigurationManager() {
  const productConfigurationManager = {
    getIapOfferings: jest.fn(),
    getPurchaseWithDetailsOfferingContentByPlanIds: jest.fn(async () => {
      return {
        transformedPurchaseWithCommonContentForPlanId: jest.fn(() => {
          return {
            offering: {
              commonContent: {
                privacyNoticeDownloadUrl:
                  'https://payments-next.example.com/privacy',
                termsOfServiceDownloadUrl:
                  'https://payments-next.example.com/tos',
                localizations: [
                  {
                    privacyNoticeDownloadUrl:
                      'https://payments-next.example.com/privacy',
                    termsOfServiceDownloadUrl:
                      'https://payments-next.example.com/tos',
                  },
                ],
              },
            },
          };
        }),
      };
    }),
  };
  Container.set(ProductConfigurationManager, productConfigurationManager);
  return productConfigurationManager;
}

/**
 * Used to mock the FxaMailer, injecting the mock into the Container. Be sure
 * to call this before the code under test requests an FxaMailer instance from
 * the Container.
 *
 * `canSend` is defaulted to a stub that resolves to `false`, so email
 * sending is disabled by default in tests. Call mock setup with an override to enable
 * sending for specific tests.
 * ```
 * const mockFxaMailer = mocks.mockFxaMailer({ canSend: jest.fn().mockResolvedValue(true) });
 * // or, if you don't need to spy on the method:
 * const mockFxaMailer = mocks.mockFxaMailer({ canSend: true });
 * ```
 * @param {*} overrides
 * @returns {object} The mock FxaMailer instance for spy and assertion use.
 * @usage
 *
 * ``` ts
 * const mockFxaMailer = mocks.mockFxaMailer();
 * // arrange, act, assert
 * expect(mockFxaMailer.sendRecoveryEmail).toHaveBeenCalledTimes(1);
 * ```
 */
function mockFxaMailer(overrides) {
  const mockFxaMailer = {
    // add new email methods here!
    canSend: jest.fn().mockReturnValue(true),
    sendRecoveryEmail: jest.fn().mockResolvedValue(),
    sendPasswordForgotOtpEmail: jest.fn().mockResolvedValue(),
    sendPasswordlessSigninOtpEmail: jest.fn().mockResolvedValue(),
    sendPasswordlessSignupOtpEmail: jest.fn().mockResolvedValue(),
    sendPostVerifySecondaryEmail: jest.fn().mockResolvedValue(),
    sendPostChangePrimaryEmail: jest.fn().mockResolvedValue(),
    sendPostRemoveSecondaryEmail: jest.fn().mockResolvedValue(),
    sendPostAddLinkedAccountEmail: jest.fn().mockResolvedValue(),
    sendNewDeviceLoginEmail: jest.fn().mockResolvedValue(),
    sendPostAddTwoStepAuthenticationEmail: jest.fn().mockResolvedValue(),
    sendPostChangeTwoStepAuthenticationEmail: jest.fn().mockResolvedValue(),
    sendPostNewRecoveryCodesEmail: jest.fn().mockResolvedValue(),
    sendPostConsumeRecoveryCodeEmail: jest.fn().mockResolvedValue(),
    sendLowRecoveryCodesEmail: jest.fn().mockResolvedValue(),
    sendPostSigninRecoveryCodeEmail: jest.fn().mockResolvedValue(),
    sendPostAddRecoveryPhoneEmail: jest.fn().mockResolvedValue(),
    sendPostChangeRecoveryPhoneEmail: jest.fn().mockResolvedValue(),
    sendPostRemoveRecoveryPhoneEmail: jest.fn().mockResolvedValue(),
    sendPasswordResetRecoveryPhoneEmail: jest.fn().mockResolvedValue(),
    sendPostSigninRecoveryPhoneEmail: jest.fn().mockResolvedValue(),
    sendPostAddAccountRecoveryEmail: jest.fn().mockResolvedValue(),
    sendPostChangeAccountRecoveryEmail: jest.fn().mockResolvedValue(),
    sendPostRemoveAccountRecoveryEmail: jest.fn().mockResolvedValue(),
    sendPasswordResetAccountRecoveryEmail: jest.fn().mockResolvedValue(),
    sendPasswordResetWithRecoveryKeyPromptEmail: jest.fn().mockResolvedValue(),
    sendPostVerifyEmail: jest.fn().mockResolvedValue(),
    sendVerifyLoginCodeEmail: jest.fn().mockResolvedValue(),
    sendVerifyShortCodeEmail: jest.fn().mockResolvedValue(),
    sendVerifySecondaryCodeEmail: jest.fn().mockResolvedValue(),
    sendVerifyLoginEmail: jest.fn().mockResolvedValue(),
    sendVerifyEmail: jest.fn().mockResolvedValue(),
    sendVerifyAccountChangeEmail: jest.fn().mockResolvedValue(),
    sendUnblockCodeEmail: jest.fn().mockResolvedValue(),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(),
    sendPasswordChangedEmail: jest.fn().mockResolvedValue(),
    sendInactiveAccountFirstWarningEmail: jest.fn().mockResolvedValue(),
    sendInactiveAccountSecondWarningEmail: jest.fn().mockResolvedValue(),
    sendInactiveAccountFinalWarningEmail: jest.fn().mockResolvedValue(),
    sendVerificationReminderFirstEmail: jest.fn().mockResolvedValue(),
    sendVerificationReminderSecondEmail: jest.fn().mockResolvedValue(),
    sendVerificationReminderFinalEmail: jest.fn().mockResolvedValue(),
    sendCadReminderFirstEmail: jest.fn().mockResolvedValue(),
    sendCadReminderSecondEmail: jest.fn().mockResolvedValue(),
    ...overrides,
  };
  Container.set(FxaMailer, mockFxaMailer);
  return mockFxaMailer;
}

function mockOAuthClientInfo(overrides) {
  const mock = {
    fetch: jest.fn().mockResolvedValue({ name: 'sync' }),
    ...overrides,
  };
  Container.set(OAuthClientInfoServiceName, mock);
  return mock;
}
