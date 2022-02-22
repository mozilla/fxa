/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');

const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../mocks');
const getRoute = require('../../routes_helpers').getRoute;
const proxyquire = require('proxyquire');

const uuid = require('uuid');
const crypto = require('crypto');
const error = require('../../../lib/error');
const log = require('../../../lib/log');
const otplib = require('otplib');
const { default: Container } = require('typedi');
const { StripeHelper } = require('../../../lib/payments/stripe');
const { PayPalHelper } = require('../../../lib/payments/paypal');
const { CapabilityService } = require('../../../lib/payments/capability');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const {
  PlaySubscriptions,
} = require('../../../lib/payments/google-play/subscriptions');

const { AccountHandler } = require('../../../lib/routes/account');

const TEST_EMAIL = 'foo@gmail.com';

function hexString(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

const makeRoutes = function (options = {}, requireMocks) {
  Container.set(CapabilityService, sinon.fake);
  const config = options.config || {};
  config.oauth = config.oauth || {};
  config.verifierVersion = config.verifierVersion || 0;
  config.smtp = config.smtp || {};
  config.memcached = config.memcached || {
    address: 'none',
    idle: 500,
    lifetime: 30,
  };
  config.lastAccessTimeUpdates = {};
  config.signinConfirmation = config.signinConfirmation || {};
  config.signinConfirmation.tokenVerificationCode =
    config.signinConfirmation.tokenVerificationCode || {};
  config.signinUnblock = config.signinUnblock || {};
  config.secondaryEmail = config.secondaryEmail || {};

  const log = options.log || mocks.mockLog();
  const mailer = options.mailer || {};
  const cadReminders = options.cadReminders || mocks.mockCadReminders();
  const Password =
    options.Password || require('../../../lib/crypto/password')(log, config);
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: () => {
      return Promise.resolve(true);
    },
  };
  const signinUtils =
    options.signinUtils ||
    require('../../../lib/routes/utils/signin')(
      log,
      config,
      customs,
      db,
      mailer,
      cadReminders
    );
  if (options.checkPassword) {
    signinUtils.checkPassword = options.checkPassword;
  }
  const push = options.push || require('../../../lib/push')(log, db, {});
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const subscriptionAccountReminders =
    options.subscriptionAccountReminders || mocks.mockVerificationReminders();
  const { accountRoutes } = proxyquire(
    '../../../lib/routes/account',
    requireMocks || {}
  );
  const signupUtils =
    options.signupUtils ||
    require('../../../lib/routes/utils/signup')(
      log,
      db,
      mailer,
      push,
      verificationReminders
    );
  return accountRoutes(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    signinUtils,
    signupUtils,
    push,
    verificationReminders,
    subscriptionAccountReminders,
    {
      removeUser: () => {},
      removePublicAndCanGrantTokens: () => {},
    },
    options.stripeHelper
  );
};

function runTest(route, request, assertions) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('/account/reset', () => {
  let uid,
    mockLog,
    mockMetricsContext,
    mockRequest,
    keyFetchTokenId,
    sessionTokenId,
    mockDB,
    mockCustoms,
    mockPush,
    accountRoutes,
    route,
    clientAddress,
    mailer;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockMetricsContext = mocks.mockMetricsContext();
    mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid,
      },
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        authPW: hexString(32),
        sessionToken: true,
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      },
      query: {
        keys: 'true',
      },
      uaBrowser: 'Firefox',
      uaBrowserVersion: '57',
      uaOS: 'Mac OS X',
      uaOSVersion: '10.11',
    });
    keyFetchTokenId = hexString(16);
    sessionTokenId = hexString(16);
    mockDB = mocks.mockDB({
      uid: uid,
      email: TEST_EMAIL,
      emailVerified: true,
      keyFetchTokenId: keyFetchTokenId,
      sessionTokenId: sessionTokenId,
      wrapWrapKb: hexString(32),
    });
    mockCustoms = mocks.mockCustoms();
    mockPush = mocks.mockPush();
    mailer = mocks.mockMailer();
    accountRoutes = makeRoutes({
      config: {
        securityHistory: {
          enabled: true,
        },
      },
      customs: mockCustoms,
      db: mockDB,
      log: mockLog,
      push: mockPush,
      mailer,
    });
    route = getRoute(accountRoutes, '/account/reset');

    clientAddress = mockRequest.app.clientAddress;
  });

  describe('reset account with recovery key', () => {
    let res;
    beforeEach(() => {
      mockRequest.payload.wrapKb = hexString(32);
      mockRequest.payload.recoveryKeyId = hexString(16);
      return runTest(route, mockRequest, (result) => (res = result));
    });

    it('should return response', () => {
      assert.ok(res.sessionToken, 'return sessionToken');
      assert.ok(res.keyFetchToken, 'return keyFetchToken');
    });

    it('should have checked for recovery key', () => {
      assert.equal(mockDB.getRecoveryKey.callCount, 1);
      const args = mockDB.getRecoveryKey.args[0];
      assert.equal(
        args.length,
        2,
        'db.getRecoveryKey passed correct number of args'
      );
      assert.equal(args[0], uid, 'uid passed');
      assert.equal(
        args[1],
        mockRequest.payload.recoveryKeyId,
        'recovery key id passed'
      );
    });

    it('should have reset account with recovery key', () => {
      assert.equal(mockDB.resetAccount.callCount, 1);
      assert.equal(mockDB.resetAccountTokens.callCount, 1);
      assert.equal(mockDB.createKeyFetchToken.callCount, 1);
      const args = mockDB.createKeyFetchToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createKeyFetchToken passed correct number of args'
      );
      assert.equal(args[0].uid, uid, 'uid passed');
      assert.equal(args[0].wrapKb, mockRequest.payload.wrapKb, 'wrapKb passed');
    });

    it('should have deleted recovery key', () => {
      assert.equal(mockDB.deleteRecoveryKey.callCount, 1);
      const args = mockDB.deleteRecoveryKey.args[0];
      assert.equal(
        args.length,
        1,
        'db.deleteRecoveryKey passed correct number of args'
      );
      assert.equal(args[0], uid, 'uid passed');
    });

    it('called mailer.sendPasswordResetAccountRecoveryEmail correctly', () => {
      assert.equal(mailer.sendPasswordResetAccountRecoveryEmail.callCount, 1);
      const args = mailer.sendPasswordResetAccountRecoveryEmail.args[0];
      assert.equal(args.length, 3);
      assert.equal(args[0][0].email, TEST_EMAIL);
    });

    it('should have reset custom server', () => {
      assert.equal(mockCustoms.reset.callCount, 1);
    });

    it('should have recorded security event', () => {
      assert.equal(
        mockDB.securityEvent.callCount,
        1,
        'db.securityEvent was called'
      );
      const securityEvent = mockDB.securityEvent.args[0][0];
      assert.equal(securityEvent.uid, uid);
      assert.equal(securityEvent.ipAddr, clientAddress);
      assert.equal(securityEvent.name, 'account.reset');
    });

    it('should have emitted metrics', () => {
      assert.equal(
        mockLog.activityEvent.callCount,
        1,
        'log.activityEvent was called once'
      );
      const args = mockLog.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.reset',
          region: 'California',
          service: undefined,
          userAgent: 'test user-agent',
          uid: uid,
        },
        'event data was correct'
      );

      assert.equal(mockMetricsContext.validate.callCount, 0);
      assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 0);
      assert.equal(mockMetricsContext.propagate.callCount, 2);
    });

    it('should have created session', () => {
      assert.equal(
        mockDB.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      const args = mockDB.createSessionToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createSessionToken was passed one argument'
      );
      assert.equal(
        args[0].uaBrowser,
        'Firefox',
        'db.createSessionToken was passed correct browser'
      );
      assert.equal(
        args[0].uaBrowserVersion,
        '57',
        'db.createSessionToken was passed correct browser version'
      );
      assert.equal(
        args[0].uaOS,
        'Mac OS X',
        'db.createSessionToken was passed correct os'
      );
      assert.equal(
        args[0].uaOSVersion,
        '10.11',
        'db.createSessionToken was passed correct os version'
      );
      assert.equal(
        args[0].uaDeviceType,
        null,
        'db.createSessionToken was passed correct device type'
      );
      assert.equal(
        args[0].uaFormFactor,
        null,
        'db.createSessionToken was passed correct form factor'
      );
    });
  });

  describe('reset account with totp', () => {
    let res;
    beforeEach(() => {
      mockDB.totpToken = sinon.spy(() => {
        return Promise.resolve({
          verified: true,
          enabled: true,
        });
      });
      return runTest(route, mockRequest, (result) => (res = result));
    });

    it('should return response', () => {
      assert.ok(res.sessionToken, 'return sessionToken');
      assert.ok(res.keyFetchToken, 'return keyFetchToken');
      assert.equal(res.verified, false, 'return verified false');
      assert.equal(
        res.verificationMethod,
        'totp-2fa',
        'verification method set'
      );
    });

    it('should have created unverified sessionToken', () => {
      assert.equal(
        mockDB.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      const args = mockDB.createSessionToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createSessionToken was passed one argument'
      );
      assert.ok(args[0].tokenVerificationId, 'tokenVerificationId is set');
    });

    it('should have created unverified keyFetchToken', () => {
      assert.equal(
        mockDB.createKeyFetchToken.callCount,
        1,
        'db.createKeyFetchToken was called once'
      );
      const args = mockDB.createKeyFetchToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createKeyFetchToken was passed one argument'
      );
      assert.ok(args[0].tokenVerificationId, 'tokenVerificationId is set');
    });
  });

  it('should reset account', () => {
    return runTest(route, mockRequest, (res) => {
      assert.equal(mockDB.resetAccount.callCount, 1);
      assert.equal(mockDB.resetAccountTokens.callCount, 1);

      assert.equal(mockPush.notifyPasswordReset.callCount, 1);
      assert.deepEqual(mockPush.notifyPasswordReset.firstCall.args[0], uid);

      assert.equal(mockDB.account.callCount, 1);
      assert.equal(mockCustoms.reset.callCount, 1);

      assert.equal(
        mockLog.activityEvent.callCount,
        1,
        'log.activityEvent was called once'
      );
      let args = mockLog.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.reset',
          region: 'California',
          service: undefined,
          userAgent: 'test user-agent',
          uid: uid,
        },
        'event data was correct'
      );

      assert.equal(
        mockDB.securityEvent.callCount,
        1,
        'db.securityEvent was called'
      );
      const securityEvent = mockDB.securityEvent.args[0][0];
      assert.equal(securityEvent.uid, uid);
      assert.equal(securityEvent.ipAddr, clientAddress);
      assert.equal(securityEvent.name, 'account.reset');

      assert.equal(mockMetricsContext.validate.callCount, 0);
      assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 0);

      assert.equal(mockMetricsContext.propagate.callCount, 2);

      args = mockMetricsContext.propagate.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0].uid, uid);
      assert.equal(args[1].uid, uid);
      assert.equal(args[1].id, sessionTokenId);

      args = mockMetricsContext.propagate.args[1];
      assert.lengthOf(args, 2);
      assert.equal(args[0].uid, uid);
      assert.equal(args[1].uid, uid);
      assert.equal(args[1].id, keyFetchTokenId);

      assert.equal(
        mockDB.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      args = mockDB.createSessionToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createSessionToken was passed one argument'
      );
      assert.equal(
        args[0].tokenVerificationId,
        null,
        'tokenVerificationId is not set'
      );
      assert.equal(
        args[0].uaBrowser,
        'Firefox',
        'db.createSessionToken was passed correct browser'
      );
      assert.equal(
        args[0].uaBrowserVersion,
        '57',
        'db.createSessionToken was passed correct browser version'
      );
      assert.equal(
        args[0].uaOS,
        'Mac OS X',
        'db.createSessionToken was passed correct os'
      );
      assert.equal(
        args[0].uaOSVersion,
        '10.11',
        'db.createSessionToken was passed correct os version'
      );
      assert.equal(
        args[0].uaDeviceType,
        null,
        'db.createSessionToken was passed correct device type'
      );
      assert.equal(
        args[0].uaFormFactor,
        null,
        'db.createSessionToken was passed correct form factor'
      );
    });
  });
});

