/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');

const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../mocks');
const getRoute = require('../../routes_helpers').getRoute;
const proxyquire = require('proxyquire');
const { AccountTasks, ReasonForDeletion } = require('@fxa/shared/cloud-tasks');

const uuid = require('uuid');
const crypto = require('crypto');
const error = require('../../../lib/error');
const log = require('../../../lib/log');
const otplib = require('otplib');
const { Container } = require('typedi');
const { CapabilityService } = require('../../../lib/payments/capability');
const { AccountEventsManager } = require('../../../lib/account-events');
const { AccountDeleteManager } = require('../../../lib/account-delete');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const {
  PlaySubscriptions,
} = require('../../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../../lib/payments/iap/apple-app-store/subscriptions');
const {
  deleteAccountIfUnverified,
} = require('../../../lib/routes/utils/account');
const { AppConfig, AuthLogger } = require('../../../lib/types');
const defaultConfig = require('../../../config').default.getProperties();
const { ProfileClient } = require('@fxa/profile/client');
const glean = mocks.mockGlean();

const TEST_EMAIL = 'foo@gmail.com';

function hexString(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

let mockAccountQuickDelete = sinon.fake.resolves();
let mockAccountTasksDeleteAccount = sinon.fake(async (...args) => {});
const mockGetAccountCustomerByUid = sinon.fake.resolves({
  stripeCustomerId: 'customer123',
});

const makeRoutes = function (options = {}, requireMocks = {}) {
  Container.set(CapabilityService, options.capabilityService || sinon.fake);
  const config = options.config || {};
  config.oauth = config.oauth || {};
  config.verifierVersion = config.verifierVersion || 0;
  config.smtp = config.smtp || {};
  config.lastAccessTimeUpdates = {};
  config.signinConfirmation = config.signinConfirmation || {};
  config.signinUnblock = config.signinUnblock || {};
  config.secondaryEmail = config.secondaryEmail || {};
  config.authFirestore = config.authFirestore || {};
  config.securityHistory = config.securityHistory || {};
  config.gleanMetrics = config.gleanMetrics || defaultConfig.gleanMetrics;
  config.cloudTasks = mocks.mockCloudTasksConfig;

  const log = options.log || mocks.mockLog();
  Container.set(AuthLogger, log);

  Container.set(AppConfig, config);
  Container.set(AccountEventsManager, new AccountEventsManager());

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
    proxyquire('../../../lib/routes/utils/signin', {
      '../utils/otp': () => ({ generateOtpCode: sinon.stub() }),
    })(log, config, customs, db, mailer, cadReminders, glean);
  if (options.checkPassword) {
    signinUtils.checkPassword = options.checkPassword;
  }
  const push = options.push || require('../../../lib/push')(log, db, {});
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const subscriptionAccountReminders =
    options.subscriptionAccountReminders || mocks.mockVerificationReminders();
  const { accountRoutes } = proxyquire('../../../lib/routes/account', {
    ...(requireMocks || {}),
    'fxa-shared/db/models/auth': {
      getAccountCustomerByUid: mockGetAccountCustomerByUid,
    },
  });
  const signupUtils =
    options.signupUtils ||
    require('../../../lib/routes/utils/signup')(
      log,
      db,
      mailer,
      push,
      verificationReminders,
      glean
    );
  const pushbox = options.pushbox || { deleteAccount: sinon.fake.resolves() };
  const oauthDb = {
    removeTokensAndCodes: () => {},
    removePublicAndCanGrantTokens: () => {},
    ...(options.oauth || {}),
  };

  mockAccountTasksDeleteAccount = sinon.fake.resolves();
  const accountTasks = {
    deleteAccount: mockAccountTasksDeleteAccount,
  };
  Container.set(AccountTasks, accountTasks);

  // We have to do some redirection with proxyquire because dependency
  // injection changes the class
  const AccountDeleteManagerMock = proxyquire('../../../lib/account-delete', {
    'fxa-shared/db/models/auth': {
      ...(requireMocks['fxa-shared/db/models/auth'] || {}),
      getAccountCustomerByUid: mockGetAccountCustomerByUid,
    },
  });
  const accountManagerMock = new AccountDeleteManagerMock.AccountDeleteManager({
    fxaDb: db,
    oauthDb,
    config,
    push,
    pushbox,
  });
  mockAccountQuickDelete = sinon.fake(async (...args) => {
    return {};
  });
  accountManagerMock.quickDelete = mockAccountQuickDelete;
  Container.set(AccountDeleteManager, accountManagerMock);

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
    oauthDb,
    options.stripeHelper,
    pushbox,
    glean
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
    mailer,
    oauth;

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
    oauth = { removeTokensAndCodes: sinon.stub() };
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
      oauth,
    });
    route = getRoute(accountRoutes, '/account/reset');

    clientAddress = mockRequest.app.clientAddress;
    glean.resetPassword.accountReset.reset();
    glean.resetPassword.createNewSuccess.reset();
    glean.resetPassword.recoveryKeyCreatePasswordSuccess.reset();
  });

  describe('reset account with account recovery key', () => {
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

    it('should have checked for account recovery key', () => {
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
        'account recovery key id passed'
      );
    });

    it('should have reset account with account recovery key', () => {
      assert.equal(mockDB.resetAccount.callCount, 1);
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

    it('should have deleted account recovery key', () => {
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

    it('should have removed oauth tokens', () => {
      assert.calledOnceWithExactly(oauth.removeTokensAndCodes, uid);
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
      assert.calledOnceWithExactly(
        glean.resetPassword.recoveryKeyCreatePasswordSuccess,
        mockRequest,
        {
          uid,
        }
      );
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
      sinon.assert.calledOnceWithExactly(
        glean.resetPassword.accountReset,
        mockRequest,
        {
          uid,
        }
      );
      sinon.assert.calledOnceWithExactly(
        glean.resetPassword.createNewSuccess,
        mockRequest,
        {
          uid,
        }
      );
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

  const mockConfig = {};
  mockConfig.oauth = {};
  mockConfig.signinConfirmation = {};
  mockConfig.signinConfirmation.skipForEmailAddresses = [];
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

    await deleteAccountIfUnverified(
      mockDB,
      mockStripeHelper,
      mockLog,
      mockRequest,
      TEST_EMAIL
    );
    sinon.assert.calledWithMatch(mockDB.deleteAccount, emailRecord);
  });
  it('should not delete an unverified account with a linked Stripe account and return early', async () => {
    const mockStripeHelper = {
      hasActiveSubscription: async () => Promise.resolve(true),
    };
    let failed = false;
    try {
      await deleteAccountIfUnverified(
        mockDB,
        mockStripeHelper,
        mockLog,
        mockRequest,
        TEST_EMAIL
      );
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

    await deleteAccountIfUnverified(
      mockDB,
      mockStripeHelper,
      mockLog,
      mockRequest,
      TEST_EMAIL
    );
    sinon.assert.calledOnceWithExactly(
      mockStripeHelper.removeCustomer,
      emailRecord.uid
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
    try {
      await deleteAccountIfUnverified(
        mockDB,
        mockStripeHelper,
        mockLog,
        mockRequest,
        TEST_EMAIL
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.removeCustomer,
        emailRecord.uid
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
  afterEach(() => {
    glean.registration.accountCreated.reset();
    glean.registration.confirmationEmailSent.reset();
  });

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
        2,
        'an sqs event was logged'
      );
      let eventData = mockLog.notifier.send.getCall(0).args[0];
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

      eventData = mockLog.notifier.send.getCall(1).args[0];
      assert.equal(eventData.event, 'profileDataChange');
      assert.equal(eventData.data.uid, uid);

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
      assert.equal(args[2].timeZone, 'America/Los_Angeles');
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

      sinon.assert.calledOnce(glean.registration.accountCreated);
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
        2,
        'an sqs event was logged'
      );
      let eventData = mockLog.notifier.send.getCall(0).args[0];
      assert.equal(eventData.event, 'login', 'it was a login event');
      assert.equal(
        eventData.data.service,
        'foo',
        'it was for the expected service'
      );
      eventData = mockLog.notifier.send.getCall(1).args[0];
      assert.equal(eventData.event, 'profileDataChange');
      assert.equal(eventData.data.uid, uid);

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

      sinon.assert.calledOnce(glean.registration.confirmationEmailSent);

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

  it('#integration - creates an account', () => {
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

  it('rejects creating an account with an invalid email domain', async () => {
    const { route, mockRequest } = setup();
    mockRequest.payload.email = 'test@bad.domain';

    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.ACCOUNT_CREATION_REJECTED);
    }
  });
});

describe('/account/status', () => {
  function setup({
    extraConfig = {},
    dbOptions = {},
    shouldError = true,
  } = {}) {
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
        checkDomain: true,
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
        ...dbOptions,
      },
      {
        ...(shouldError && {
          emailRecord: new error.unknownAccount(),
        }),
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
    const route = getRoute(accountRoutes, '/account/status', 'POST');

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

  it('returns valid for a valid email domain', async () => {
    const { route, mockRequest } = setup();

    return runTest(route, mockRequest, (response) => {
      assert.equal(response.invalidDomain, false);
    });
  });

  it('#integration -returns invalid for an invalid email domain', async () => {
    const { route, mockRequest } = setup();
    mockRequest.payload.email = 'test@bad.domain';

    return runTest(route, mockRequest, (response) => {
      assert.equal(response.invalidDomain, true);
    });
  });

  it('does not check domain if not requested to do so', async () => {
    const { route, mockRequest } = setup();
    mockRequest.payload.checkDomain = false;

    return runTest(route, mockRequest, (response) => {
      assert.equal(response.invalidDomain, undefined);
    });
  });

  it('calls accountRecord and returns expected values when thirdPartyAuthStatus is requested', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        linkedAccounts: [{}],
        verifierSetAt: 0,
      },
      shouldError: false,
    });
    mockRequest.payload.thirdPartyAuthStatus = true;

    return runTest(route, mockRequest, (response) => {
      assert.equal(mockDB.accountRecord.callCount, 1);
      assert.equal(mockDB.accountExists.callCount, 0);

      assert.equal(response.exists, true);
      assert.equal(response.hasLinkedAccount, true);
      assert.equal(response.hasPassword, false);
    });
  });

  it('calls accountExists when thirdPartyAuthStatus is not requested', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: { exists: false },
    });

    return runTest(route, mockRequest, (response) => {
      assert.equal(mockDB.accountRecord.callCount, 0);
      assert.equal(mockDB.accountExists.callCount, 1);

      assert.equal(response.exists, false);
      assert.equal(response.linkedAccounts, undefined);
      assert.equal(response.hasPassword, undefined);
    });
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

  it('removes the reminder if it errors after account is verified', async () => {
    const { route, mockRequest, subscriptionAccountReminders } = setup({
      verifierSetAt: Date.now(),
    });

    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.errno, 110);
      assert.calledOnce(subscriptionAccountReminders.delete);
    }
  });
});

describe('/account/set_password', () => {
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
      auth: {
        credentials: {
          user: uid,
          email,
        },
      },
      locale: 'en-GB',
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        metricsContext: mockMetricsContext,
        service: '123Done',
        uid,
      },
      ...(options.query && { query: options.query }),
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
    const fakeProduct = { id: 'prod_123', name: 'Wow Great Product' };
    const fakePlan = {
      id: 'price_123',
      product: fakeProduct,
    };
    const mockStripeHelper = options.mockStripeHelper || {
      allProducts: sinon.fake.resolves([fakeProduct]),
      allPlans: sinon.fake.resolves([fakePlan]),
    };
    const mockCapabilityService = options.mockCapabilityService || {
      subscribedPriceIds: sinon.fake.resolves([fakePlan.id]),
    };
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
      stripeHelper: mockStripeHelper,
      capabilityService: mockCapabilityService,
    });
    const route = getRoute(accountRoutes, '/account/set_password');

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
    const {
      route,
      mockRequest,
      mockDB,
      mockMailer,
      subscriptionAccountReminders,
      uid,
    } = setup({
      query: {
        // The framework sets this as the default value in the source code
        sendVerifyEmail: true,
      },
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response) => {
      // setPasswordOnStubAccount
      assert.equal(
        mockDB.resetAccount.callCount,
        1,
        'db.resetAccount was called'
      );
      // sendVerifyCode
      assert.equal(
        mockMailer.sendVerifyShortCodeEmail.callCount,
        1,
        'mailer.sendVerifyShortCodeEmail was called'
      );
      // subscriptionAccountReminders
      assert.calledOnce(subscriptionAccountReminders.create);
      // response
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

  it('does not send the verify email if query parameter is set to false', async () => {
    const { route, mockRequest, mockMailer, uid } = setup({
      query: {
        sendVerifyEmail: false,
      },
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response) => {
      assert.notCalled(mockMailer.sendVerifyShortCodeEmail);
      assert.ok(response.sessionToken);
      assert.equal(response.uid, uid);
    });
  });

  it('does not create a reminder if product is undefined', () => {
    const mockStripeHelper = {
      allProducts: sinon.fake.resolves([]),
      allPlans: sinon.fake.resolves([]),
    };
    const { route, mockRequest, subscriptionAccountReminders, uid } = setup({
      mockStripeHelper,
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response) => {
      assert.notCalled(subscriptionAccountReminders.create);
      assert.ok(response.sessionToken);
      assert.equal(response.uid, uid);
    });
  });

  it('does not create a reminder if product is invalid', () => {
    const fakeProduct = { otherProp: 'fun' };
    const fakePlan = {
      id: 'price_123',
      product: fakeProduct,
    };
    const mockStripeHelper = {
      allProducts: sinon.fake.resolves([fakeProduct]),
      allPlans: sinon.fake.resolves([fakePlan]),
    };
    const { route, mockRequest, subscriptionAccountReminders, uid } = setup({
      mockStripeHelper,
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response) => {
      assert.notCalled(subscriptionAccountReminders.create);
      assert.ok(response.sessionToken);
      assert.equal(response.uid, uid);
    });
  });
});