describe('deleteAccountIfUnverified', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    uid,
  });
  const mockLog = {
    info: () => {},
  };
  const mockRequest = mocks.mockRequest({
    payload: {
      email: TEST_EMAIL,
      metricsContext: {},
    },
  });
  const mockMailer = {};
  const mockPassword = sinon.spy();
  const mockConfig = {};
  mockConfig.oauth = {};
  mockConfig.signinConfirmation = {};
  mockConfig.signinConfirmation.tokenVerificationCode = {};
  mockConfig.signinConfirmation.skipForEmailAddresses = [];
  const mockCustoms = {};
  const mockSigninUtils = {};
  const mockSignupUtils = {};
  const mockPush = {};
  const mockVerificationReminders = {};
  const mockSubscriptionAccountReminders = {};
  const mockOauth = {};
  const emailRecord = {
    isPrimary: true,
    isVerified: false,
  };
  mockDB.getSecondaryEmail = sinon.spy(async () =>
    Promise.resolve(emailRecord)
  );
  beforeEach(() => {
    mockDB.deleteAccount = sinon.spy(async () => Promise.resolve());
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should delete an unverified account with no linked Stripe account', async () => {
    const mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(false),
    };
    const accountHandler = new AccountHandler(
      mockLog,
      mockDB,
      mockMailer,
      mockPassword,
      mockConfig,
      mockCustoms,
      mockSigninUtils,
      mockSignupUtils,
      mockPush,
      mockVerificationReminders,
      mockSubscriptionAccountReminders,
      mockOauth,
      mockStripeHelper
    );
    await accountHandler.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
    sinon.assert.calledWithMatch(mockDB.deleteAccount, emailRecord);
  });
  it('should not delete an unverified account with a linked Stripe account and return early', async () => {
    const mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(true),
    };
    const accountHandler = new AccountHandler(
      mockLog,
      mockDB,
      mockMailer,
      mockPassword,
      mockConfig,
      mockCustoms,
      mockSigninUtils,
      mockSignupUtils,
      mockPush,
      mockVerificationReminders,
      mockSubscriptionAccountReminders,
      mockOauth,
      mockStripeHelper
    );
    let failed = false;
    try {
      await accountHandler.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
    } catch (err) {
      failed = true;
      assert.equal(err.errno, error.ERRNO.ACCOUNT_EXISTS);
    }
    assert.isTrue(failed);
    sinon.assert.notCalled(mockDB.deleteAccount);
  });
  it('should delete a Stripe customer with no subscriptions', async () => {
    const mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(false),
      removeCustomer: sinon.stub().resolves(),
    };
    const accountHandler = new AccountHandler(
      mockLog,
      mockDB,
      mockMailer,
      mockPassword,
      mockConfig,
      mockCustoms,
      mockSigninUtils,
      mockSignupUtils,
      mockPush,
      mockVerificationReminders,
      mockSubscriptionAccountReminders,
      mockOauth,
      mockStripeHelper
    );
    await accountHandler.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
    sinon.assert.calledOnceWithExactly(
      mockStripeHelper.removeCustomer,
      emailRecord.uid,
      emailRecord.email
    );
  });
  it('should report to Sentry when a Stripe customer deletion fails', async () => {
    const stripeError = new Error('no good');
    const mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(false),
      removeCustomer: sinon.stub().throws(stripeError),
    };
    const sentryModule = require('../../../lib/sentry');
    sinon.stub(sentryModule, 'reportSentryError').returns({});
    const accountHandler = new AccountHandler(
      mockLog,
      mockDB,
      mockMailer,
      mockPassword,
      mockConfig,
      mockCustoms,
      mockSigninUtils,
      mockSignupUtils,
      mockPush,
      mockVerificationReminders,
      mockSubscriptionAccountReminders,
      mockOauth,
      mockStripeHelper
    );
    try {
      await accountHandler.deleteAccountIfUnverified(mockRequest, TEST_EMAIL);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.removeCustomer,
        emailRecord.uid,
        emailRecord.email
      );
      sinon.assert.calledOnceWithExactly(
        sentryModule.reportSentryError,
        stripeError,
        mockRequest
      );
    } catch (e) {
      assert.fail('should not have re-thrown');
    }
    sentryModule.reportSentryError.restore();
  });
});

describe('/account/create', () => {
  function setup(extraConfig) {
    const config = {
      securityHistory: {
        enabled: true,
      },
      ...extraConfig,
    };
    const mockLog = log('ERROR', 'test');
    mockLog.activityEvent = sinon.spy(() => {
      return Promise.resolve();
    });
    mockLog.flowEvent = sinon.spy(() => {
      return Promise.resolve();
    });
    mockLog.error = sinon.spy();
    mockLog.notifier.send = sinon.spy();

    const mockMetricsContext = mocks.mockMetricsContext();
    const mockRequest = mocks.mockRequest({
      locale: 'en-GB',
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        email: TEST_EMAIL,
        authPW: hexString(32),
        service: 'sync',
        metricsContext: {
          deviceId: '20a11921ee094629aafdea72cc973c27',
          entrypoint: 'blee',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
      },
      query: {
        keys: 'true',
      },
      uaBrowser: 'Firefox Mobile',
      uaBrowserVersion: '9',
      uaOS: 'iOS',
      uaOSVersion: '11',
      uaDeviceType: 'tablet',
      uaFormFactor: 'iPad',
    });
    const clientAddress = mockRequest.app.clientAddress;
    const emailCode = hexString(16);
    const keyFetchTokenId = hexString(16);
    const sessionTokenId = hexString(16);
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const mockDB = mocks.mockDB(
      {
        email: TEST_EMAIL,
        emailCode: emailCode,
        emailVerified: false,
        locale: 'en',
        keyFetchTokenId: keyFetchTokenId,
        sessionTokenId: sessionTokenId,
        uaBrowser: 'Firefox',
        uaBrowserVersion: 52,
        uaOS: 'Mac OS X',
        uaOSVersion: '10.10',
        uid: uid,
        wrapWrapKb: 'wibble',
      },
      {
        emailRecord: new error.unknownAccount(),
      }
    );
    const mockMailer = mocks.mockMailer();
    const mockPush = mocks.mockPush();
    const verificationReminders = mocks.mockVerificationReminders();
    const subscriptionAccountReminders = mocks.mockVerificationReminders();
    const accountRoutes = makeRoutes({
      config,
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      Password: function () {
        return {
          unwrap: function () {
            return Promise.resolve('wibble');
          },
          verifyHash: function () {
            return Promise.resolve('wibble');
          },
        };
      },
      push: mockPush,
      verificationReminders,
      subscriptionAccountReminders,
    });
    const route = getRoute(accountRoutes, '/account/create');

    return {
      config,
      clientAddress,
      emailCode,
      keyFetchTokenId,
      mockDB,
      mockLog,
      mockMailer,
      mockMetricsContext,
      mockRequest,
      route,
      sessionTokenId,
      uid,
      verificationReminders,
      subscriptionAccountReminders,
    };
  }

  it('should create a sync account', () => {
    const {
      clientAddress,
      emailCode,
      keyFetchTokenId,
      mockDB,
      mockLog,
      mockMailer,
      mockMetricsContext,
      mockRequest,
      route,
      sessionTokenId,
      uid,
      verificationReminders,
    } = setup();

    const now = Date.now();
    sinon.stub(Date, 'now').callsFake(() => now);

    return runTest(route, mockRequest, () => {
      assert.equal(
        mockDB.createAccount.callCount,
        1,
        'createAccount was called'
      );

      assert.equal(
        mockDB.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      let args = mockDB.createSessionToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createSessionToken was passed one argument'
      );
      assert.equal(
        args[0].uaBrowser,
        'Firefox Mobile',
        'db.createSessionToken was passed correct browser'
      );
      assert.equal(
        args[0].uaBrowserVersion,
        '9',
        'db.createSessionToken was passed correct browser version'
      );
      assert.equal(
        args[0].uaOS,
        'iOS',
        'db.createSessionToken was passed correct os'
      );
      assert.equal(
        args[0].uaOSVersion,
        '11',
        'db.createSessionToken was passed correct os version'
      );
      assert.equal(
        args[0].uaDeviceType,
        'tablet',
        'db.createSessionToken was passed correct device type'
      );
      assert.equal(
        args[0].uaFormFactor,
        'iPad',
        'db.createSessionToken was passed correct form factor'
      );

      assert.equal(
        mockLog.notifier.send.callCount,
        1,
        'an sqs event was logged'
      );
      const eventData = mockLog.notifier.send.getCall(0).args[0];
      assert.equal(eventData.event, 'login', 'it was a login event');
      assert.equal(eventData.data.service, 'sync', 'it was for sync');
      assert.equal(
        eventData.data.email,
        TEST_EMAIL,
        'it was for the correct email'
      );
      assert.equal(
        eventData.data.userAgent,
        'test user-agent',
        'correct user agent'
      );
      assert.equal(eventData.data.country, 'United States', 'correct country');
      assert.equal(eventData.data.countryCode, 'US', 'correct country code');
      assert.ok(eventData.data.ts, 'timestamp of event set');
      assert.deepEqual(
        eventData.data.metricsContext,
        {
          entrypoint: 'blee',
          entrypoint_experiment: 'exp',
          entrypoint_variation: 'var',
          flowBeginTime: mockRequest.payload.metricsContext.flowBeginTime,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          flow_id: mockRequest.payload.metricsContext.flowId,
          flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
          product_id: undefined,
          plan_id: undefined,
          time: now,
          utm_campaign: 'utm campaign',
          utm_content: 'utm content',
          utm_medium: 'utm medium',
          utm_source: 'utm source',
          utm_term: 'utm term',
        },
        'it contained the correct metrics context metadata'
      );

      assert.equal(
        mockLog.activityEvent.callCount,
        1,
        'log.activityEvent was called once'
      );
      args = mockLog.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.created',
          region: 'California',
          service: 'sync',
          userAgent: 'test user-agent',
          uid: uid,
        },
        'event data was correct'
      );

      assert.equal(
        mockLog.flowEvent.callCount,
        1,
        'log.flowEvent was called once'
      );
      args = mockLog.flowEvent.args[0];
      assert.equal(args.length, 1, 'log.flowEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          entrypoint: 'blee',
          entrypoint_experiment: 'exp',
          entrypoint_variation: 'var',
          event: 'account.created',
          flowBeginTime: mockRequest.payload.metricsContext.flowBeginTime,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
          flow_id:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          locale: 'en-GB',
          product_id: undefined,
          plan_id: undefined,
          region: 'California',
          time: now,
          uid: uid,
          userAgent: 'test user-agent',
          utm_campaign: 'utm campaign',
          utm_content: 'utm content',
          utm_medium: 'utm medium',
          utm_source: 'utm source',
          utm_term: 'utm term',
        },
        'flow event data was correct'
      );

      assert.equal(
        mockMetricsContext.validate.callCount,
        1,
        'metricsContext.validate was called'
      );
      assert.equal(
        mockMetricsContext.validate.args[0].length,
        0,
        'validate was called without arguments'
      );

      assert.equal(
        mockMetricsContext.stash.callCount,
        3,
        'metricsContext.stash was called three times'
      );

      args = mockMetricsContext.stash.args[0];
      assert.equal(
        args.length,
        1,
        'metricsContext.stash was passed one argument first time'
      );
      assert.deepEqual(
        args[0].id,
        sessionTokenId,
        'argument was session token'
      );
      assert.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct');
      assert.equal(
        mockMetricsContext.stash.thisValues[0],
        mockRequest,
        'this was request'
      );

      args = mockMetricsContext.stash.args[1];
      assert.equal(
        args.length,
        1,
        'metricsContext.stash was passed one argument second time'
      );
      assert.equal(args[0].id, emailCode, 'argument was synthesized token');
      assert.deepEqual(args[0].uid, uid, 'token.uid was correct');
      assert.equal(
        mockMetricsContext.stash.thisValues[1],
        mockRequest,
        'this was request'
      );

      args = mockMetricsContext.stash.args[2];
      assert.equal(
        args.length,
        1,
        'metricsContext.stash was passed one argument third time'
      );
      assert.deepEqual(
        args[0].id,
        keyFetchTokenId,
        'argument was key fetch token'
      );
      assert.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct');
      assert.equal(
        mockMetricsContext.stash.thisValues[2],
        mockRequest,
        'this was request'
      );

      assert.equal(
        mockMetricsContext.setFlowCompleteSignal.callCount,
        1,
        'metricsContext.setFlowCompleteSignal was called once'
      );
      args = mockMetricsContext.setFlowCompleteSignal.args[0];
      assert.equal(
        args.length,
        2,
        'metricsContext.setFlowCompleteSignal was passed two arguments'
      );
      assert.equal(args[0], 'account.signed', 'first argument was event name');
      assert.equal(args[1], 'registration', 'second argument was flow type');

      let securityEvent = mockDB.securityEvent;
      assert.equal(securityEvent.callCount, 1, 'db.securityEvent is called');
      securityEvent = securityEvent.args[0][0];
      assert.equal(securityEvent.name, 'account.create');
      assert.equal(securityEvent.uid, uid);
      assert.equal(securityEvent.ipAddr, clientAddress);

      assert.equal(
        mockMailer.sendVerifyEmail.callCount,
        1,
        'mailer.sendVerifyEmail was called'
      );
      args = mockMailer.sendVerifyEmail.args[0];
      assert.equal(args[2].acceptLanguage, 'en-US');
      assert.equal(args[2].location.city, 'Mountain View');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].timeZone, 'America/Los_Angeles')
      assert.equal(args[2].uaBrowser, 'Firefox Mobile');
      assert.equal(args[2].uaBrowserVersion, '9');
      assert.equal(args[2].uaOS, 'iOS');
      assert.equal(args[2].uaOSVersion, '11');
      assert.strictEqual(args[2].uaDeviceType, 'tablet');
      assert.equal(
        args[2].deviceId,
        mockRequest.payload.metricsContext.deviceId
      );
      assert.equal(args[2].flowId, mockRequest.payload.metricsContext.flowId);
      assert.equal(
        args[2].flowBeginTime,
        mockRequest.payload.metricsContext.flowBeginTime
      );
      assert.equal(args[2].service, 'sync');
      assert.equal(args[2].uid, uid);

      assert.equal(verificationReminders.create.callCount, 1);
      args = verificationReminders.create.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[0], uid);
      assert.equal(args[1], mockRequest.payload.metricsContext.flowId);
      assert.equal(args[2], mockRequest.payload.metricsContext.flowBeginTime);

      assert.equal(mockLog.error.callCount, 0);
    }).finally(() => Date.now.restore());
  });

  it('should create a non-sync account', () => {
    const {
      mockLog,
      mockMailer,
      mockRequest,
      route,
      uid,
      verificationReminders,
    } = setup();

    const now = Date.now();
    sinon.stub(Date, 'now').callsFake(() => now);

    mockRequest.payload.service = 'foo';

    return runTest(route, mockRequest, () => {
      assert.equal(
        mockLog.notifier.send.callCount,
        1,
        'an sqs event was logged'
      );
      const eventData = mockLog.notifier.send.getCall(0).args[0];
      assert.equal(eventData.event, 'login', 'it was a login event');
      assert.equal(
        eventData.data.service,
        'foo',
        'it was for the expected service'
      );

      assert.equal(
        mockLog.activityEvent.callCount,
        1,
        'log.activityEvent was called once'
      );
      let args = mockLog.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.created',
          region: 'California',
          service: 'foo',
          userAgent: 'test user-agent',
          uid: uid,
        },
        'event data was correct'
      );

      assert.equal(
        mockMailer.sendVerifyEmail.callCount,
        1,
        'mailer.sendVerifyEmail was called'
      );
      args = mockMailer.sendVerifyEmail.args[0];
      assert.equal(args[2].service, 'foo');

      assert.equal(verificationReminders.create.callCount, 1);

      assert.equal(mockLog.error.callCount, 0);
    }).finally(() => Date.now.restore());
  });

  describe('should accept `verficationMethod`', () => {
    describe('email-otp', () => {
      it('should send sign-up code from `email-otp` method', async () => {
        const { config, emailCode, mockMailer, mockRequest, route } = setup();

        mockRequest.payload.verificationMethod = 'email-otp';

        await runTest(route, mockRequest, (res) => {
          assert.calledOnce(mockMailer.sendVerifyShortCodeEmail);

          const authenticator = new otplib.authenticator.Authenticator();
          authenticator.options = Object.assign(
            {},
            otplib.authenticator.options,
            config.otp,
            { secret: emailCode }
          );
          const expectedCode = authenticator.generate();
          const args = mockMailer.sendVerifyShortCodeEmail.args[0];
          assert.equal(args[2].code, expectedCode, 'expected code set');
          assert.equal(
            args[2].acceptLanguage,
            mockRequest.app.acceptLanguage,
            'en-US'
          );

          assert.equal(
            args[2].location,
            mockRequest.app.geo.location,
            'location set'
          );

          assert.equal(
            args[2].timeZone,
            mockRequest.app.geo.timeZone,
            'America/Los_Angeles'
          );

          assert.equal(
            res.verificationMethod,
            mockRequest.payload.verificationMethod
          );
        });
      });
    });
  });

  it('should return an error if email fails to send', () => {
    const { mockMailer, mockRequest, route, verificationReminders } = setup();

    mockMailer.sendVerifyEmail = sinon.spy(() => Promise.reject());

    return runTest(route, mockRequest).then(assert.fail, (err) => {
      assert.equal(err.message, 'Failed to send email');
      assert.equal(err.output.payload.code, 422);
      assert.equal(err.output.payload.errno, 151);
      assert.equal(err.output.payload.error, 'Unprocessable Entity');

      assert.equal(verificationReminders.create.callCount, 0);
    });
  });

  it('should return a bounce error if send fails with one', () => {
    const { mockMailer, mockRequest, route, verificationReminders } = setup();

    mockMailer.sendVerifyEmail = sinon.spy(() =>
      Promise.reject(error.emailBouncedHard(42))
    );

    return runTest(route, mockRequest).then(assert.fail, (err) => {
      assert.equal(err.message, 'Email account hard bounced');
      assert.equal(err.output.payload.code, 400);
      assert.equal(err.output.payload.errno, 134);
      assert.equal(err.output.payload.error, 'Bad Request');

      assert.equal(verificationReminders.create.callCount, 0);
    });
  });

  it('can refuse new account creations for selected OAuth clients', async () => {
    const { mockRequest, route } = setup({
      oauth: {
        disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
      },
    });

    mockRequest.payload.service = 'd15ab1edd15ab1ed';

    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.output.statusCode, 503);
      assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
    }
  });
});

describe('/account/stub', () => {
  function setup(extraConfig) {
    const config = {
      securityHistory: {
        enabled: true,
      },
      ...extraConfig,
    };
    const mockLog = log('ERROR', 'test');
    mockLog.activityEvent = sinon.spy(() => {
      return Promise.resolve();
    });
    mockLog.flowEvent = sinon.spy(() => {
      return Promise.resolve();
    });
    mockLog.error = sinon.spy();
    mockLog.notifier.send = sinon.spy();

    const mockMetricsContext = mocks.mockMetricsContext();
    const email = Math.random() + '_stub@mozilla.com';
    const mockRequest = mocks.mockRequest({
      locale: 'en-GB',
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        email,
        clientId: '59cceb6f8c32317c',
      },
      uaBrowser: 'Firefox Mobile',
      uaBrowserVersion: '9',
      uaOS: 'iOS',
      uaOSVersion: '11',
      uaDeviceType: 'tablet',
      uaFormFactor: 'iPad',
    });
    const clientAddress = mockRequest.app.clientAddress;
    const emailCode = hexString(16);
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const mockDB = mocks.mockDB(
      {
        email,
        emailCode,
        emailVerified: false,
        locale: 'en',
        uaBrowser: 'Firefox',
        uaBrowserVersion: 52,
        uaOS: 'Mac OS X',
        uaOSVersion: '10.10',
        uid,
        wrapWrapKb: 'wibble',
      },
      {
        emailRecord: new error.unknownAccount(),
      }
    );
    const mockMailer = mocks.mockMailer();
    const mockPush = mocks.mockPush();
    const verificationReminders = mocks.mockVerificationReminders();
    const subscriptionAccountReminders = mocks.mockVerificationReminders();
    const accountRoutes = makeRoutes({
      config,
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      Password: function () {
        return {
          unwrap: function () {
            return Promise.resolve('wibble');
          },
          verifyHash: function () {
            return Promise.resolve('wibble');
          },
        };
      },
      push: mockPush,
      verificationReminders,
      subscriptionAccountReminders,
    });
    const route = getRoute(accountRoutes, '/account/stub');

    return {
      config,
      clientAddress,
      email,
      emailCode,
      mockDB,
      mockLog,
      mockMailer,
      mockMetricsContext,
      mockRequest,
      route,
      uid,
      verificationReminders,
      subscriptionAccountReminders,
    };
  }

  it('creates an account', () => {
    const { route, mockRequest, uid } = setup();
    return runTest(route, mockRequest, (response) => {
      assert.equal(response.uid, uid);
      assert.ok(response.access_token);
    });
  });

  it('can refuse new account creations for selected OAuth clients', async () => {
    const { mockRequest, route } = setup({
      oauth: {
        disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
      },
    });

    mockRequest.payload.clientId = 'd15ab1edd15ab1ed';

    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
      assert.equal(err.output.statusCode, 503);
    }
  });
});

describe('/account/finish_setup', () => {
  function setup(options) {
    const config = {
      securityHistory: {
        enabled: true,
      },
    };
    const mockLog = log('ERROR', 'test');
    mockLog.activityEvent = sinon.spy(() => {
      return Promise.resolve();
    });
    mockLog.flowEvent = sinon.spy(() => {
      return Promise.resolve();
    });
    mockLog.error = sinon.spy();
    mockLog.notifier.send = sinon.spy();

    const mockMetricsContext = mocks.mockMetricsContext();
    const email = Math.random() + '_stub@mozilla.com';
    const emailCode = hexString(16);
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const mockRequest = mocks.mockRequest({
      locale: 'en-GB',
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        token: 'a.test.token',
        uid,
      },
      uaBrowser: 'Firefox Mobile',
      uaBrowserVersion: '9',
      uaOS: 'iOS',
      uaOSVersion: '11',
      uaDeviceType: 'tablet',
      uaFormFactor: 'iPad',
    });
    const clientAddress = mockRequest.app.clientAddress;
    const mockDB = mocks.mockDB(
      {
        email,
        emailCode,
        emailVerified: false,
        locale: 'en',
        uaBrowser: 'Firefox',
        uaBrowserVersion: 52,
        uaOS: 'Mac OS X',
        uaOSVersion: '10.10',
        uid,
        authSalt: '',
        wrapWrapKb: 'wibble',
        verifierSetAt: options.verifierSetAt,
      },
      {
        emailRecord: new error.unknownAccount(),
      }
    );
    const mockMailer = mocks.mockMailer();
    const mockPush = mocks.mockPush();
    const verificationReminders = mocks.mockVerificationReminders();
    const subscriptionAccountReminders = mocks.mockVerificationReminders();
    const accountRoutes = makeRoutes(
      {
        config,
        db: mockDB,
        log: mockLog,
        mailer: mockMailer,
        Password: function () {
          return {
            unwrap: function () {
              return Promise.resolve('wibble');
            },
            verifyHash: function () {
              return Promise.resolve('wibble');
            },
          };
        },
        push: mockPush,
        verificationReminders,
        subscriptionAccountReminders,
      },
      {
        '../oauth/jwt': {
          verify: sinon.stub().returns(Promise.resolve({ uid })),
        },
      }
    );
    const route = getRoute(accountRoutes, '/account/finish_setup');

    return {
      config,
      clientAddress,
      email,
      emailCode,
      mockDB,
      mockLog,
      mockMailer,
      mockMetricsContext,
      mockRequest,
      route,
      uid,
      verificationReminders,
      subscriptionAccountReminders,
    };
  }

  it('succeeds when the account is a stub', () => {
    const { route, mockRequest, mockDB, uid } = setup({
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response) => {
      assert.equal(mockDB.verifyEmail.callCount, 1);
      assert.equal(mockDB.resetAccount.callCount, 1);
      assert.equal(mockDB.resetAccountTokens.callCount, 1);
      assert.ok(response.sessionToken);
      assert.equal(response.uid, uid);
    });
  });

  it('returns an unauthorized error when the account is already set up', async () => {
    const { route, mockRequest } = setup({
      verifierSetAt: Date.now(),
    });
    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.errno, 110);
    }
  });
});