describe('/account/login', () => {
  const config = {
    securityHistory: {
      ipProfiling: {},
    },
    signinConfirmation: {},
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
    Container.set(CapabilityService, sinon.fake.resolves());
  });

  afterEach(() => {
    glean.login.success.reset();
    mockLog.activityEvent.resetHistory();
    mockLog.flowEvent.resetHistory();
    mockMailer.sendNewDeviceLoginEmail = sinon.spy(() => Promise.resolve([]));
    mockMailer.sendVerifyLoginEmail = sinon.spy(() => Promise.resolve());
    mockMailer.sendVerifyLoginCodeEmail = sinon.spy(() => Promise.resolve());
    mockMailer.sendVerifyShortCodeEmail = sinon.spy(() => Promise.resolve());
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
      assert.equal(args[2].acceptLanguage, 'en-US');
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
        assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 1);
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

          sinon.assert.calledOnce(glean.login.success);
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

    it('logs a Glean pign on verify login code email sent', () => {
      glean.login.verifyCodeEmailSent.reset();
      return runTest(
        route,
        {
          ...mockRequest,
          payload: {
            ...mockRequest.payload,
            verificationMethod: 'email-otp',
          },
        },
        () => {
          sinon.assert.calledOnce(glean.login.verifyCodeEmailSent);
        }
      );
    });
  });

  it('#integration - creating too many sessions causes an error to be logged', () => {
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
            'Unconfirmed account',
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

  let mockDB, mockLog, mockRequest, mockPush, mockPushbox;

  beforeEach(async () => {
    mockDB = {
      ...mocks.mockDB({ email: email, uid: uid }),
    };
    mockLog = mocks.mockLog();
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: email,
        authPW: new Array(65).join('f'),
      },
    });
  });

  afterEach(() => {
    glean.account.deleteComplete.reset();
  });

  function buildRoute(subscriptionsEnabled = true) {
    const accountRoutes = makeRoutes({
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
      pushbox: mockPushbox,
    });
    return getRoute(accountRoutes, '/account/destroy');
  }

  it('should delete the account and enqueue account task', () => {
    const route = buildRoute();

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);

      sinon.assert.calledOnceWithExactly(
        mockAccountQuickDelete,
        uid,
        ReasonForDeletion.UserRequested
      );

      sinon.assert.calledOnceWithExactly(mockGetAccountCustomerByUid, uid);
      sinon.assert.calledOnceWithExactly(mockAccountTasksDeleteAccount, {
        uid,
        customerId: 'customer123',
        reason: ReasonForDeletion.UserRequested,
      });
      assert.calledOnceWithExactly(glean.account.deleteComplete, mockRequest, {
        uid,
      });
    });
  });

  it('should delete the account and enqueue account task on error', () => {
    const route = buildRoute();

    // Here we act like there's an error when calling accountDeleteManager.quickDelete(...)
    mockAccountQuickDelete = sinon.fake.rejects();

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);
      sinon.assert.calledOnceWithExactly(mockAccountTasksDeleteAccount, {
        uid,
        customerId: 'customer123',
        reason: ReasonForDeletion.UserRequested,
      });
      assert.calledOnceWithExactly(glean.account.deleteComplete, mockRequest, {
        uid,
      });
    });
  });

  it('should delete the passwordless account', () => {
    mockDB = { ...mocks.mockDB({ email, uid, verifierSetAt: 0 }) };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: email,
      },
    });
    const route = buildRoute();

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);
      sinon.assert.calledOnceWithExactly(
        mockAccountQuickDelete,
        uid,
        ReasonForDeletion.UserRequested
      );
      sinon.assert.calledOnceWithExactly(mockAccountTasksDeleteAccount, {
        uid,
        customerId: 'customer123',
        reason: ReasonForDeletion.UserRequested,
      });
      assert.calledOnceWithExactly(glean.account.deleteComplete, mockRequest, {
        uid,
      });
    });
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
    mockPlaySubscriptions,
    mockAppStoreSubscriptions;

  function buildRoute(
    subscriptionsEnabled = true,
    playSubscriptionsEnabled = false,
    appStoreSubscriptionsEnabled = false
  ) {
    const accountRoutes = makeRoutes({
      config: {
        subscriptions: {
          enabled: subscriptionsEnabled,
          playApiServiceAccount: {
            enabled: playSubscriptionsEnabled,
          },
          appStore: {
            enabled: appStoreSubscriptionsEnabled,
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
      'removeFirestoreCustomer',
    ]);
    mockStripeHelper.fetchCustomer = sinon.spy(
      async (uid, email) => mockCustomer
    );
    mockStripeHelper.subscriptionsToResponse = sinon.spy(
      async (subscriptions) => mockWebSubscriptionsResponse
    );
    mockStripeHelper.removeFirestoreCustomer = sinon.stub().resolves();
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
    const mockPlayStoreSubscriptionPurchase = {
      kind: 'androidpublisher#subscriptionPurchase',
      startTimeMillis: `${Date.now() - 10000}`,
      expiryTimeMillis: `${Date.now() + 10000}`,
      autoRenewing: true,
      priceCurrencyCode: 'JPY',
      priceAmountMicros: '99000000',
      countryCode: 'JP',
      developerPayload: '',
      paymentState: 1,
      orderId: 'GPA.3313-5503-3858-32549',
      packageName: 'testPackage',
      purchaseToken: 'testToken',
      sku: 'sku',
      verifiedAt: Date.now(),
      isEntitlementActive: sinon.fake.returns(true),
    };

    const mockExtraStripeInfo = {
      price_id: 'price_lol',
      product_id: 'prod_lol',
      product_name: 'LOL Product',
    };

    const mockAppendedPlayStoreSubscriptionPurchase = {
      ...mockPlayStoreSubscriptionPurchase,
      ...mockExtraStripeInfo,
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
    };

    const mockFormattedPlayStoreSubscription = {
      auto_renewing: mockPlayStoreSubscriptionPurchase.autoRenewing,
      expiry_time_millis: mockPlayStoreSubscriptionPurchase.expiryTimeMillis,
      package_name: mockPlayStoreSubscriptionPurchase.packageName,
      sku: mockPlayStoreSubscriptionPurchase.sku,
      ...mockExtraStripeInfo,
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
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
        mockAppendedPlayStoreSubscriptionPurchase,
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
            subscriptions: [mockFormattedPlayStoreSubscription],
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
              ...[mockFormattedPlayStoreSubscription],
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

  describe('Apple App Store subscriptions', () => {
    const mockAppStoreSubscriptionPurchase = {
      productId: 'wow',
      autoRenewing: false,
      bundleId: 'hmm',
      isEntitlementActive: sinon.fake.returns(true),
    };

    const mockExtraStripeInfo = {
      price_id: 'price_lol',
      product_id: 'prod_lol',
      product_name: 'LOL Product',
    };

    const mockAppendedAppStoreSubscriptionPurchase = {
      ...mockAppStoreSubscriptionPurchase,
      ...mockExtraStripeInfo,
      _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
    };

    const mockFormattedAppStoreSubscription = {
      app_store_product_id: mockAppStoreSubscriptionPurchase.productId,
      auto_renewing: mockAppStoreSubscriptionPurchase.autoRenewing,
      bundle_id: mockAppStoreSubscriptionPurchase.bundleId,
      ...mockExtraStripeInfo,
      _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
    };

    let subscriptionsEnabled, appStoreSubscriptionsEnabled;

    beforeEach(() => {
      subscriptionsEnabled = true;
      appStoreSubscriptionsEnabled = true;
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
      mockAppStoreSubscriptions = mocks.mockAppStoreSubscriptions([
        'getSubscriptions',
      ]);
      Container.set(AppStoreSubscriptions, mockAppStoreSubscriptions);
      mockAppStoreSubscriptions.getSubscriptions = sinon.spy(async (uid) => [
        mockAppendedAppStoreSubscriptionPurchase,
      ]);
    });

    it('should return formatted Apple App Store subscriptions when App Store subscriptions are enabled', () => {
      return runTest(
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockStripeHelper.subscriptionsToResponse.callCount, 0);
          sinon.assert.calledOnceWithExactly(
            mockAppStoreSubscriptions.getSubscriptions,
            uid
          );
          assert.deepEqual(result, {
            subscriptions: [mockFormattedAppStoreSubscription],
          });
        }
      );
    });

    it('should return formatted Apple App Store and web subscriptions when App Store subscriptions are enabled', () => {
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
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockAppStoreSubscriptions.getSubscriptions.callCount, 1);
          assert.deepEqual(result, {
            subscriptions: [
              ...[mockFormattedAppStoreSubscription],
              ...mockWebSubscriptionsResponse,
            ],
          });
        }
      );
    });

    it('should return an empty list when subscriptions are enabled and no active Apple App Store or web subscriptions are found', () => {
      mockAppStoreSubscriptions.getSubscriptions = sinon.spy(async (uid) => []);

      return runTest(
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockAppStoreSubscriptions.getSubscriptions.callCount, 1);
          assert.deepEqual(result, {
            subscriptions: [],
          });
        }
      );
    });

    it('should not return any App Store subscriptions when App Store subscriptions are disabled', () => {
      appStoreSubscriptionsEnabled = false;
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
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result) => {
          assert.equal(log.begin.callCount, 1);
          assert.equal(mockStripeHelper.fetchCustomer.callCount, 1);
          assert.equal(mockAppStoreSubscriptions.getSubscriptions.callCount, 0);
          assert.deepEqual(result, {
            subscriptions: mockWebSubscriptionsResponse,
          });
        }
      );
    });
  });
});