describe('/account/login', () => {
  const config = {
    securityHistory: {
      ipProfiling: {},
    },
    signinConfirmation: {
      tokenVerificationCode: {
        codeLength: 8,
      },
    },
    signinUnblock: {
      codeLifetime: 1000,
    },
  };
  const mockLog = log('ERROR', 'test');
  mockLog.activityEvent = sinon.spy(() => {
    return Promise.resolve();
  });
  mockLog.flowEvent = sinon.spy(() => {
    return Promise.resolve();
  });
  mockLog.notifier.send = sinon.spy();
  const mockMetricsContext = mocks.mockMetricsContext();

  const mockRequest = mocks.mockRequest({
    log: mockLog,
    headers: {
      dnt: '1',
      'user-agent': 'test user-agent',
    },
    metricsContext: mockMetricsContext,
    payload: {
      authPW: hexString(32),
      email: TEST_EMAIL,
      service: 'sync',
      reason: 'signin',
      metricsContext: {
        deviceId: '20a11921ee094629aafdea72cc973c27',
        entrypoint: 'flub',
        entrypointExperiment: 'exp',
        entrypointVariation: 'var',
        flowBeginTime: Date.now(),
        flowId:
          'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        utmCampaign: 'utm campaign',
        utmContent: 'utm content',
        utmMedium: 'utm medium',
        utmSource: 'utm source',
        utmTerm: 'utm term',
      },
    },
    query: {
      keys: 'true',
    },
    uaBrowser: 'Firefox',
    uaBrowserVersion: '50',
    uaOS: 'Android',
    uaOSVersion: '6',
    uaDeviceType: 'mobile',
  });
  const mockRequestNoKeys = mocks.mockRequest({
    log: mockLog,
    metricsContext: mockMetricsContext,
    payload: {
      authPW: hexString(32),
      email: 'test@mozilla.com',
      service: 'dcdb5ae7add825d2',
      reason: 'signin',
      metricsContext: {
        deviceId: 'blee',
        flowBeginTime: Date.now(),
        flowId:
          'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        service: 'dcdb5ae7add825d2',
      },
    },
    query: {},
  });
  const mockRequestSuspect = mocks.mockRequest({
    log: mockLog,
    metricsContext: mockMetricsContext,
    payload: {
      authPW: hexString(32),
      email: TEST_EMAIL,
      service: 'dcdb5ae7add825d2',
      reason: 'signin',
      metricsContext: {
        deviceId: 'blee',
        flowBeginTime: Date.now(),
        flowId:
          'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        service: 'dcdb5ae7add825d2',
      },
    },
    query: {},
    app: {
      isSuspiciousRequest: true,
    },
  });
  const mockRequestWithUnblockCode = mocks.mockRequest({
    log: mockLog,
    payload: {
      authPW: hexString(32),
      email: TEST_EMAIL,
      unblockCode: 'ABCD1234',
      service: 'dcdb5ae7add825d2',
      reason: 'signin',
      metricsContext: {
        deviceId: 'ble20a11921ee094629aafdea72cc973c27e',
        flowBeginTime: Date.now(),
        flowId:
          'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
      },
    },
  });
  const keyFetchTokenId = hexString(16);
  const sessionTokenId = hexString(16);
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    emailVerified: true,
    keyFetchTokenId: keyFetchTokenId,
    sessionTokenId: sessionTokenId,
    uaBrowser: 'Firefox',
    uaBrowserVersion: 50,
    uaOS: 'Android',
    uaOSVersion: '6',
    uaDeviceType: 'mobile',
    uid: uid,
  });
  const mockMailer = mocks.mockMailer();
  const mockPush = mocks.mockPush();
  const mockCustoms = {
    check: () => Promise.resolve(),
    flag: () => Promise.resolve(),
  };
  const mockCadReminders = mocks.mockCadReminders();
  const accountRoutes = makeRoutes({
    checkPassword: function () {
      return Promise.resolve(true);
    },
    config: config,
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    push: mockPush,
    cadReminders: mockCadReminders,
  });
  let route = getRoute(accountRoutes, '/account/login');

  const defaultEmailRecord = mockDB.emailRecord;
  const defaultEmailAccountRecord = mockDB.accountRecord;

  beforeEach(() => {
    Container.set(CapabilityService, sinon.fake);
  });

  afterEach(() => {
    mockLog.activityEvent.resetHistory();
    mockLog.flowEvent.resetHistory();
    mockMailer.sendNewDeviceLoginEmail = sinon.spy(() => Promise.resolve([]));
    mockMailer.sendVerifyLoginEmail = sinon.spy(() => Promise.resolve());
    mockMailer.sendVerifyLoginCodeEmail = sinon.spy(() => Promise.resolve());
    mockMailer.sendVerifyEmail.resetHistory();
    mockDB.createSessionToken.resetHistory();
    mockDB.sessions.resetHistory();
    mockMetricsContext.stash.resetHistory();
    mockMetricsContext.validate.resetHistory();
    mockMetricsContext.setFlowCompleteSignal.resetHistory();
    mockDB.emailRecord = defaultEmailRecord;
    mockDB.emailRecord.resetHistory();
    mockDB.accountRecord = defaultEmailAccountRecord;
    mockDB.accountRecord.resetHistory();
    mockDB.getSecondaryEmail = sinon.spy(() =>
      Promise.reject(error.unknownSecondaryEmail())
    );
    mockDB.getSecondaryEmail.resetHistory();
    mockRequest.payload.email = TEST_EMAIL;
    mockRequest.payload.verificationMethod = undefined;
    mockCadReminders.delete.resetHistory();
    Container.reset();
  });

  it('emits the correct series of calls and events', () => {
    const now = Date.now();
    sinon.stub(Date, 'now').callsFake(() => now);

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockDB.accountRecord.callCount,
        1,
        'db.accountRecord was called'
      );

      assert.equal(
        mockDB.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      let args = mockDB.createSessionToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createSessionToken was passed one argument'
      );
      assert.equal(
        args[0].uaBrowser,
        'Firefox',
        'db.createSessionToken was passed correct browser'
      );
      assert.equal(
        args[0].uaBrowserVersion,
        '50',
        'db.createSessionToken was passed correct browser version'
      );
      assert.equal(
        args[0].uaOS,
        'Android',
        'db.createSessionToken was passed correct os'
      );
      assert.equal(
        args[0].uaOSVersion,
        '6',
        'db.createSessionToken was passed correct os version'
      );
      assert.equal(
        args[0].uaDeviceType,
        'mobile',
        'db.createSessionToken was passed correct device type'
      );
      assert.equal(
        args[0].uaFormFactor,
        null,
        'db.createSessionToken was passed correct form factor'
      );

      assert.equal(
        mockLog.notifier.send.callCount,
        1,
        'an sqs event was logged'
      );
      const eventData = mockLog.notifier.send.getCall(0).args[0];
      assert.equal(eventData.event, 'login', 'it was a login event');
      assert.equal(eventData.data.service, 'sync', 'it was for sync');
      assert.equal(
        eventData.data.email,
        TEST_EMAIL,
        'it was for the correct email'
      );
      assert.ok(eventData.data.ts, 'timestamp of event set');
      assert.deepEqual(
        eventData.data.metricsContext,
        {
          time: now,
          flow_id: mockRequest.payload.metricsContext.flowId,
          flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
          flowBeginTime: mockRequest.payload.metricsContext.flowBeginTime,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
        },
        'metrics context was correct'
      );

      assert.equal(
        mockLog.activityEvent.callCount,
        1,
        'log.activityEvent was called once'
      );
      args = mockLog.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.login',
          region: 'California',
          service: 'sync',
          userAgent: 'test user-agent',
          uid: uid,
        },
        'event data was correct'
      );

      assert.equal(
        mockLog.flowEvent.callCount,
        2,
        'log.flowEvent was called twice'
      );
      args = mockLog.flowEvent.args[0];
      assert.equal(
        args.length,
        1,
        'log.flowEvent was passed one argument first time'
      );
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.login',
          flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
          flow_id:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: mockRequest.payload.metricsContext.flowBeginTime,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en-US',
          region: 'California',
          time: now,
          uid: uid,
          userAgent: 'test user-agent',
        },
        'first flow event was correct'
      );
      args = mockLog.flowEvent.args[1];
      assert.equal(
        args.length,
        1,
        'log.flowEvent was passed one argument second time'
      );
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'email.confirmation.sent',
          flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
          flow_id:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: mockRequest.payload.metricsContext.flowBeginTime,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en-US',
          region: 'California',
          time: now,
          userAgent: 'test user-agent',
        },
        'second flow event was correct'
      );

      assert.equal(
        mockMetricsContext.validate.callCount,
        1,
        'metricsContext.validate was called'
      );
      assert.equal(
        mockMetricsContext.validate.args[0].length,
        0,
        'validate was called without arguments'
      );

      assert.equal(
        mockMetricsContext.stash.callCount,
        3,
        'metricsContext.stash was called three times'
      );

      args = mockMetricsContext.stash.args[0];
      assert.equal(
        args.length,
        1,
        'metricsContext.stash was passed one argument first time'
      );
      assert.deepEqual(
        args[0].id,
        sessionTokenId,
        'argument was session token'
      );
      assert.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct');
      assert.equal(
        mockMetricsContext.stash.thisValues[0],
        mockRequest,
        'this was request'
      );

      args = mockMetricsContext.stash.args[1];
      assert.equal(
        args.length,
        1,
        'metricsContext.stash was passed one argument second time'
      );
      assert.ok(
        /^[0-9a-f]{32}$/.test(args[0].id),
        'argument was synthesized token verification id'
      );
      assert.deepEqual(args[0].uid, uid, 'tokenVerificationId uid was correct');
      assert.equal(
        mockMetricsContext.stash.thisValues[1],
        mockRequest,
        'this was request'
      );

      args = mockMetricsContext.stash.args[2];
      assert.equal(
        args.length,
        1,
        'metricsContext.stash was passed one argument third time'
      );
      assert.deepEqual(
        args[0].id,
        keyFetchTokenId,
        'argument was key fetch token'
      );
      assert.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct');
      assert.equal(
        mockMetricsContext.stash.thisValues[1],
        mockRequest,
        'this was request'
      );

      assert.equal(
        mockMetricsContext.setFlowCompleteSignal.callCount,
        1,
        'metricsContext.setFlowCompleteSignal was called once'
      );
      args = mockMetricsContext.setFlowCompleteSignal.args[0];
      assert.equal(
        args.length,
        2,
        'metricsContext.setFlowCompleteSignal was passed two arguments'
      );
      assert.equal(args[0], 'account.signed', 'argument was event name');
      assert.equal(args[1], 'login', 'second argument was flow type');

      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      args = mockMailer.sendVerifyLoginEmail.args[0];
      assert.equal(args[2].acceptLanguage, 'en-US')
      assert.equal(args[2].location.city, 'Mountain View');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].timeZone, 'America/Los_Angeles');
      assert.equal(args[2].uaBrowser, 'Firefox');
      assert.equal(args[2].uaBrowserVersion, '50');
      assert.equal(args[2].uaOS, 'Android');
      assert.equal(args[2].uaOSVersion, '6');
      assert.equal(args[2].uaDeviceType, 'mobile');
      assert.equal(
        args[2].deviceId,
        mockRequest.payload.metricsContext.deviceId
      );
      assert.equal(args[2].flowId, mockRequest.payload.metricsContext.flowId);
      assert.equal(
        args[2].flowBeginTime,
        mockRequest.payload.metricsContext.flowBeginTime
      );
      assert.equal(args[2].service, 'sync');
      assert.equal(args[2].uid, uid);

      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.ok(
        !response.verified,
        'response indicates account is not verified'
      );
      assert.equal(
        response.verificationMethod,
        'email',
        'verificationMethod is email'
      );
      assert.equal(
        response.verificationReason,
        'login',
        'verificationReason is login'
      );
    }).finally(() => Date.now.restore());
  });

  describe('sign-in unverified account', () => {
    it('sends email code', () => {
      const emailCode = hexString(16);
      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: TEST_EMAIL,
          emailVerified: false,
          emailCode: emailCode,
          primaryEmail: {
            normalizedEmail: normalizeEmail(TEST_EMAIL),
            email: TEST_EMAIL,
            isVerified: false,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
        });
      };

      return runTest(route, mockRequest, (response) => {
        assert.equal(
          mockMailer.sendVerifyEmail.callCount,
          1,
          'mailer.sendVerifyEmail was called'
        );

        // Verify that the email code was sent
        const verifyCallArgs = mockMailer.sendVerifyEmail.getCall(0).args;
        assert.notEqual(
          verifyCallArgs[1],
          emailCode,
          'mailer.sendVerifyEmail was called with a fresh verification code'
        );
        assert.equal(
          mockLog.flowEvent.callCount,
          2,
          'log.flowEvent was called twice'
        );
        assert.equal(
          mockLog.flowEvent.args[0][0].event,
          'account.login',
          'first event was login'
        );
        assert.equal(
          mockLog.flowEvent.args[1][0].event,
          'email.verification.sent',
          'second event was sent'
        );
        assert.equal(
          mockMailer.sendVerifyLoginEmail.callCount,
          0,
          'mailer.sendVerifyLoginEmail was not called'
        );
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(
          response.verified,
          false,
          'response indicates account is unverified'
        );
        assert.equal(
          response.verificationMethod,
          'email',
          'verificationMethod is email'
        );
        assert.equal(
          response.verificationReason,
          'signup',
          'verificationReason is signup'
        );
      });
    });
  });

  describe('sign-in confirmation', () => {
    before(() => {
      config.signinConfirmation.forcedEmailAddresses = /.+@mozilla\.com$/;

      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: TEST_EMAIL,
          emailVerified: true,
          primaryEmail: {
            normalizedEmail: normalizeEmail(TEST_EMAIL),
            email: TEST_EMAIL,
            isVerified: true,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
        });
      };
    });

    it('is enabled by default', () => {
      return runTest(route, mockRequest, (response) => {
        assert.equal(
          mockDB.createSessionToken.callCount,
          1,
          'db.createSessionToken was called'
        );
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        assert.ok(
          tokenData.mustVerify,
          'sessionToken must be verified before use'
        );
        assert.ok(
          tokenData.tokenVerificationId,
          'sessionToken was created unverified'
        );
        assert.equal(
          mockMailer.sendVerifyEmail.callCount,
          0,
          'mailer.sendVerifyEmail was not called'
        );
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.ok(
          !response.verified,
          'response indicates account is not verified'
        );
        assert.equal(
          response.verificationMethod,
          'email',
          'verificationMethod is email'
        );
        assert.equal(
          response.verificationReason,
          'login',
          'verificationReason is login'
        );

        assert.equal(
          mockMailer.sendVerifyLoginEmail.callCount,
          1,
          'mailer.sendVerifyLoginEmail was called'
        );
        assert.equal(
          mockMailer.sendVerifyLoginEmail.getCall(0).args[2].acceptLanguage,
          'en-US'
        );
        assert.equal(
          mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city,
          'Mountain View'
        );
        assert.equal(
          mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country,
          'United States'
        );
        assert.equal(
          mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone,
          'America/Los_Angeles'
        );
      });
    });

    it('requires verification when the request is suspicious, even with no keys', () => {
      const email = TEST_EMAIL;
      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: email,
          emailVerified: true,
          primaryEmail: {
            normalizedEmail: normalizeEmail(email),
            email: email,
            isVerified: true,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
        });
      };

      return runTest(route, mockRequestSuspect, (response) => {
        assert.equal(
          mockDB.createSessionToken.callCount,
          1,
          'db.createSessionToken was called'
        );
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified');
        assert.ok(
          tokenData.tokenVerificationId,
          'sessionToken was created unverified'
        );
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(
          mockMailer.sendVerifyLoginEmail.callCount,
          1,
          'mailer.sendVerifyLoginEmail was called'
        );

        assert.equal(
          mockMetricsContext.setFlowCompleteSignal.callCount,
          1,
          'metricsContext.setFlowCompleteSignal was called once'
        );
        assert.deepEqual(
          mockMetricsContext.setFlowCompleteSignal.args[0][0],
          'account.confirmed',
          'argument was event name'
        );

        assert.ok(
          !response.verified,
          'response indicates session is not verified'
        );
        assert.equal(
          response.verificationMethod,
          'email',
          'verificationMethod is email'
        );
        assert.equal(
          response.verificationReason,
          'login',
          'verificationReason is login'
        );
      });
    });

    it('does not require verification when keys are not requested', () => {
      const email = 'test@mozilla.com';
      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: 'test@mozilla.com',
          emailVerified: true,
          primaryEmail: {
            normalizedEmail: normalizeEmail(email),
            email: email,
            isVerified: true,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
        });
      };

      return runTest(route, mockRequestNoKeys, (response) => {
        assert.equal(
          mockDB.createSessionToken.callCount,
          1,
          'db.createSessionToken was called'
        );
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        assert.ok(
          !tokenData.mustVerify,
          'sessionToken does not have to be verified'
        );
        assert.ok(
          tokenData.tokenVerificationId,
          'sessionToken was created unverified'
        );
        // Note that *neither* email is sent in this case,
        // since it can't have been a new device connection.
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(
          mockMailer.sendVerifyLoginEmail.callCount,
          0,
          'mailer.sendVerifyLoginEmail was not called'
        );

        assert.equal(
          mockMetricsContext.setFlowCompleteSignal.callCount,
          1,
          'metricsContext.setFlowCompleteSignal was called once'
        );
        assert.deepEqual(
          mockMetricsContext.setFlowCompleteSignal.args[0][0],
          'account.login',
          'argument was event name'
        );

        assert.ok(response.verified, 'response indicates account is verified');
        assert.ok(
          !response.verificationMethod,
          "verificationMethod doesn't exist"
        );
        assert.ok(
          !response.verificationReason,
          "verificationReason doesn't exist"
        );
      });
    });

    it('requires change password verification when the lockedAt field is set', () => {
      const email = 'test@mozilla.com';
      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: email,
          emailVerified: true,
          primaryEmail: {
            normalizedEmail: normalizeEmail(email),
            email: email,
            emailCode: 'ab12cd34',
            isVerified: true,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
          lockedAt: Date.now(),
        });
      };

      return runTest(route, mockRequestNoKeys, (response) => {
        assert.equal(
          mockDB.createSessionToken.callCount,
          1,
          'db.createSessionToken was called'
        );
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified');
        assert.ok(
          tokenData.tokenVerificationId,
          'sessionToken was created unverified'
        );
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(
          mockMailer.sendVerifyLoginCodeEmail.callCount,
          1,
          'mailer.sendVerifyLoginEmail was called'
        );

        assert.equal(
          mockMetricsContext.setFlowCompleteSignal.callCount,
          1,
          'metricsContext.setFlowCompleteSignal was called once'
        );
        assert.deepEqual(
          mockMetricsContext.setFlowCompleteSignal.args[0][0],
          'account.confirmed',
          'argument was event name'
        );

        assert.ok(
          !response.verified,
          'response indicates session is not verified'
        );
        assert.equal(
          response.verificationMethod,
          'email-otp',
          'verificationMethod is email-otp'
        );
        assert.equal(
          response.verificationReason,
          'change_password',
          'verificationReason is change_password'
        );
      });
    });

    it('requires verification when config.forcePasswordChange.forcedEmailAddresses match', () => {
      config.forcePasswordChange = {
        forcedEmailAddresses: /.+@forcepwdchange\.com$/,
      };
      const email = 'u5osi@forcepwdchange.com';
      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: email,
          emailVerified: true,
          primaryEmail: {
            normalizedEmail: normalizeEmail(email),
            email: email,
            emailCode: 'ab12cd34',
            isVerified: true,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
          lockedAt: Date.now(),
        });
      };
      mockRequestNoKeys.payload.email = email;

      return runTest(route, mockRequestNoKeys, (response) => {
        assert.ok(
          !response.verified,
          'response indicates session is not verified'
        );
        assert.equal(
          response.verificationMethod,
          'email-otp',
          'verificationMethod is email-otp'
        );
        assert.equal(
          response.verificationReason,
          'change_password',
          'verificationReason is change_password'
        );
      });
    });

    it('unverified account gets account confirmation email', () => {
      const email = 'test@mozilla.com';
      mockRequest.payload.email = email;
      mockDB.accountRecord = function () {
        return Promise.resolve({
          authSalt: hexString(32),
          data: hexString(32),
          email: mockRequest.payload.email,
          emailVerified: false,
          primaryEmail: {
            normalizedEmail: normalizeEmail(email),
            email: email,
            isVerified: false,
            isPrimary: true,
          },
          kA: hexString(32),
          lastAuthAt: function () {
            return Date.now();
          },
          uid: uid,
          wrapWrapKb: hexString(32),
        });
      };

      return runTest(route, mockRequest, (response) => {
        assert.equal(
          mockDB.createSessionToken.callCount,
          1,
          'db.createSessionToken was called'
        );
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        assert.ok(
          tokenData.mustVerify,
          'sessionToken must be verified before use'
        );
        assert.ok(
          tokenData.tokenVerificationId,
          'sessionToken was created unverified'
        );
        assert.equal(
          mockMailer.sendVerifyEmail.callCount,
          1,
          'mailer.sendVerifyEmail was called'
        );
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(
          mockMailer.sendVerifyLoginEmail.callCount,
          0,
          'mailer.sendVerifyLoginEmail was not called'
        );
        assert.ok(
          !response.verified,
          'response indicates account is not verified'
        );
        assert.equal(
          response.verificationMethod,
          'email',
          'verificationMethod is email'
        );
        assert.equal(
          response.verificationReason,
          'signup',
          'verificationReason is signup'
        );
      });
    });

    it('should return an error if email fails to send', () => {
      mockMailer.sendVerifyLoginEmail = sinon.spy(() => Promise.reject());

      return runTest(route, mockRequest).then(assert.fail, (err) => {
        assert.equal(err.message, 'Failed to send email');
        assert.equal(err.output.payload.code, 500);
        assert.equal(err.output.payload.errno, 151);
        assert.equal(err.output.payload.error, 'Internal Server Error');
      });
    });

    describe('skip for new accounts', () => {
      function setup(enabled, accountCreatedSince) {
        config.signinConfirmation.skipForNewAccounts = {
          enabled: enabled,
          maxAge: 5,
        };

        const email = mockRequest.payload.email;

        mockDB.accountRecord = function () {
          return Promise.resolve({
            authSalt: hexString(32),
            createdAt: Date.now() - accountCreatedSince,
            data: hexString(32),
            email: email,
            emailVerified: true,
            primaryEmail: {
              normalizedEmail: normalizeEmail(email),
              email: email,
              isVerified: true,
              isPrimary: true,
            },
            kA: hexString(32),
            lastAuthAt: function () {
              return Date.now();
            },
            uid: uid,
            wrapWrapKb: hexString(32),
          });
        };

        const accountRoutes = makeRoutes({
          checkPassword: function () {
            return Promise.resolve(true);
          },
          config: config,
          customs: mockCustoms,
          db: mockDB,
          log: mockLog,
          mailer: mockMailer,
          push: mockPush,
          cadReminders: mockCadReminders,
        });

        route = getRoute(accountRoutes, '/account/login');
      }

      it('is disabled', () => {
        setup(false);

        return runTest(route, mockRequest, (response) => {
          assert.equal(
            mockDB.createSessionToken.callCount,
            1,
            'db.createSessionToken was called'
          );
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          assert.ok(
            tokenData.mustVerify,
            'sessionToken must be verified before use'
          );
          assert.ok(
            tokenData.tokenVerificationId,
            'sessionToken was created unverified'
          );
          assert.equal(
            mockMailer.sendVerifyEmail.callCount,
            0,
            'mailer.sendVerifyEmail was not called'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
          assert.ok(
            !response.verified,
            'response indicates account is not verified'
          );
          assert.equal(
            response.verificationMethod,
            'email',
            'verificationMethod is email'
          );
          assert.equal(
            response.verificationReason,
            'login',
            'verificationReason is login'
          );

          assert.equal(
            mockMailer.sendVerifyLoginEmail.callCount,
            1,
            'mailer.sendVerifyLoginEmail was called'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.getCall(0).args[2].acceptLanguage,
            'en-US'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city,
            'Mountain View'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country,
            'United States'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone,
            'America/Los_Angeles'
          );
        });
      });

      it('skip sign-in confirmation on recently created account', () => {
        setup(true, 0);

        return runTest(route, mockRequest, (response) => {
          assert.equal(
            mockDB.createSessionToken.callCount,
            1,
            'db.createSessionToken was called'
          );
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          assert.equal(
            tokenData.tokenVerificationId,
            null,
            'sessionToken was created verified'
          );
          assert.equal(
            mockMailer.sendVerifyEmail.callCount,
            0,
            'mailer.sendVerifyEmail was not called'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 1);
          assert.ok(
            response.verified,
            'response indicates account is verified'
          );

          assert.equal(mockCadReminders.delete.callCount, 1);
        });
      });

      it('do not error if new device login notification is blocked', () => {
        setup(true, 0);

        mockMailer.sendNewDeviceLoginEmail = sinon.spy(() =>
          Promise.reject(error.emailBouncedHard())
        );

        return runTest(route, mockRequest, (response) => {
          assert.equal(
            mockDB.createSessionToken.callCount,
            1,
            'db.createSessionToken was called'
          );
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          assert.equal(
            tokenData.tokenVerificationId,
            null,
            'sessionToken was created verified'
          );
          assert.equal(
            mockMailer.sendVerifyEmail.callCount,
            0,
            'mailer.sendVerifyEmail was not called'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 1);
          assert.equal(
            mockMailer.sendNewDeviceLoginEmail.args[0][2].deviceId,
            mockRequest.payload.metricsContext.deviceId
          );
          assert.equal(
            mockMailer.sendNewDeviceLoginEmail.args[0][2].flowId,
            mockRequest.payload.metricsContext.flowId
          );
          assert.equal(
            mockMailer.sendNewDeviceLoginEmail.args[0][2].flowBeginTime,
            mockRequest.payload.metricsContext.flowBeginTime
          );
          assert.equal(
            mockMailer.sendNewDeviceLoginEmail.args[0][2].service,
            'sync'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.args[0][2].uid, uid);
          assert.ok(
            response.verified,
            'response indicates account is verified'
          );
        });
      });

      it("don't skip sign-in confirmation on older account", () => {
        setup(true, 10);

        return runTest(route, mockRequest, (response) => {
          assert.equal(
            mockDB.createSessionToken.callCount,
            1,
            'db.createSessionToken was called'
          );
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          assert.ok(
            tokenData.tokenVerificationId,
            'sessionToken was created unverified'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.callCount,
            1,
            'mailer.sendVerifyLoginEmail was called'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
          assert.ok(
            !response.verified,
            'response indicates account is unverified'
          );
        });
      });
    });

    describe('skip for emails', () => {
      function setup(email) {
        config.securityHistory.ipProfiling.allowedRecency = 0;
        config.signinConfirmation.skipForNewAccounts = { enabled: false };
        config.signinConfirmation.skipForEmailAddresses = [
          'skip@confirmation.com',
          'other@email.com',
        ];

        mockRequest.payload.email = email;

        mockDB.accountRecord = () => {
          return Promise.resolve({
            authSalt: hexString(32),
            data: hexString(32),
            email,
            emailVerified: true,
            primaryEmail: {
              normalizedEmail: normalizeEmail(email),
              email,
              isVerified: true,
              isPrimary: true,
            },
            kA: hexString(32),
            lastAuthAt: () => Date.now(),
            uid,
            wrapWrapKb: hexString(32),
          });
        };

        const accountRoutes = makeRoutes({
          checkPassword: () => Promise.resolve(true),
          config,
          customs: mockCustoms,
          db: mockDB,
          log: mockLog,
          mailer: mockMailer,
          push: mockPush,
        });

        route = getRoute(accountRoutes, '/account/login');
      }

      it('should not skip sign-in confirmation for specified email', () => {
        setup('not@skip.com');

        return runTest(route, mockRequest, (response) => {
          assert.equal(
            mockDB.createSessionToken.callCount,
            1,
            'db.createSessionToken was called'
          );
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          assert.ok(
            tokenData.tokenVerificationId,
            'sessionToken was created unverified'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.callCount,
            1,
            'mailer.sendVerifyLoginEmail was called'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
          assert.ok(
            !response.verified,
            'response indicates account is unverified'
          );
        });
      });

      it('should skip sign-in confirmation for specified email', () => {
        setup('skip@confirmation.com');

        return runTest(route, mockRequest, (response) => {
          assert.equal(
            mockDB.createSessionToken.callCount,
            1,
            'db.createSessionToken was called'
          );
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          assert.ok(
            !tokenData.tokenVerificationId,
            'sessionToken was created verified'
          );
          assert.equal(
            mockMailer.sendVerifyLoginEmail.callCount,
            0,
            'mailer.sendVerifyLoginEmail was not called'
          );
          assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 1);
          assert.ok(
            response.verified,
            'response indicates account is verified'
          );
        });
      });
    });
  });

  it('creating too many sessions causes an error to be logged', () => {
    const oldSessions = mockDB.sessions;
    mockDB.sessions = sinon.spy(() => {
      return Promise.resolve(new Array(200));
    });
    mockLog.error = sinon.spy();
    mockRequest.app.clientAddress = '63.245.221.32';
    return runTest(route, mockRequest, () => {
      assert.equal(mockLog.error.callCount, 0, 'log.error was not called');
    }).then(() => {
      mockDB.sessions = sinon.spy(() => {
        return Promise.resolve(new Array(201));
      });
      mockLog.error.resetHistory();
      return runTest(route, mockRequest, () => {
        assert.equal(mockLog.error.callCount, 1, 'log.error was called');
        assert.equal(mockLog.error.firstCall.args[0], 'Account.login');
        assert.equal(mockLog.error.firstCall.args[1].numSessions, 201);
        mockDB.sessions = oldSessions;
      });
    });
  });

  describe('checks security history', () => {
    let record;
    const clientAddress = mockRequest.app.clientAddress;
    beforeEach(() => {
      mockLog.info = sinon.spy((op, arg) => {
        if (op.indexOf('Account.history') === 0) {
          record = arg;
        }
      });
    });

    it('with a seen ip address', () => {
      record = undefined;
      let securityQuery;
      mockDB.securityEvents = sinon.spy((arg) => {
        securityQuery = arg;
        return Promise.resolve([
          {
            name: 'account.login',
            createdAt: Date.now(),
            verified: true,
          },
        ]);
      });
      return runTest(route, mockRequest, (response) => {
        assert.equal(
          mockDB.securityEvents.callCount,
          1,
          'db.securityEvents was called'
        );
        assert.equal(securityQuery.uid, uid);
        assert.equal(securityQuery.ipAddr, clientAddress);

        assert.equal(!!record, true, 'log.info was called for Account.history');
        assert.equal(mockLog.info.args[0][0], 'Account.history.verified');
        assert.equal(record.uid, uid);
        assert.equal(record.events, 1);
        assert.equal(record.recency, 'day');
      });
    });

    it('with a seen, unverified ip address', () => {
      record = undefined;
      let securityQuery;
      mockDB.securityEvents = sinon.spy((arg) => {
        securityQuery = arg;
        return Promise.resolve([
          {
            name: 'account.login',
            createdAt: Date.now(),
            verified: false,
          },
        ]);
      });
      return runTest(route, mockRequest, (response) => {
        assert.equal(
          mockDB.securityEvents.callCount,
          1,
          'db.securityEvents was called'
        );
        assert.equal(securityQuery.uid, uid);
        assert.equal(securityQuery.ipAddr, clientAddress);

        assert.equal(!!record, true, 'log.info was called for Account.history');
        assert.equal(mockLog.info.args[0][0], 'Account.history.unverified');
        assert.equal(record.uid, uid);
        assert.equal(record.events, 1);
      });
    });

    it('with a new ip address', () => {
      record = undefined;

      let securityQuery;
      mockDB.securityEvents = sinon.spy((arg) => {
        securityQuery = arg;
        return Promise.resolve([]);
      });
      return runTest(route, mockRequest, (response) => {
        assert.equal(
          mockDB.securityEvents.callCount,
          1,
          'db.securityEvents was called'
        );
        assert.equal(securityQuery.uid, uid);
        assert.equal(securityQuery.ipAddr, clientAddress);

        assert.equal(
          record,
          undefined,
          'log.info was not called for Account.history.verified'
        );
      });
    });
  });

  it('records security event', () => {
    const clientAddress = mockRequest.app.clientAddress;
    let securityQuery;
    mockDB.securityEvent = sinon.spy((arg) => {
      securityQuery = arg;
      return Promise.resolve();
    });
    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockDB.securityEvent.callCount,
        1,
        'db.securityEvent was called'
      );
      assert.equal(securityQuery.uid, uid);
      assert.equal(securityQuery.ipAddr, clientAddress);
      assert.equal(securityQuery.name, 'account.login');
    });
  });

  describe('blocked by customs', () => {
    describe('can unblock', () => {
      const oldCheck = mockCustoms.check;

      before(() => {
        mockCustoms.check = () => Promise.reject(error.requestBlocked(true));
      });

      beforeEach(() => {
        mockLog.activityEvent.resetHistory();
        mockLog.flowEvent.resetHistory();
      });

      after(() => {
        mockCustoms.check = oldCheck;
      });

      describe('signin unblock enabled', () => {
        before(() => {
          mockLog.flowEvent.resetHistory();
        });

        it('without unblock code', () => {
          return runTest(route, mockRequest).then(
            () => assert.ok(false),
            (err) => {
              assert.equal(
                err.errno,
                error.ERRNO.REQUEST_BLOCKED,
                'correct errno is returned'
              );
              assert.equal(
                err.output.statusCode,
                400,
                'correct status code is returned'
              );
              assert.equal(
                err.output.payload.verificationMethod,
                'email-captcha'
              );
              assert.equal(err.output.payload.verificationReason, 'login');
              assert.equal(
                mockLog.flowEvent.callCount,
                1,
                'log.flowEvent called once'
              );
              assert.equal(
                mockLog.flowEvent.args[0][0].event,
                'account.login.blocked',
                'first event is blocked'
              );
              mockLog.flowEvent.resetHistory();
            }
          );
        });

        describe('with unblock code', () => {
          it('invalid code', () => {
            mockDB.consumeUnblockCode = () =>
              Promise.reject(error.invalidUnblockCode());
            return runTest(route, mockRequestWithUnblockCode).then(
              () => assert.ok(false),
              (err) => {
                assert.equal(
                  err.errno,
                  error.ERRNO.INVALID_UNBLOCK_CODE,
                  'correct errno is returned'
                );
                assert.equal(
                  err.output.statusCode,
                  400,
                  'correct status code is returned'
                );
                assert.equal(
                  mockLog.flowEvent.callCount,
                  2,
                  'log.flowEvent called twice'
                );
                assert.equal(
                  mockLog.flowEvent.args[1][0].event,
                  'account.login.invalidUnblockCode',
                  'second event is invalid'
                );

                mockLog.flowEvent.resetHistory();
              }
            );
          });

          it('expired code', () => {
            // test 5 seconds old, to reduce flakiness of test
            mockDB.consumeUnblockCode = () =>
              Promise.resolve({
                createdAt:
                  Date.now() - (config.signinUnblock.codeLifetime + 5000),
              });
            return runTest(route, mockRequestWithUnblockCode).then(
              () => assert.ok(false),
              (err) => {
                assert.equal(
                  err.errno,
                  error.ERRNO.INVALID_UNBLOCK_CODE,
                  'correct errno is returned'
                );
                assert.equal(
                  err.output.statusCode,
                  400,
                  'correct status code is returned'
                );

                assert.equal(
                  mockLog.flowEvent.callCount,
                  2,
                  'log.flowEvent called twice'
                );
                assert.equal(
                  mockLog.flowEvent.args[1][0].event,
                  'account.login.invalidUnblockCode',
                  'second event is invalid'
                );

                mockLog.activityEvent.resetHistory();
                mockLog.flowEvent.resetHistory();
              }
            );
          });

          it('unknown account', () => {
            mockDB.accountRecord = () =>
              Promise.reject(new error.unknownAccount());
            mockDB.emailRecord = () =>
              Promise.reject(new error.unknownAccount());
            return runTest(route, mockRequestWithUnblockCode).then(
              () => assert(false),
              (err) => {
                assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED);
                assert.equal(err.output.statusCode, 400);
              }
            );
          });

          it('valid code', () => {
            mockDB.consumeUnblockCode = () =>
              Promise.resolve({ createdAt: Date.now() });
            return runTest(route, mockRequestWithUnblockCode, (res) => {
              assert.equal(mockLog.flowEvent.callCount, 4);
              assert.equal(
                mockLog.flowEvent.args[0][0].event,
                'account.login.blocked',
                'first event was account.login.blocked'
              );
              assert.equal(
                mockLog.flowEvent.args[1][0].event,
                'account.login.confirmedUnblockCode',
                'second event was account.login.confirmedUnblockCode'
              );
              assert.equal(
                mockLog.flowEvent.args[2][0].event,
                'account.login',
                'third event was account.login'
              );
              assert.equal(
                mockLog.flowEvent.args[3][0].event,
                'flow.complete',
                'fourth event was flow.complete'
              );
            });
          });
        });
      });
    });

    describe('cannot unblock', () => {
      const oldCheck = mockCustoms.check;
      before(() => {
        mockCustoms.check = () => Promise.reject(error.requestBlocked(false));
      });

      after(() => {
        mockCustoms.check = oldCheck;
      });

      it('without an unblock code', () => {
        return runTest(route, mockRequest).then(
          () => assert.ok(false),
          (err) => {
            assert.equal(
              err.errno,
              error.ERRNO.REQUEST_BLOCKED,
              'correct errno is returned'
            );
            assert.equal(
              err.output.statusCode,
              400,
              'correct status code is returned'
            );
            assert.equal(
              err.output.payload.verificationMethod,
              undefined,
              'no verificationMethod'
            );
            assert.equal(
              err.output.payload.verificationReason,
              undefined,
              'no verificationReason'
            );
          }
        );
      });

      it('with unblock code', () => {
        return runTest(route, mockRequestWithUnblockCode).then(
          () => assert.ok(false),
          (err) => {
            assert.equal(
              err.errno,
              error.ERRNO.REQUEST_BLOCKED,
              'correct errno is returned'
            );
            assert.equal(
              err.output.statusCode,
              400,
              'correct status code is returned'
            );
            assert.equal(
              err.output.payload.verificationMethod,
              undefined,
              'no verificationMethod'
            );
            assert.equal(
              err.output.payload.verificationReason,
              undefined,
              'no verificationReason'
            );
          }
        );
      });
    });
  });

  it('fails login with non primary email', () => {
    const email = 'foo@mail.com';
    mockDB.accountRecord = sinon.spy(() => {
      return Promise.resolve({
        primaryEmail: {
          normalizedEmail: normalizeEmail(email),
          email: email,
          isVerified: true,
          isPrimary: false,
        },
      });
    });
    return runTest(route, mockRequest).then(
      () => assert.ok(false),
      (err) => {
        assert.equal(
          mockDB.accountRecord.callCount,
          1,
          'db.accountRecord was called'
        );
        assert.equal(err.errno, 142, 'correct errno called');
      }
    );
  });

  it('fails login when requesting TOTP verificationMethod and TOTP not setup', () => {
    mockDB.totpToken = sinon.spy(() => {
      return Promise.resolve({
        verified: true,
        enabled: false,
      });
    });
    mockRequest.payload.verificationMethod = 'totp-2fa';
    return runTest(route, mockRequest).then(
      () => assert.ok(false),
      (err) => {
        assert.equal(mockDB.totpToken.callCount, 1, 'db.totpToken was called');
        assert.equal(err.errno, 160, 'correct errno called');
      }
    );
  });

  it('can refuse new account logins for selected OAuth clients', async () => {
    const route = getRoute(
      makeRoutes({
        config: {
          oauth: {
            disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
          },
        },
      }),
      '/account/login'
    );

    const mockRequest = mocks.mockRequest({
      payload: {
        service: 'd15ab1edd15ab1ed',
      },
    });

    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.output.statusCode, 503);
      assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
    }
  });
});

describe('/account/keys', () => {
  const keyFetchTokenId = hexString(16);
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const mockLog = mocks.mockLog();
  const mockRequest = mocks.mockRequest({
    credentials: {
      emailVerified: true,
      id: keyFetchTokenId,
      keyBundle: hexString(16),
      tokenVerificationId: undefined,
      tokenVerified: true,
      uid: uid,
    },
    log: mockLog,
  });
  const mockDB = mocks.mockDB();
  const accountRoutes = makeRoutes({
    db: mockDB,
    log: mockLog,
  });
  const route = getRoute(accountRoutes, '/account/keys');

  it('verified token', () => {
    return runTest(route, mockRequest, (response) => {
      assert.deepEqual(
        response,
        { bundle: mockRequest.auth.credentials.keyBundle },
        'response was correct'
      );

      assert.equal(
        mockDB.deleteKeyFetchToken.callCount,
        1,
        'db.deleteKeyFetchToken was called once'
      );
      let args = mockDB.deleteKeyFetchToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.deleteKeyFetchToken was passed one argument'
      );
      assert.equal(
        args[0],
        mockRequest.auth.credentials,
        'db.deleteKeyFetchToken was passed key fetch token'
      );

      assert.equal(
        mockLog.activityEvent.callCount,
        1,
        'log.activityEvent was called once'
      );
      args = mockLog.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.deepEqual(
        args[0],
        {
          country: 'United States',
          event: 'account.keyfetch',
          region: 'California',
          service: undefined,
          userAgent: 'test user-agent',
          uid: uid,
        },
        'event data was correct'
      );
    }).then(() => {
      mockLog.activityEvent.resetHistory();
      mockDB.deleteKeyFetchToken.resetHistory();
    });
  });

  it('unverified token', () => {
    mockRequest.auth.credentials.tokenVerificationId = hexString(16);
    mockRequest.auth.credentials.tokenVerified = false;
    return runTest(route, mockRequest)
      .then(
        () => assert.ok(false),
        (response) => {
          assert.equal(
            response.errno,
            104,
            'correct errno for unverified account'
          );
          assert.equal(
            response.message,
            'Unverified account',
            'correct error message'
          );
        }
      )
      .then(() => {
        mockLog.activityEvent.resetHistory();
      });
  });
});

describe('/account/destroy', () => {
  const email = 'foo@example.com';
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const expectedSubscriptions = [
    { uid, subscriptionId: '123' },
    { uid, subscriptionId: '456' },
    { uid, subscriptionId: '789' },
  ];

  let mockDB,
    mockLog,
    mockRequest,
    mockPush,
    mockStripeHelper,
    mockPaypalHelper,
    mockAuthModels;

  beforeEach(async () => {
    mockDB = {
      ...mocks.mockDB({ email: email, uid: uid }),
      fetchAccountSubscriptions: sinon.spy(
        async (uid) => expectedSubscriptions
      ),
    };
    mockLog = mocks.mockLog();
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: email,
        authPW: new Array(65).join('f'),
      },
    });
    mockPush = mocks.mockPush();
    mockStripeHelper = mocks.mockStripeHelper(['removeCustomer']);
    mockStripeHelper.removeCustomer = sinon.spy(async (uid, email) => {
      return;
    });
    mockPaypalHelper = mocks.mockPayPalHelper(['cancelBillingAgreement']);
    mockPaypalHelper.cancelBillingAgreement = sinon.spy(async (ba) => {
      return;
    });
    mockAuthModels = {};
    mockAuthModels.getAllPayPalBAByUid = sinon.spy(async (uid) => {
      return [{ status: 'Active', billingAgreementId: 'B-test' }];
    });
    mockAuthModels.deleteAllPayPalBAs = sinon.spy(async (uid) => {
      return;
    });
  });

  function buildRoute(subscriptionsEnabled = true) {
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PayPalHelper, mockPaypalHelper);
    const accountRoutes = makeRoutes(
      {
        checkPassword: function () {
          return Promise.resolve(true);
        },
        config: {
          subscriptions: {
            enabled: subscriptionsEnabled,
            paypalNvpSigCredentials: {
              enabled: true,
            },
          },
          domain: 'wibble',
        },
        db: mockDB,
        log: mockLog,
        push: mockPush,
        stripeHelper: mockStripeHelper,
      },
      { 'fxa-shared/db/models/auth': mockAuthModels }
    );
    return getRoute(accountRoutes, '/account/destroy');
  }

  it('should delete the account', () => {
    const route = buildRoute();

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);
      sinon.assert.calledWithMatch(mockDB.deleteAccount, {
        uid,
        email,
      });
      sinon.assert.callCount(mockStripeHelper.removeCustomer, 1);
      sinon.assert.calledWithMatch(mockStripeHelper.removeCustomer, uid);
      sinon.assert.calledWithMatch(mockPush.notifyAccountDestroyed, uid);
      sinon.assert.callCount(mockLog.notifyAttachedServices, 1);
      sinon.assert.calledOnceWithExactly(
        mockLog.notifyAttachedServices,
        'delete',
        mockRequest,
        { uid }
      );
      sinon.assert.calledOnceWithExactly(mockLog.activityEvent, {
        country: 'United States',
        event: 'account.deleted',
        region: 'California',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid,
      });
      sinon.assert.calledOnceWithExactly(
        mockAuthModels.getAllPayPalBAByUid,
        uid
      );
      sinon.assert.calledOnceWithExactly(
        mockPaypalHelper.cancelBillingAgreement,
        'B-test'
      );
      sinon.assert.calledOnceWithExactly(
        mockAuthModels.deleteAllPayPalBAs,
        uid
      );
    });
  });

  it('should fail if stripeHelper update customer fails', async () => {
    mockStripeHelper.removeCustomer(async (uid, email) => {
      throw new Error('wibble');
    });
    try {
      await runTest(buildRoute(), mockRequest);
      assert.fail('method should throw an error');
    } catch (err) {
      assert.isObject(err);
    }
  });

  it('should fail if paypalHelper cancel billing agreement fails', async () => {
    mockPaypalHelper.cancelBillingAgreement(async (uid, email) => {
      throw new Error('wibble');
    });
    try {
      await runTest(buildRoute(), mockRequest);
      assert.fail('method should throw an error');
    } catch (err) {
      assert.isObject(err);
    }
  });
});

describe('/account', () => {
  const email = 'foo@example.com';
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');

  let log,
    request,
    mockCustomer,
    mockWebSubscriptionsResponse,
    mockStripeHelper,
    mockPlaySubscriptions;

  function buildRoute(
    subscriptionsEnabled = true,
    playSubscriptionsEnabled = false
  ) {
    const accountRoutes = makeRoutes({
      config: {
        subscriptions: {
          enabled: subscriptionsEnabled,
          playApiServiceAccount: {
            enabled: playSubscriptionsEnabled,
          },
        },
      },
      log,
      stripeHelper: mockStripeHelper,
    });
    return getRoute(accountRoutes, '/account');
  }

  const webSubscription = {
    current_period_end: Date.now() + 60000,
    current_period_start: Date.now() - 60000,
    cancel_at_period_end: true,
    end_at: null,
    failure_code: 'expired_card',
    failure_message: 'The card is expired',
    latest_invoice: '628031D-0002',
    plan_id: 'blee',
    status: 'ok',
    subscription_id: 'mngh',
  };

  beforeEach(() => {
    log = mocks.mockLog();
    request = mocks.mockRequest({
      credentials: { uid, email },
      log,
    });
    mockCustomer = {
      id: 1234,
      subscriptions: ['fake'],
    };
    mockWebSubscriptionsResponse = [webSubscription];
    mockStripeHelper = mocks.mockStripeHelper([
      'fetchCustomer',
      'subscriptionsToResponse',
    ]);
    mockStripeHelper.fetchCustomer = sinon.spy(
      async (uid, email) => mockCustomer
    );
    mockStripeHelper.subscriptionsToResponse = sinon.spy(
      async (subscriptions) => mockWebSubscriptionsResponse
    );
    Container.set(CapabilityService, sinon.fake);
  });

  describe('web subscriptions', () => {
    beforeEach(() => {
      mockCustomer = {
        id: 1234,
        subscriptions: ['fake'],
      };
      mockWebSubscriptionsResponse = [webSubscription];
      mockStripeHelper = mocks.mockStripeHelper([
        'fetchCustomer',
        'subscriptionsToResponse',
      ]);
      mockStripeHelper.fetchCustomer = sinon.spy(
        async (uid, email) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions) => mockWebSubscriptionsResponse
      );
      Container.set(CapabilityService, sinon.fake);
    });

    it('should return formatted Stripe subscriptions when subscriptions are enabled', () => {
      return runTest(buildRoute(), request, (result) => {
        sinon.assert.calledOnceWithExactly(log.begin, 'Account.get', request);
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.fetchCustomer,
          uid,
          ['subscriptions']
        );
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.subscriptionsToResponse,
          mockCustomer.subscriptions
        );
        assert.deepEqual(result, {
          subscriptions: mockWebSubscriptionsResponse,
        });
      });
    });

    it('should swallow unknownCustomer errors from stripe.customer', () => {
      mockStripeHelper.fetchCustomer = sinon.spy(() => {
        throw error.unknownCustomer();
      });

      return runTest(buildRoute(), request, (result) => {
        assert.deepEqual(result, {
          subscriptions: [],
        });
        assert.equal(log.begin.callCount, 1);
        assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
        assert.equal(mockStripeHelper.subscriptionsToResponse.callCount, 0);
      });
    });

    it('should propagate other errors from stripe.customer', async () => {
      mockStripeHelper.fetchCustomer = sinon.spy(() => {
        throw error.unexpectedError();
      });

      let failed = false;
      try {
        await runTest(buildRoute(), request, () => {});
      } catch (err) {
        failed = true;
        assert.equal(err.errno, error.ERRNO.UNEXPECTED_ERROR);
      }

      assert.isTrue(failed);
    });

    it('should not return stripe.customer result when subscriptions are disabled', () => {
      return runTest(buildRoute(false), request, (result) => {
        assert.deepEqual(result, {
          subscriptions: [],
        });

        assert.equal(log.begin.callCount, 1);
        assert.equal(mockStripeHelper.fetchCustomer.callCount, 0);
      });
    });
  });

  describe('Google Play subscriptions', () => {
    const mockIapSubscription = {
      auto_renewing: true,
      expiry_time_millis: Date.now(),
      package_name: 'org.mozilla.cooking.with.foxkeh',
      sku: 'org.mozilla.foxkeh.yearly',
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
      product_id: 'iap_prod_lol',
      product_name: 'LOL daily',
    };

    let subscriptionsEnabled, playSubscriptionsEnabled;

    beforeEach(() => {
      subscriptionsEnabled = true;
      playSubscriptionsEnabled = true;
      mockCustomer = undefined;
      mockWebSubscriptionsResponse = [];
      mockStripeHelper = mocks.mockStripeHelper([
        'fetchCustomer',
        'subscriptionsToResponse',
      ]);
      mockStripeHelper.fetchCustomer = sinon.spy(
        async (uid, email) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions) => mockWebSubscriptionsResponse
      );
      Container.set(CapabilityService, sinon.fake);
      mockPlaySubscriptions = mocks.mockPlaySubscriptions(['getSubscriptions']);
      Container.set(PlaySubscriptions, mockPlaySubscriptions);
      mockPlaySubscriptions.getSubscriptions = sinon.spy(async (uid) => [
        mockIapSubscription,
      ]);
    });

    it('should return formatted Google Play subscriptions when Play subscriptions are enabled', () => {
      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockStripeHelper.subscriptionsToResponse.callCount, 0);
          sinon.assert.calledOnceWithExactly(
            mockPlaySubscriptions.getSubscriptions,
            uid
          );
          assert.deepEqual(result, {
            subscriptions: [mockIapSubscription],
          });
        }
      );
    });

    it('should return formatted Google Play and web subscriptions when Play subscriptions are enabled', () => {
      mockCustomer = {
        id: 1234,
        subscriptions: ['fake'],
      };
      mockWebSubscriptionsResponse = [webSubscription];
      mockStripeHelper.fetchCustomer = sinon.spy(
        async (uid, email) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions) => mockWebSubscriptionsResponse
      );

      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockPlaySubscriptions.getSubscriptions.callCount, 1);
          assert.deepEqual(result, {
            subscriptions: [
              ...[mockIapSubscription],
              ...mockWebSubscriptionsResponse,
            ],
          });
        }
      );
    });

    it('should return an empty list when subscriptions are enabled and no active Google Play or web subscriptions are found', () => {
      mockPlaySubscriptions.getSubscriptions = sinon.spy(async (uid) => []);

      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockPlaySubscriptions.getSubscriptions.callCount, 1);
          assert.deepEqual(result, {
            subscriptions: [],
          });
        }
      );
    });

    it('should not return any Play subscriptions when Play subscriptions are disabled', () => {
      playSubscriptionsEnabled = false;
      mockCustomer = {
        id: 1234,
        subscriptions: ['fake'],
      };
      mockWebSubscriptionsResponse = [webSubscription];
      mockStripeHelper.fetchCustomer = sinon.spy(
        async (uid, email) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions) => mockWebSubscriptionsResponse
      );

      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockPlaySubscriptions.getSubscriptions.callCount, 0);
          assert.deepEqual(result, {
            subscriptions: mockWebSubscriptionsResponse,
          });
        }
      );
    });
  });
});

describe('/account/ecosystemAnonId', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const ecosystemAnonId = 'bowl of oranges';
  const oldAnonId = 'old id';
  let mockLog, mockDB, mockRequest, route;

  function hashAnonId(anonId) {
    const hash = crypto.createHash('sha256');
    return hash.update(anonId).digest('hex');
  }

  beforeEach(async () => {
    mockLog = mocks.mockLog();
    mockLog.info = sinon.spy();

    mockDB = mocks.mockDB({
      uid: uid,
      ecosystemAnonId: oldAnonId,
    });

    mockRequest = mocks.mockRequest({
      log: mockLog,
      credentials: {
        scope: ['profile:ecosystem_anon_id:write'],
        user: uid,
      },
      payload: {
        ecosystemAnonId,
      },
    });

    Container.set(CapabilityService, sinon.fake);

    route = getRoute(
      makeRoutes({
        db: mockDB,
        log: mockLog,
      }),
      '/account/ecosystemAnonId'
    );
  });

  afterEach(() => {
    mockLog.info.resetHistory();
  });

  it('runs, informing the auth db of the new anon id', () => {
    mockRequest.headers['if-none-match'] = '*';
    mockDB.account = function (providedUid) {
      assert.equal(providedUid, uid);
      return Promise.resolve({
        ecosystemAnonId: null,
      });
    };

    return runTest(route, mockRequest, (result) => {
      const updateEcosystemAnonId = mockDB.updateEcosystemAnonId;
      assert.deepEqual(result, {});
      assert.equal(mockLog.begin.callCount, 1);
      assert.equal(updateEcosystemAnonId.callCount, 1);
      assert.equal(updateEcosystemAnonId.args[0][0], uid);
      assert.equal(updateEcosystemAnonId.args[0][1], ecosystemAnonId);
    });
  });

  it('throws anonIdNoCondition when neither if-none-match nor if-match are present', async () => {
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: 'heheheheheh',
      });
    };

    let failed = false;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      failed = true;
      assert.equal(err.errno, error.ERRNO.ECOSYSTEM_ANON_ID_NO_CONDITION);
    }

    assert.isTrue(failed);
  });

  it('throws invalidScopes when valid scope is not present', async () => {
    mockRequest.auth.credentials.scope = [];

    let failed = false;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      failed = true;
      assert.equal(err.errno, error.ERRNO.INVALID_SCOPES);
    }

    assert.isTrue(failed);
  });

  it('throws: if-none-match: *, anon id exists', async () => {
    mockRequest.headers['if-none-match'] = '*';
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: 'such a simple fool',
      });
    };

    let failed = false;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      failed = true;
      assert.equal(err.errno, error.ERRNO.ECOSYSTEM_ANON_ID_UPDATE_CONFLICT);
    }

    assert.isTrue(failed);
  });

  it('doesnt throw: if-none-match: *, anon id doesnt exist', async () => {
    mockRequest.headers['if-none-match'] = '*';
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: null,
      });
    };

    let success = true;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      success = false;
    }

    assert.isTrue(success);
  });

  it('throws: if-none-match: y (hashed), anon id is y', async () => {
    mockRequest.headers['if-none-match'] = hashAnonId('y');
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: 'y',
      });
    };

    let failed = false;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      failed = true;
      assert.equal(err.errno, error.ERRNO.ECOSYSTEM_ANON_ID_UPDATE_CONFLICT);
    }

    assert.isTrue(failed);
  });

  it('doesnt throw: if-none-match: x (hashed), anon id is z', async () => {
    mockRequest.headers['if-none-match'] = hashAnonId('x');
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: 'z',
      });
    };

    let success = true;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      success = false;
    }

    assert.isTrue(success);
  });

  it('throws: if-match: x (hashed), anon id is z', async () => {
    mockRequest.headers['if-match'] = hashAnonId('x');
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: 'z',
      });
    };

    let failed = false;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      failed = true;
      assert.equal(err.errno, error.ERRNO.ECOSYSTEM_ANON_ID_UPDATE_CONFLICT);
    }

    assert.isTrue(failed);
  });

  it('doesnt throw: if-match: x (hashed), anon id is x', async () => {
    mockRequest.headers['if-match'] = hashAnonId('x');
    mockDB.account = function () {
      return Promise.resolve({
        ecosystemAnonId: 'x',
      });
    };

    let success = true;
    try {
      await runTest(route, mockRequest, () => {});
    } catch (err) {
      success = false;
    }

    assert.isTrue(success);
  });

  it('logs old and new anon_ids on successful update', async () => {
    mockRequest.headers['if-match'] = hashAnonId(oldAnonId);
    mockDB.account = sinon.spy(() => {
      return Promise.resolve({
        ecosystemAnonId: oldAnonId,
      });
    });
    await runTest(route, mockRequest, () => {
      assert.equal(mockLog.info.callCount, 1);
      assert.equal(
        mockLog.info.args[0][0],
        'account.updateEcosystemAnonId.complete'
      );
      assert.equal(mockLog.info.args[0][1].previous, oldAnonId);
      assert.equal(mockLog.info.args[0][1].next, ecosystemAnonId);
    });
  });
});
