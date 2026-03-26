/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');
const {
  DeleteAccountTasks,
  ReasonForDeletion,
} = require('@fxa/shared/cloud-tasks');

const uuid = require('uuid');
const crypto = require('crypto');
const { AppError: error } = require('@fxa/accounts/errors');
const log = require('../log');
const otplib = require('otplib');
const { Container } = require('typedi');
const { CapabilityService } = require('../payments/capability');
const { AccountEventsManager } = require('../account-events');
const { AccountDeleteManager } = require('../account-delete');
const { normalizeEmail } = require('fxa-shared').email.helpers;
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const {
  PlaySubscriptions,
} = require('../payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../payments/iap/apple-app-store/subscriptions');
const {
  deleteAccountIfUnverified,
} = require('./utils/account');
const { AppConfig, AuthLogger } = require('../types');
const defaultConfig = require('../../config').default.getProperties();
const { ProfileClient } = require('@fxa/profile/client');
const { RelyingPartyConfigurationManager } = require('@fxa/shared/cms');
const {
  OAuthClientInfoServiceName,
} = require('../senders/oauth_client_info');

const { FxaMailer } = require('../senders/fxa-mailer');
const { RecoveryPhoneService } = require('@fxa/accounts/recovery-phone');
const { BackupCodeManager } = require('@fxa/accounts/two-factor');

// Dynamic mock for fxa-shared/db/models/auth — changed per-test via makeRoutes
// eslint-disable-next-line no-var
var fxaSharedDbModelsOverride: any = {};
jest.mock('fxa-shared/db/models/auth', () => {
  const actual = jest.requireActual('fxa-shared/db/models/auth');
  return new Proxy(actual, {
    get: (target: any, prop: string) =>
      prop in fxaSharedDbModelsOverride
        ? fxaSharedDbModelsOverride[prop]
        : target[prop],
  });
});

// Don't mock utils/otp — let it use the real implementation so hasTotpToken
// delegates to db.totpToken and generateOtpCode uses real otplib

// Mock the OAuth client module to prevent real DB connections
jest.mock('../oauth/client', () => {
  const actual = jest.requireActual('../oauth/client');
  return {
    ...actual,
    getClientById: jest.fn().mockResolvedValue({
      id: 'mock-client',
      name: 'mock',
      canGrant: false,
      publicClient: true,
      allowedScopes: 'profile',
    }),
  };
});

// Mock generateAccessToken to prevent oauth/db from connecting to MySQL
jest.mock('../oauth/grant', () => {
  const actual = jest.requireActual('../oauth/grant');
  return {
    ...actual,
    generateAccessToken: jest.fn().mockResolvedValue({
      token: Buffer.alloc(32),
      type: 'bearer',
    }),
  };
});

// Dynamic mock for ../oauth/jwt — finish_setup tests need to stub verify()
// eslint-disable-next-line no-var
var oauthJwtOverride: any = null;
jest.mock('../oauth/jwt', () => {
  const actual = jest.requireActual('../oauth/jwt');
  return {
    __esModule: true,
    get default() {
      return oauthJwtOverride || actual.default || actual;
    },
  };
});

const glean = mocks.mockGlean();
const profile = mocks.mockProfile();
const statsd = mocks.mockStatsd();
const rpCmsConfig = {
  clientId: '00f00f',
  shared: {
    emailFromName: 'Testo Inc.',
    emailLogoUrl: 'http://img.exmpl.gg/logo.svg',
  },
  NewDeviceLoginEmail: {
    subject: 'You Logged In',
    headline: 'You Logged Into Product',
    description: 'It appears you logged in.',
  },
  VerifyShortCodeEmail: {
    subject: 'Verify Your Account',
    headline: 'Enter code to verify',
    description: 'Use code below and gogogo',
  },
};
const rpConfigManager = {
  fetchCMSData: sinon
    .stub()
    .withArgs('00f00f', 'testo')
    .resolves({
      relyingParties: [rpCmsConfig],
    }),
};

const TEST_EMAIL = 'foo@gmail.com';

function hexString(bytes: number) {
  return crypto.randomBytes(bytes).toString('hex');
}

let mockAccountQuickDelete = jest.fn().mockResolvedValue(undefined);
let mockAccountTasksDeleteAccount = sinon.fake(async () => {});
const mockGetAccountCustomerByUid = sinon.fake.resolves({
  stripeCustomerId: 'customer123',
});

const makeRoutes = function (options: any = {}, requireMocks: any = {}) {
  Container.set(CapabilityService, options.capabilityService || jest.fn());
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
  config.accountDestroy = defaultConfig.accountDestroy;

  const log = options.log || mocks.mockLog();
  Container.set(AuthLogger, log);

  Container.set(AppConfig, config);
  Container.set(
    AccountEventsManager,
    options.mockAccountEventsManager || new AccountEventsManager()
  );
  Container.set(RelyingPartyConfigurationManager, rpConfigManager);

  const mailer = options.mailer || {};
  const cadReminders = options.cadReminders || mocks.mockCadReminders();
  const Password =
    options.Password || require('../crypto/password')(log, config);
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: () => Promise.resolve(true),
    checkAuthenticated: () => Promise.resolve(true),
  };
  // Set up fxa-shared/db/models/auth mock with per-call overrides
  fxaSharedDbModelsOverride = {
    getAccountCustomerByUid: mockGetAccountCustomerByUid,
    ...((requireMocks || {})['fxa-shared/db/models/auth'] || {}),
  };
  // Set up ../oauth/jwt mock if provided in requireMocks
  oauthJwtOverride = (requireMocks || {})['../oauth/jwt'] || null;

  const signinUtils =
    options.signinUtils ||
    require('./utils/signin')(log, config, customs, db, mailer, cadReminders, glean, statsd);
  if (options.checkPassword) {
    signinUtils.checkPassword = options.checkPassword;
  }
  const push = options.push || require('../push')(log, db, {});
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const subscriptionAccountReminders =
    options.subscriptionAccountReminders || mocks.mockVerificationReminders();
  const { accountRoutes } = require('./account');
  const signupUtils =
    options.signupUtils ||
    require('./utils/signup')(
      log,
      db,
      mailer,
      push,
      verificationReminders,
      glean
    );
  const pushbox = options.pushbox || { deleteAccount: jest.fn().mockResolvedValue(undefined) };
  const oauthDb = {
    removeTokensAndCodes: () => {},
    removePublicAndCanGrantTokens: () => {},
    ...(options.oauth || {}),
  };

  mockAccountTasksDeleteAccount = sinon.fake.resolves(undefined);
  const accountTasks = {
    deleteAccount: mockAccountTasksDeleteAccount,
  };
  Container.set(DeleteAccountTasks, accountTasks);

  const accountManagerMock = new AccountDeleteManager({
    fxaDb: db,
    oauthDb,
    config,
    push,
    pushbox,
  });
  mockAccountQuickDelete = jest.fn(async () => {
    return {};
  });
  accountManagerMock.quickDelete = mockAccountQuickDelete;
  Container.set(AccountDeleteManager, accountManagerMock);

  Container.set(ProfileClient, profile);
  Container.set(BackupCodeManager, {
    getCountForUserId: jest.fn().mockResolvedValue(0),
  });
  Container.set(RecoveryPhoneService, {
    hasConfirmed: jest.fn().mockResolvedValue(false),
    available: jest.fn().mockResolvedValue(false),
  });

  const authServerCacheRedis = options.authServerCacheRedis || {
    get: async () => null,
    del: async () => 0,
  };

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
    glean,
    authServerCacheRedis,
    statsd
  );
};

function runTest(route: any, request: any, assertions?: any) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('/account/reset', () => {
  let uid: any,
    mockLog: any,
    mockMetricsContext: any,
    mockRequest: any,
    keyFetchTokenId: any,
    sessionTokenId: any,
    mockDB: any,
    mockCustoms: any,
    mockPush: any,
    accountRoutes: any,
    route: any,
    clientAddress: any,
    mailer: any,
    fxaMailer: any,
    oauth: any;

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
    fxaMailer = mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
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
    let res: any;
    beforeEach(() => {
      mockRequest.payload.wrapKb = hexString(32);
      mockRequest.payload.recoveryKeyId = hexString(16);
      return runTest(route, mockRequest, (result: any) => (res = result));
    });

    it('should return response', () => {
      expect(res.sessionToken).toBeTruthy();
      expect(res.keyFetchToken).toBeTruthy();
    });

    it('should have checked for account recovery key', () => {
      expect(mockDB.getRecoveryKey.callCount).toBe(1);
      const args = mockDB.getRecoveryKey.args[0];
      expect(args.length).toBe(2);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(mockRequest.payload.recoveryKeyId);
    });

    it('should have reset account with account recovery key', () => {
      expect(mockDB.resetAccount.callCount).toBe(1);
      expect(mockDB.createKeyFetchToken.callCount).toBe(1);
      const args = mockDB.createKeyFetchToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].uid).toBe(uid);
      expect(args[0].wrapKb).toBe(mockRequest.payload.wrapKb);
    });

    it('should have deleted account recovery key', () => {
      expect(mockDB.deleteRecoveryKey.callCount).toBe(1);
      const args = mockDB.deleteRecoveryKey.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toBe(uid);
    });

    it('called mailer.sendPasswordResetAccountRecoveryEmail correctly', () => {
      expect(
        fxaMailer.sendPasswordResetAccountRecoveryEmail.callCount
      ).toBe(1);
      const args = fxaMailer.sendPasswordResetAccountRecoveryEmail.args[0];
      expect(args[0].to).toBe(TEST_EMAIL);
    });

    it('should have removed oauth tokens', () => {
      sinon.assert.calledOnceWithExactly(oauth.removeTokensAndCodes, uid);
    });

    it('should have reset custom server', () => {
      expect(mockCustoms.reset.callCount).toBe(1);
    });

    it('should have recorded security event', () => {
      expect(mockDB.securityEvent.callCount).toBe(1);
      const securityEvent = mockDB.securityEvent.args[0][0];
      expect(securityEvent.uid).toBe(uid);
      expect(securityEvent.ipAddr).toBe(clientAddress);
      expect(securityEvent.name).toBe('account.reset');
    });

    it('should have emitted metrics', () => {
      expect(mockLog.activityEvent.callCount).toBe(1);
      const args = mockLog.activityEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
        country: 'United States',
        event: 'account.reset',
        region: 'California',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid,
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockMetricsContext.validate.callCount).toBe(0);
      expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(0);
      expect(mockMetricsContext.propagate.callCount).toBe(2);
      sinon.assert.calledOnceWithExactly(
        glean.resetPassword.recoveryKeyCreatePasswordSuccess,
        mockRequest,
        {
          uid,
        }
      );
    });

    it('should have created session', () => {
      expect(mockDB.createSessionToken.callCount).toBe(1);
      const args = mockDB.createSessionToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].uaBrowser).toBe('Firefox');
      expect(args[0].uaBrowserVersion).toBe('57');
      expect(args[0].uaOS).toBe('Mac OS X');
      expect(args[0].uaOSVersion).toBe('10.11');
      expect(args[0].uaDeviceType).toBeNull();
      expect(args[0].uaFormFactor).toBeNull();

      // Token is not verified with TOTP-2FA method (AAL2) if account does not have TOTP
      expect(mockDB.verifyTokensWithMethod.callCount).toBe(0);
    });
  });

  describe('reset account with account recovery key, TOTP enabled', () => {
    let res: any;
    beforeEach(() => {
      mockDB.totpToken = sinon.spy(() => {
        return Promise.resolve({
          verified: true,
          enabled: true,
        });
      });
      mockRequest.payload.wrapKb = hexString(32);
      mockRequest.payload.recoveryKeyId = hexString(16);
      return runTest(route, mockRequest, (result: any) => (res = result));
    });

    it('should return response', () => {
      expect(res.sessionToken).toBeTruthy();
      expect(res.keyFetchToken).toBeTruthy();
    });

    it('should verify token with TOTP-2FA method (AAL2) if account has TOTP', () => {
      expect(mockDB.verifyTokensWithMethod.callCount).toBe(1);
      const verifyArgs = mockDB.verifyTokensWithMethod.args[0];
      expect(verifyArgs[1]).toBe('totp-2fa');
    });
  });

  describe('reset account with account recovery key, isFirefoxMobileClient=true', () => {
    beforeEach(() => {
      mockRequest.payload.wrapKb = hexString(32);
      mockRequest.payload.recoveryKeyId = hexString(16);
      mockRequest.payload.isFirefoxMobileClient = true;
      return runTest(route, mockRequest);
    });

    it('called mailer.sendPasswordResetWithRecoveryKeyPromptEmail correctly', () => {
      expect(
        fxaMailer.sendPasswordResetWithRecoveryKeyPromptEmail.callCount
      ).toBe(1);
      const args =
        fxaMailer.sendPasswordResetWithRecoveryKeyPromptEmail.args[0];
      expect(args[0].to).toBe(TEST_EMAIL);
    });
  });

  describe('reset account with verified totp', () => {
    let res: any;
    beforeEach(() => {
      mockDB.totpToken = sinon.spy(() => {
        return Promise.resolve({
          verified: true,
          enabled: true,
        });
      });
      mockRequest.auth.credentials.verificationMethod = 2; // Token has been verified
      return runTest(route, mockRequest, (result: any) => (res = result));
    });

    it('should return response', () => {
      expect(res.sessionToken).toBeTruthy();
      expect(res.keyFetchToken).toBeTruthy();
      expect(res.emailVerified).toBe(true);
      expect(res.sessionVerified).toBe(true);
      expect(res.verificationMethod).toBeUndefined();
    });

    it('should have created verified sessionToken', () => {
      expect(mockDB.createSessionToken.callCount).toBe(1);
      const args = mockDB.createSessionToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].tokenVerificationId).toBeFalsy();
    });

    it('should have created verified keyFetchToken', () => {
      expect(mockDB.createKeyFetchToken.callCount).toBe(1);
      const args = mockDB.createKeyFetchToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].tokenVerificationId).toBeFalsy();
    });
  });

  describe('reset account with TOTP recovery code', () => {
    beforeEach(() => {
      mockDB.totpToken = sinon.spy(() => {
        return Promise.resolve({
          verified: true,
          enabled: true,
        });
      });
      mockRequest.auth.credentials.verificationMethod = 3;
      return runTest(route, mockRequest);
    });

    it('should have created a sessionToken with the copied verification method', () => {
      expect(mockDB.createSessionToken.callCount).toBe(1);
      const args = mockDB.createSessionToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].tokenVerificationId).toBeFalsy();
      expect(mockDB.verifyTokensWithMethod.callCount).toBe(1);
      const updateArgs = mockDB.verifyTokensWithMethod.args[0];
      expect(updateArgs[1]).toBe(
        mockRequest.auth.credentials.verificationMethod
      );
    });
  });

  describe('reset account with unverified totp', () => {
    it('should fail with unverified session', async () => {
      mockDB.totpToken = sinon.spy(() => {
        return Promise.resolve({
          verified: true,
          enabled: true,
        });
      });
      await expect(runTest(route, mockRequest)).rejects.toMatchObject({
        errno: 138,
      });
    });
  });

  it('should reset account', () => {
    return runTest(route, mockRequest, (res: any) => {
      expect(mockDB.resetAccount.callCount).toBe(1);

      expect(mockPush.notifyPasswordReset.callCount).toBe(1);
      expect(mockPush.notifyPasswordReset.firstCall.args[0]).toEqual(uid);

      expect(mockDB.account.callCount).toBe(1);
      expect(mockCustoms.reset.callCount).toBe(1);

      expect(mockLog.activityEvent.callCount).toBe(1);
      let args = mockLog.activityEvent.args[0];
      expect(args.length).toBe(1);
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
      expect(args[0]).toEqual({
        country: 'United States',
        event: 'account.reset',
        region: 'California',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid,
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockDB.securityEvent.callCount).toBe(1);
      const securityEvent = mockDB.securityEvent.args[0][0];
      expect(securityEvent.uid).toBe(uid);
      expect(securityEvent.ipAddr).toBe(clientAddress);
      expect(securityEvent.name).toBe('account.reset');

      expect(mockMetricsContext.validate.callCount).toBe(0);
      expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(0);

      expect(mockMetricsContext.propagate.callCount).toBe(2);

      args = mockMetricsContext.propagate.args[0];
      expect(args).toHaveLength(2);
      expect(args[0].uid).toBe(uid);
      expect(args[1].uid).toBe(uid);
      expect(args[1].id).toBe(sessionTokenId);

      args = mockMetricsContext.propagate.args[1];
      expect(args).toHaveLength(2);
      expect(args[0].uid).toBe(uid);
      expect(args[1].uid).toBe(uid);
      expect(args[1].id).toBe(keyFetchTokenId);

      expect(mockDB.createSessionToken.callCount).toBe(1);
      args = mockDB.createSessionToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].tokenVerificationId).toBeNull();
      expect(args[0].uaBrowser).toBe('Firefox');
      expect(args[0].uaBrowserVersion).toBe('57');
      expect(args[0].uaOS).toBe('Mac OS X');
      expect(args[0].uaOSVersion).toBe('10.11');
      expect(args[0].uaDeviceType).toBeNull();
      expect(args[0].uaFormFactor).toBeNull();
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

  const mockConfig: any = {};
  mockConfig.oauth = {};
  mockConfig.signinConfirmation = {};
  mockConfig.signinConfirmation.skipForEmailAddresses = [];
  mockConfig.signinConfirmation.skipForEmailRegex = /^$/;
  const emailRecord: any = {
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
    } catch (err: any) {
      failed = true;
      expect(err.errno).toBe(error.ERRNO.ACCOUNT_EXISTS);
    }
    expect(failed).toBe(true);
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
    const sentryModule = require('../sentry');
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
      throw new Error('should not have re-thrown');
    }
    sentryModule.reportSentryError.restore();
  });
});

describe('/account/create', () => {
  beforeEach(() => {
    profile.deleteCache.resetHistory();
  });
  afterEach(() => {
    glean.registration.accountCreated.reset();
    glean.registration.confirmationEmailSent.reset();
  });

  function setup(extraConfig?: any, mockRequestOptsCb?: any, makeRoutesOptions: any = {}) {
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
    const defaultMockRequestOpts = {
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
    };
    const mockRequestOpts = mockRequestOptsCb
      ? mockRequestOptsCb(defaultMockRequestOpts)
      : defaultMockRequestOpts;
    const mockRequest = mocks.mockRequest(mockRequestOpts);
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
        emailRecord: error.unknownAccount(),
      }
    );
    const mockMailer = mocks.mockMailer();
    const mockFxaMailer = mocks.mockFxaMailer();
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
      ...makeRoutesOptions,
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
      mockMetricsContext: mockRequestOpts.metricsContext,
      mockRequest,
      route,
      sessionTokenId,
      uid,
      verificationReminders,
      subscriptionAccountReminders,
      mockFxaMailer,
    };
  }

  it('should create a sync account', () => {
    const {
      clientAddress,
      emailCode,
      keyFetchTokenId,
      mockDB,
      mockLog,
      mockMetricsContext,
      mockRequest,
      route,
      sessionTokenId,
      uid,
      verificationReminders,
      mockFxaMailer,
    } = setup();

    const now = Date.now();
    jest.useFakeTimers();
    jest.setSystemTime(now);

    return runTest(route, mockRequest, () => {
      expect(mockDB.createAccount.callCount).toBe(1);

      expect(mockDB.createSessionToken.callCount).toBe(1);
      let args = mockDB.createSessionToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].uaBrowser).toBe('Firefox Mobile');
      expect(args[0].uaBrowserVersion).toBe('9');
      expect(args[0].uaOS).toBe('iOS');
      expect(args[0].uaOSVersion).toBe('11');
      expect(args[0].uaDeviceType).toBe('tablet');
      expect(args[0].uaFormFactor).toBe('iPad');

      expect(mockLog.notifier.send.callCount).toBe(2);
      let eventData = mockLog.notifier.send.getCall(0).args[0];
      expect(eventData.event).toBe('login');
      expect(eventData.data.service).toBe('sync');
      expect(eventData.data.email).toBe(TEST_EMAIL);
      expect(eventData.data.userAgent).toBe('test user-agent');
      expect(eventData.data.country).toBe('United States');
      expect(eventData.data.countryCode).toBe('US');
      expect(eventData.data.ts).toBeTruthy();
      expect(eventData.data.metricsContext).toEqual({
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
      });

      expect(profile.deleteCache.callCount).toBe(1);
      expect(profile.deleteCache.getCall(0).args[0]).toBe(uid);

      eventData = mockLog.notifier.send.getCall(1).args[0];
      expect(eventData.event).toBe('profileDataChange');
      expect(eventData.data.uid).toBe(uid);

      expect(mockLog.activityEvent.callCount).toBe(1);
      args = mockLog.activityEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
        country: 'United States',
        event: 'account.created',
        region: 'California',
        service: 'sync',
        userAgent: 'test user-agent',
        uid: uid,
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockLog.flowEvent.callCount).toBe(1);
      args = mockLog.flowEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
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
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockMetricsContext.validate.callCount).toBe(1);
      expect(mockMetricsContext.validate.args[0].length).toBe(0);

      expect(mockMetricsContext.stash.callCount).toBe(3);

      args = mockMetricsContext.stash.args[0];
      expect(args.length).toBe(1);
      expect(args[0].id).toEqual(sessionTokenId);
      expect(args[0].uid).toEqual(uid);
      expect(mockMetricsContext.stash.thisValues[0]).toBe(mockRequest);

      args = mockMetricsContext.stash.args[1];
      expect(args.length).toBe(1);
      expect(args[0].id).toBe(emailCode);
      expect(args[0].uid).toEqual(uid);
      expect(mockMetricsContext.stash.thisValues[1]).toBe(mockRequest);

      args = mockMetricsContext.stash.args[2];
      expect(args.length).toBe(1);
      expect(args[0].id).toEqual(keyFetchTokenId);
      expect(args[0].uid).toEqual(uid);
      expect(mockMetricsContext.stash.thisValues[2]).toBe(mockRequest);

      expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(1);
      args = mockMetricsContext.setFlowCompleteSignal.args[0];
      expect(args.length).toBe(2);
      expect(args[0]).toBe('account.signed');
      expect(args[1]).toBe('registration');

      let securityEvent = mockDB.securityEvent;
      expect(securityEvent.callCount).toBe(1);
      securityEvent = securityEvent.args[0][0];
      expect(securityEvent.name).toBe('account.create');
      expect(securityEvent.uid).toBe(uid);
      expect(securityEvent.ipAddr).toBe(clientAddress);

      expect(mockFxaMailer.sendVerifyEmail.callCount).toBe(1);
      args = mockFxaMailer.sendVerifyEmail.args[0];
      expect(args[0].location.city).toBe('Mountain View');
      expect(args[0].location.country).toBe('United States');
      expect(args[0].acceptLanguage).toBe('en-US');
      expect(args[0].timeZone).toBe('America/Los_Angeles');
      expect(args[0].device.uaBrowser).toBe('Firefox Mobile');
      expect(args[0].device.uaOS).toBe('iOS');
      expect(args[0].device.uaOSVersion).toBe('11');
      expect(args[0].deviceId).toBe(
        mockRequest.payload.metricsContext.deviceId
      );
      expect(args[0].flowId).toBe(mockRequest.payload.metricsContext.flowId);
      expect(args[0].flowBeginTime).toBe(
        mockRequest.payload.metricsContext.flowBeginTime
      );
      expect(args[0].sync).toBe(true);
      expect(args[0].uid).toBe(uid);

      expect(verificationReminders.create.callCount).toBe(1);
      args = verificationReminders.create.args[0];
      expect(args).toHaveLength(3);
      expect(args[0]).toBe(uid);
      expect(args[1]).toBe(mockRequest.payload.metricsContext.flowId);
      expect(args[2]).toBe(mockRequest.payload.metricsContext.flowBeginTime);

      expect(mockLog.error.callCount).toBe(0);

      sinon.assert.calledOnce(glean.registration.accountCreated);
    }).finally(() => jest.useRealTimers());
  });

  it('should reject creation when email is reserved in Redis', async () => {
    const authServerCacheRedis = {
      get: async () => JSON.stringify({ uid: 'someone-else', secret: 'abc' }),
      del: async () => 1,
    };
    const { route, mockRequest } = setup({}, undefined, {
      authServerCacheRedis,
    });
    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: error.ERRNO.VERIFIED_SECONDARY_EMAIL_EXISTS,
      message: 'Email already exists',
    });
  });

  it('should create a non-sync account', () => {
    const {
      mockLog,
      mockRequest,
      route,
      uid,
      verificationReminders,
      mockFxaMailer,
    } = setup();

    const now = Date.now();
    jest.useFakeTimers();
    jest.setSystemTime(now);

    mockRequest.payload.service = 'foo';

    return runTest(route, mockRequest, () => {
      expect(mockLog.notifier.send.callCount).toBe(2);
      let eventData = mockLog.notifier.send.getCall(0).args[0];
      expect(eventData.event).toBe('login');
      expect(eventData.data.service).toBe('foo');

      expect(profile.deleteCache.callCount).toBe(1);
      expect(profile.deleteCache.getCall(0).args[0]).toBe(uid);

      eventData = mockLog.notifier.send.getCall(1).args[0];
      expect(eventData.event).toBe('profileDataChange');
      expect(eventData.data.uid).toBe(uid);

      expect(mockLog.activityEvent.callCount).toBe(1);
      let args = mockLog.activityEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
        country: 'United States',
        event: 'account.created',
        region: 'California',
        service: 'foo',
        userAgent: 'test user-agent',
        uid: uid,
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockFxaMailer.sendVerifyEmail.callCount).toBe(1);
      args = mockFxaMailer.sendVerifyEmail.args[0];
      expect(args[0].sync).toBe(false);

      sinon.assert.calledOnce(glean.registration.confirmationEmailSent);

      expect(verificationReminders.create.callCount).toBe(1);

      expect(mockLog.error.callCount).toBe(0);
    }).finally(() => jest.useRealTimers());
  });

  describe('should accept `verficationMethod`', () => {
    describe('email-otp', () => {
      it('should send sign-up code from `email-otp` method', async () => {
        const { config, emailCode, mockMailer, mockRequest, route } = setup();

        mockRequest.payload.verificationMethod = 'email-otp';

        await runTest(route, mockRequest, (res: any) => {
          sinon.assert.calledOnce(mockMailer.sendVerifyShortCodeEmail);

          const authenticator = new otplib.authenticator.Authenticator();
          authenticator.options = Object.assign(
            {},
            otplib.authenticator.options,
            config.otp,
            { secret: emailCode }
          );
          const expectedCode = authenticator.generate();
          const args = mockMailer.sendVerifyShortCodeEmail.args[0];
          expect(args[2].code).toBe(expectedCode);
          expect(args[2].acceptLanguage).toBe(mockRequest.app.acceptLanguage);

          expect(args[2].location).toBe(mockRequest.app.geo.location);

          expect(args[2].timeZone).toBe(mockRequest.app.geo.timeZone);

          expect(res.verificationMethod).toBe(
            mockRequest.payload.verificationMethod
          );
        });
      });
    });
  });

  it('should return an error if email fails to send', async () => {
    const { mockRequest, route, verificationReminders, mockFxaMailer } =
      setup();

    mockFxaMailer.sendVerifyEmail = sinon.spy(() => Promise.reject());

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      message: 'Failed to send email',
      output: {
        payload: {
          code: 422,
          errno: 151,
          error: 'Unprocessable Entity',
        },
      },
    });
    expect(verificationReminders.create.callCount).toBe(0);
  });

  it('should return a bounce error if send fails with one', async () => {
    const { mockRequest, route, verificationReminders, mockFxaMailer } =
      setup();

    mockFxaMailer.sendVerifyEmail = sinon.spy(() =>
      Promise.reject(error.emailBouncedHard(42))
    );

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      message: 'Email account hard bounced',
      output: {
        payload: {
          code: 400,
          errno: 134,
          error: 'Bad Request',
        },
      },
    });
    expect(verificationReminders.create.callCount).toBe(0);
  });

  it('can refuse new account creations for selected OAuth clients', async () => {
    const { mockRequest, route } = setup({
      oauth: {
        disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
      },
    });

    mockRequest.payload.service = 'd15ab1edd15ab1ed';

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      output: { statusCode: 503 },
      errno: error.ERRNO.DISABLED_CLIENT_ID,
    });
  });

  it('should use RP CMS email content for verify email', () => {
    rpConfigManager.fetchCMSData.resetHistory();
    const mockRequestOpts = (defaults: any) => ({
      ...defaults,
      payload: {
        ...defaults.payload,
        metricsContext: {
          ...defaults.payload.metricsContext,
          service: '00f00f',
          clientId: '00f00f',
          entrypoint: 'testo',
        },
        verificationMethod: 'email-otp',
      },
    });
    const { mockMailer, mockRequest, route } = setup({}, mockRequestOpts);

    const now = Date.now();
    jest.useFakeTimers();
    jest.setSystemTime(now);

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnce(mockMailer.sendVerifyShortCodeEmail);
      const args = mockMailer.sendVerifyShortCodeEmail.args[0];
      const emailMessage = args[2];
      expect(emailMessage.target).toBe('strapi');
      expect(emailMessage.cmsRpClientId).toBe('00f00f');
      expect(emailMessage.cmsRpFromName).toBe('Testo Inc.');
      expect(emailMessage.entrypoint).toBe('testo');
      expect(emailMessage.logoUrl).toBe('http://img.exmpl.gg/logo.svg');
      expect(emailMessage.subject).toBe('Verify Your Account');
      expect(emailMessage.headline).toBe('Enter code to verify');
      expect(emailMessage.description).toBe('Use code below and gogogo');
    }).finally(() => jest.useRealTimers());
  });
});

describe('/account/stub', () => {
  function setup(extraConfig?: any) {
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
        emailRecord: error.unknownAccount(),
      }
    );
    const mockMailer = mocks.mockMailer();
    mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
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
    return runTest(route, mockRequest, (response: any) => {
      expect(response.uid).toBe(uid);
      expect(response.access_token).toBeTruthy();
    });
  });

  it('can refuse new account creations for selected OAuth clients', async () => {
    const { mockRequest, route } = setup({
      oauth: {
        disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
      },
    });

    mockRequest.payload.clientId = 'd15ab1edd15ab1ed';

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: error.ERRNO.DISABLED_CLIENT_ID,
      output: { statusCode: 503 },
    });
  });

  it('rejects creating an account with an invalid email domain', async () => {
    const { route, mockRequest } = setup();
    mockRequest.payload.email = 'test@bad.domain';

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: error.ERRNO.ACCOUNT_CREATION_REJECTED,
    });
  });
});

describe('/account/status', () => {
  function setup(
    { extraConfig = {}, dbOptions = {}, shouldError = true }: any = {},
    makeRoutesOptions: any = {}
  ) {
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
          emailRecord: error.unknownAccount(),
        }),
      }
    );
    const mockMailer = mocks.mockMailer();
    mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
    const mockPush = mocks.mockPush();
    const mockCustoms = mocks.mockCustoms();
    const verificationReminders = mocks.mockVerificationReminders();
    const subscriptionAccountReminders = mocks.mockVerificationReminders();
    const accountRoutes = makeRoutes({
      config,
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      customs: mockCustoms,
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
      ...makeRoutesOptions,
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

    return runTest(route, mockRequest, (response: any) => {
      expect(response.invalidDomain).toBe(false);
    });
  });

  it('rejects with EMAIL_EXISTS when reserved in Redis', async () => {
    const authServerCacheRedis = {
      get: async () => JSON.stringify({ uid: 'someone-else', secret: 'zzz' }),
      del: async () => 1,
    };
    const { route, mockRequest } = setup({}, { authServerCacheRedis });
    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: error.ERRNO.VERIFIED_SECONDARY_EMAIL_EXISTS,
      message: 'Email already exists',
    });
  });

  it('returns invalid for an invalid email domain', async () => {
    const { route, mockRequest } = setup();
    mockRequest.payload.email = 'test@bad.domain';

    return runTest(route, mockRequest, (response: any) => {
      expect(response.invalidDomain).toBe(true);
    });
  });

  it('does not check domain if not requested to do so', async () => {
    const { route, mockRequest } = setup();
    mockRequest.payload.checkDomain = false;

    return runTest(route, mockRequest, (response: any) => {
      expect(response.invalidDomain).toBeUndefined();
    });
  });

  it('calls accountRecord and returns expected values when thirdPartyAuthStatus is requested', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        linkedAccounts: [{}],
        verifierSetAt: 0,
      },
      shouldError: false,
      extraConfig: {
        passwordlessOtp: {
          forcedEmailAddresses: /^$/,
          allowedClientIds: [],
        },
      },
    });
    mockRequest.payload.thirdPartyAuthStatus = true;

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(mockDB.accountExists.callCount).toBe(0);

      expect(response.exists).toBe(true);
      expect(response.hasLinkedAccount).toBe(true);
      expect(response.hasPassword).toBe(false);
    });
  });

  it('calls accountExists when thirdPartyAuthStatus is not requested', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: { exists: false },
    });

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(0);
      expect(mockDB.accountExists.callCount).toBe(1);

      expect(response.exists).toBe(false);
      expect(response.linkedAccounts).toBeUndefined();
      expect(response.hasPassword).toBeUndefined();
    });
  });

  it('returns passwordlessSupported true for existing passwordless account (no password, no linked account)', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        verifierSetAt: 0,
      },
      shouldError: false,
      extraConfig: {
        passwordlessOtp: {
          enabled: true,
          allowedClientIds: ['test-client-id'],
        },
      },
    });
    mockRequest.payload.thirdPartyAuthStatus = true;
    mockRequest.payload.clientId = 'test-client-id';

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(response.exists).toBe(true);
      expect(response.hasPassword).toBe(false);
      expect(response.passwordlessSupported).toBe(true);
    });
  });

  it('returns passwordlessSupported false for third-party auth account (verifierSetAt=0 with linkedAccounts) when thirdPartyAuthStatus is requested', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        linkedAccounts: [{}],
        verifierSetAt: 0,
      },
      shouldError: false,
      extraConfig: {
        passwordlessOtp: {
          enabled: true,
          allowedClientIds: ['test-client-id'],
        },
      },
    });
    mockRequest.payload.thirdPartyAuthStatus = true;
    mockRequest.payload.clientId = 'test-client-id';

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(response.exists).toBe(true);
      expect(response.hasPassword).toBe(false);
      expect(response.passwordlessSupported).toBe(false);
    });
  });

  it('returns passwordlessSupported false for existing account with password when thirdPartyAuthStatus is requested', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        linkedAccounts: [{}],
        verifierSetAt: Date.now(),
      },
      shouldError: false,
      extraConfig: {
        passwordlessOtp: {
          forcedEmailAddresses: /^$/,
          allowedClientIds: [],
        },
      },
    });
    mockRequest.payload.thirdPartyAuthStatus = true;

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(response.exists).toBe(true);
      expect(response.hasPassword).toBe(true);
      expect(response.passwordlessSupported).toBe(false);
    });
  });

  it('returns passwordlessSupported true for non-existing account when globally enabled', async () => {
    const { route, mockRequest } = setup({
      extraConfig: {
        passwordlessOtp: {
          enabled: true,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
      shouldError: true,
    });
    mockRequest.payload.thirdPartyAuthStatus = true;
    mockRequest.payload.clientId = 'test-client-id';

    return runTest(route, mockRequest, (response: any) => {
      expect(response.exists).toBe(false);
      expect(response.passwordlessSupported).toBe(true);
    });
  });

  it('returns passwordlessSupported false for non-existing account when not enabled', async () => {
    const { route, mockRequest } = setup({
      extraConfig: {
        passwordlessOtp: {
          enabled: false,
        },
      },
      shouldError: true,
    });
    mockRequest.payload.email = 'regular@example.com';
    mockRequest.payload.thirdPartyAuthStatus = true;

    return runTest(route, mockRequest, (response: any) => {
      expect(response.exists).toBe(false);
      expect(response.passwordlessSupported).toBe(false);
    });
  });

  it('does not return passwordlessSupported when thirdPartyAuthStatus is not requested', async () => {
    const { route, mockRequest } = setup({
      dbOptions: { exists: false },
    });
    mockRequest.payload.thirdPartyAuthStatus = false;

    return runTest(route, mockRequest, (response: any) => {
      expect(response.exists).toBe(false);
      expect(response.passwordlessSupported).toBeUndefined();
    });
  });

  it('returns passwordlessSupported true for existing passwordless account even when flag OFF', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        linkedAccounts: [],
        verifierSetAt: 0,
      },
      shouldError: false,
      extraConfig: {
        passwordlessOtp: {
          enabled: false,
          allowedClientIds: [],
        },
      },
    });
    mockRequest.payload.thirdPartyAuthStatus = true;

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(response.exists).toBe(true);
      expect(response.hasPassword).toBe(false);
      expect(response.passwordlessSupported).toBe(true);
    });
  });

  it('returns passwordlessSupported true for existing passwordless account with mismatched clientId', async () => {
    const { route, mockRequest, mockDB } = setup({
      dbOptions: {
        linkedAccounts: [],
        verifierSetAt: 0,
      },
      shouldError: false,
      extraConfig: {
        passwordlessOtp: {
          enabled: true,
          allowedClientIds: ['some-other-client'],
        },
      },
    });
    mockRequest.payload.thirdPartyAuthStatus = true;
    mockRequest.payload.clientId = 'not-in-allowlist';

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(response.exists).toBe(true);
      expect(response.hasPassword).toBe(false);
      expect(response.passwordlessSupported).toBe(true);
    });
  });
});

describe('/account/finish_setup', () => {
  function setup(options: any) {
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
        emailRecord: error.unknownAccount(),
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
          verify: jest.fn().mockReturnValue(Promise.resolve({ uid })),
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
    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.verifyEmail.callCount).toBe(1);
      expect(mockDB.resetAccount.callCount).toBe(1);
      expect(response.sessionToken).toBeTruthy();
      expect(response.uid).toBe(uid);
    });
  });

  it('returns an unauthorized error when the account is already set up', async () => {
    const { route, mockRequest } = setup({
      verifierSetAt: Date.now(),
    });
    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: 110,
    });
  });

  it('removes the reminder if it errors after account is verified', async () => {
    const { route, mockRequest, subscriptionAccountReminders } = setup({
      verifierSetAt: Date.now(),
    });

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: 110,
    });
    sinon.assert.calledOnce(subscriptionAccountReminders.delete);
  });
});

describe('/account/set_password', () => {
  function setup(options: any) {
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
        emailRecord: error.unknownAccount(),
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
      allProducts: jest.fn().mockResolvedValue([fakeProduct]),
      allPlans: jest.fn().mockResolvedValue([fakePlan]),
    };
    const mockCapabilityService = options.mockCapabilityService || {
      subscribedPriceIds: jest.fn().mockResolvedValue([fakePlan.id]),
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
        sendVerifyEmail: true,
      },
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.resetAccount.callCount).toBe(1);
      expect(mockMailer.sendVerifyShortCodeEmail.callCount).toBe(1);
      sinon.assert.calledOnce(subscriptionAccountReminders.create);
      expect(response.sessionToken).toBeTruthy();
      expect(response.uid).toBe(uid);
    });
  });

  it('returns an unauthorized error when the account is already set up', async () => {
    const { route, mockRequest } = setup({
      verifierSetAt: Date.now(),
    });
    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: 110,
    });
  });

  it('does not send the verify email if query parameter is set to false', async () => {
    const { route, mockRequest, mockMailer, uid } = setup({
      query: {
        sendVerifyEmail: false,
      },
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response: any) => {
      sinon.assert.notCalled(mockMailer.sendVerifyShortCodeEmail);
      expect(response.sessionToken).toBeTruthy();
      expect(response.uid).toBe(uid);
    });
  });

  it('does not create a reminder if product is undefined', () => {
    const mockStripeHelper = {
      allProducts: jest.fn().mockResolvedValue([]),
      allPlans: jest.fn().mockResolvedValue([]),
    };
    const { route, mockRequest, subscriptionAccountReminders, uid } = setup({
      mockStripeHelper,
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response: any) => {
      sinon.assert.notCalled(subscriptionAccountReminders.create);
      expect(response.sessionToken).toBeTruthy();
      expect(response.uid).toBe(uid);
    });
  });

  it('does not create a reminder if product is invalid', () => {
    const fakeProduct = { otherProp: 'fun' };
    const fakePlan = {
      id: 'price_123',
      product: fakeProduct,
    };
    const mockStripeHelper = {
      allProducts: jest.fn().mockResolvedValue([fakeProduct]),
      allPlans: jest.fn().mockResolvedValue([fakePlan]),
    };
    const { route, mockRequest, subscriptionAccountReminders, uid } = setup({
      mockStripeHelper,
      verifierSetAt: 0,
    });
    return runTest(route, mockRequest, (response: any) => {
      sinon.assert.notCalled(subscriptionAccountReminders.create);
      expect(response.sessionToken).toBeTruthy();
      expect(response.uid).toBe(uid);
    });
  });
});

describe('/account/login', () => {
  const config: any = {
    securityHistory: {
      ipProfiling: {},
    },
    signinConfirmation: {},
    signinUnblock: {
      codeLifetime: 1000,
    },
    servicesWithEmailVerification: [],
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
      'x-sigsci-requestid': 'test-sigsci-id',
      'client-ja4': 'test-ja4',
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
      service: undefined,
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
    clientAddress: '127.0.0.1',
  });
  const mockRequestWithRpCmsConfig = mocks.mockRequest({
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
        service: '00f00f',
        clientId: '00f00f',
        entrypoint: 'testo',
      },
    },
    query: {},
  });
  const keyFetchTokenId = hexString(16);
  const sessionTokenId = hexString(16);
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    emailVerified: true,
    emailCode: 'ab12cd34',
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
  const mockFxaMailer = mocks.mockFxaMailer();
  const mockOAuthClientInfo = mocks.mockOAuthClientInfo();

  const mockPush = mocks.mockPush();
  const mockCustoms: any = {
    v2Enabled: () => true,
    check: () => Promise.resolve(),
    checkAuthenticated: () => Promise.resolve(),
    flag: () => Promise.resolve(),
    resetV2: () => Promise.resolve(),
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
    Container.set(AppConfig, config);
    Container.set(AuthLogger, mockLog);
    Container.set(
      AccountEventsManager,
      new AccountEventsManager()
    );
    Container.set(CapabilityService, jest.fn().mockResolvedValue(undefined));
    Container.set(OAuthClientInfoServiceName, mockOAuthClientInfo);
    Container.set(FxaMailer, mockFxaMailer);
    Container.set(RelyingPartyConfigurationManager, rpConfigManager);
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
    // some tests change what these resolve (or reject) to, so we completely reset
    mockFxaMailer.sendNewDeviceLoginEmail = sinon.stub().resolves();
    mockFxaMailer.sendVerifyEmail = sinon.stub().resolves();
    mockFxaMailer.sendVerifyLoginEmail = sinon.stub().resolves();
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
    mockDB.verifiedLoginSecurityEvents.resetHistory();
    if (mockDB.securityEvent && mockDB.securityEvent.resetHistory) {
      mockDB.securityEvent.resetHistory();
    }
    Container.reset();
  });

  it('emits the correct series of calls and events', () => {
    const now = Date.now();
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);

    return runTest(route, mockRequest, (response: any) => {
      expect(mockDB.accountRecord.callCount).toBe(1);

      expect(mockDB.createSessionToken.callCount).toBe(1);
      let args = mockDB.createSessionToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0].uaBrowser).toBe('Firefox');
      expect(args[0].uaBrowserVersion).toBe('50');
      expect(args[0].uaOS).toBe('Android');
      expect(args[0].uaOSVersion).toBe('6');
      expect(args[0].uaDeviceType).toBe('mobile');
      expect(args[0].uaFormFactor).toBeNull();

      expect(mockLog.notifier.send.callCount).toBe(1);
      const eventData = mockLog.notifier.send.getCall(0).args[0];
      expect(eventData.event).toBe('login');
      expect(eventData.data.service).toBe('sync');
      expect(eventData.data.email).toBe(TEST_EMAIL);
      expect(eventData.data.ts).toBeTruthy();
      expect(eventData.data.metricsContext).toEqual({
        time: now,
        flow_id: mockRequest.payload.metricsContext.flowId,
        flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
        flowBeginTime: mockRequest.payload.metricsContext.flowBeginTime,
        flowCompleteSignal: 'account.signed',
        flowType: undefined,
      });

      expect(mockLog.activityEvent.callCount).toBe(1);
      args = mockLog.activityEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
        country: 'United States',
        event: 'account.login',
        region: 'California',
        service: 'sync',
        userAgent: 'test user-agent',
        uid: uid,
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockLog.flowEvent.callCount).toBe(2);
      args = mockLog.flowEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
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
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });
      args = mockLog.flowEvent.args[1];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
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
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });

      expect(mockMetricsContext.validate.callCount).toBe(1);
      expect(mockMetricsContext.validate.args[0].length).toBe(0);

      expect(mockMetricsContext.stash.callCount).toBe(3);

      args = mockMetricsContext.stash.args[0];
      expect(args.length).toBe(1);
      expect(args[0].id).toEqual(sessionTokenId);
      expect(args[0].uid).toEqual(uid);
      expect(mockMetricsContext.stash.thisValues[0]).toBe(mockRequest);

      args = mockMetricsContext.stash.args[1];
      expect(args.length).toBe(1);
      expect(args[0].id).toMatch(/^[0-9a-f]{32}$/);
      expect(args[0].uid).toEqual(uid);
      expect(mockMetricsContext.stash.thisValues[1]).toBe(mockRequest);

      args = mockMetricsContext.stash.args[2];
      expect(args.length).toBe(1);
      expect(args[0].id).toEqual(keyFetchTokenId);
      expect(args[0].uid).toEqual(uid);
      expect(mockMetricsContext.stash.thisValues[2]).toBe(mockRequest);

      expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(1);
      args = mockMetricsContext.setFlowCompleteSignal.args[0];
      expect(args.length).toBe(2);
      expect(args[0]).toBe('account.signed');
      expect(args[1]).toBe('login');

      expect(mockFxaMailer.sendVerifyLoginEmail.callCount).toBe(1);
      args = mockFxaMailer.sendVerifyLoginEmail.args[0];
      expect(args[0].acceptLanguage).toBe('en-US');
      expect(args[0].location.city).toBe('Mountain View');
      expect(args[0].location.country).toBe('United States');
      expect(args[0].timeZone).toBe('America/Los_Angeles');
      expect(args[0].device.uaBrowser).toBe('Firefox');
      expect(args[0].device.uaOS).toBe('Android');
      expect(args[0].device.uaOSVersion).toBe('6');
      expect(args[0].deviceId).toBe(
        mockRequest.payload.metricsContext.deviceId
      );
      expect(args[0].flowId).toBe(mockRequest.payload.metricsContext.flowId);
      expect(args[0].flowBeginTime).toBe(
        mockRequest.payload.metricsContext.flowBeginTime
      );
      expect(args[0].sync).toBe(true);
      expect(args[0].uid).toBe(uid);

      expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
      expect(response.verified).toBeFalsy();
      expect(response.verificationMethod).toBe('email');
      expect(response.verificationReason).toBe('login');
    }).finally(() => dateNowSpy.mockRestore());
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

      return runTest(route, mockRequest, (response: any) => {
        expect(mockFxaMailer.sendVerifyEmail.callCount).toBe(1);

        // Verify that the email code was sent
        const verifyCallArgs = mockFxaMailer.sendVerifyEmail.getCall(0).args;
        expect(verifyCallArgs[0].code).not.toBe(emailCode);
        expect(mockLog.flowEvent.callCount).toBe(2);
        expect(mockLog.flowEvent.args[0][0].event).toBe('account.login');
        expect(mockLog.flowEvent.args[1][0].event).toBe(
          'email.verification.sent'
        );
        expect(mockMailer.sendVerifyLoginEmail.callCount).toBe(0);
        expect(mockMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(response.emailVerified).toBe(false);
        expect(response.verified).toBe(false);
        expect(response.verificationMethod).toBe('email');
        expect(response.verificationReason).toBe('signup');
      });
    });
  });

  describe('sign-in confirmation', () => {
    beforeAll(() => {
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
            emailCode: 'ab12cd34',
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
      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.createSessionToken.callCount).toBe(1);
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        expect(tokenData.mustVerify).toBeTruthy();
        expect(tokenData.tokenVerificationId).toBeTruthy();
        expect(mockMailer.sendVerifyEmail.callCount).toBe(0);
        expect(mockMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(response.verified).toBeFalsy();
        expect(response.verificationMethod).toBe('email');
        expect(response.verificationReason).toBe('login');

        expect(mockFxaMailer.sendVerifyLoginEmail.callCount).toBe(1);
        const args = mockFxaMailer.sendVerifyLoginEmail.getCall(0).args[0];
        expect(args.acceptLanguage).toBe('en-US');
        expect(args.location.city).toBe('Mountain View');
        expect(args.location.country).toBe('United States');
        expect(args.timeZone).toBe('America/Los_Angeles');
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

      return runTest(route, mockRequestSuspect, (response: any) => {
        expect(mockDB.createSessionToken.callCount).toBe(1);
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        expect(tokenData.mustVerify).toBeTruthy();
        expect(tokenData.tokenVerificationId).toBeTruthy();
        expect(mockMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(mockFxaMailer.sendVerifyLoginEmail.callCount).toBe(1);

        expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(1);
        expect(
          mockMetricsContext.setFlowCompleteSignal.args[0][0]
        ).toEqual('account.confirmed');

        expect(response.verified).toBeFalsy();
        expect(response.verificationMethod).toBe('email');
        expect(response.verificationReason).toBe('login');
      });
    });

    it('does not require verification when session is verified', () => {
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
      const originalCreateSessionToken = mockDB.createSessionToken;
      mockDB.createSessionToken = sinon.spy(async (opts: any) => {
        const result = await originalCreateSessionToken(opts);
        result.tokenVerificationId = null;
        result.tokenVerified = true;
        return result;
      });

      return runTest(route, mockRequestNoKeys, (response: any) => {
        expect(mockDB.createSessionToken.callCount).toBe(1);
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        expect(tokenData.mustVerify).toBeTruthy();
        const sessionToken = mockDB.createSessionToken.returnValues[0];
        sessionToken.then((token: any) => {
          expect(token.tokenVerificationId).toBeFalsy();
          expect(token.tokenVerified).toBeTruthy();
        });
        expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
        expect(mockMailer.sendVerifyLoginEmail.callCount).toBe(0);

        expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(1);
        expect(mockMetricsContext.setFlowCompleteSignal.args[0][0]).toEqual(
          'account.login'
        );

        expect(response.emailVerified).toBeTruthy();
        expect(response.sessionVerified).toBeTruthy();
        expect(response.verified).toBeTruthy();
        expect(response.verificationMethod).toBeFalsy();
        expect(response.verificationReason).toBeFalsy();

        // Restore the original function
        mockDB.createSessionToken = originalCreateSessionToken;
      });
    });

    // Regression test: when a session is unverified but mustVerify=false (e.g. a non-sync
    // login for an older account), the newDeviceLogin email must NOT be sent during login.
    // It will be sent by session.js:verify_code after the user completes token verification.
    // Previously the condition `tokenVerified || !mustVerify` would send it here too,
    // resulting in two emails.
    it('does not send new device login email during login when session is unverified (deferred to verify_code)', () => {
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

      // Simulate an unverified session state. This will suppress the sending of
      // a 'new device login' email.
      const originalCreateSessionToken = mockDB.createSessionToken;
      mockDB.createSessionToken = sinon.spy(async (opts: any) => {
        const result = await originalCreateSessionToken(opts);
        result.tokenVerificationId = hexString(16);
        result.tokenVerified = false;
        return result;
      });

      return runTest(route, mockRequestNoKeys, (response: any) => {
        mockDB.createSessionToken = originalCreateSessionToken;

        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        expect(tokenData.tokenVerificationId).toBeTruthy();
        // newDeviceLogin email must NOT be sent during login when the session is
        // unverified — it will be sent by session.js:verify_code after verification.
        expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(response.verified).toBeFalsy();

        // Restore the original function
        mockDB.createSessionToken = originalCreateSessionToken;
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

      return runTest(route, mockRequestNoKeys, (response: any) => {
        expect(mockDB.createSessionToken.callCount).toBe(1);
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        expect(tokenData.mustVerify).toBeTruthy();
        expect(tokenData.tokenVerificationId).toBeTruthy();
        expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(mockFxaMailer.sendVerifyLoginCodeEmail.callCount).toBe(1);

        expect(mockMetricsContext.setFlowCompleteSignal.callCount).toBe(1);
        expect(mockMetricsContext.setFlowCompleteSignal.args[0][0]).toEqual(
          'account.confirmed'
        );

        expect(response.verified).toBeFalsy();
        expect(response.verificationMethod).toBe('email-otp');
        expect(response.verificationReason).toBe('change_password');
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

      return runTest(route, mockRequestNoKeys, (response: any) => {
        expect(response.verified).toBeFalsy();
        expect(response.verificationMethod).toBe('email-otp');
        expect(response.verificationReason).toBe('change_password');
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

      return runTest(route, mockRequest, (response: any) => {
        expect(mockDB.createSessionToken.callCount).toBe(1);
        const tokenData = mockDB.createSessionToken.getCall(0).args[0];
        expect(tokenData.mustVerify).toBeTruthy();
        expect(tokenData.tokenVerificationId).toBeTruthy();
        expect(mockFxaMailer.sendVerifyEmail.callCount).toBe(1);
        expect(mockMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(mockMailer.sendVerifyLoginEmail.callCount).toBe(0);
        expect(response.verified).toBeFalsy();
        expect(response.verificationMethod).toBe('email');
        expect(response.verificationReason).toBe('signup');
      });
    });

    it('should return an error if email fails to send', async () => {
      mockFxaMailer.sendVerifyLoginEmail = sinon.spy(() => Promise.reject());

      await expect(runTest(route, mockRequest)).rejects.toMatchObject({
        message: 'Failed to send email',
        output: {
          payload: {
            code: 500,
            errno: 151,
            error: 'Internal Server Error',
          },
        },
      });
    });

    describe('skip for new accounts', () => {
      function setupSkipNewAccounts(enabled: any, accountCreatedSince: any, makeRoutesOptions: any = {}) {
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

        const innerAccountRoutes = makeRoutes({
          ...makeRoutesOptions,
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

        route = getRoute(innerAccountRoutes, '/account/login');
      }

      it('is disabled', () => {
        setupSkipNewAccounts(false, 0);

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.mustVerify).toBeTruthy();
          expect(tokenData.tokenVerificationId).toBeTruthy();
          expect(mockFxaMailer.sendVerifyEmail.callCount).toBe(0);
          expect(mockMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
          expect(response.verified).toBeFalsy();
          expect(response.verificationMethod).toBe('email');
          expect(response.verificationReason).toBe('login');

          expect(mockFxaMailer.sendVerifyLoginEmail.callCount).toBe(1);
          const sendVerifyLoginEmailArgs =
            mockFxaMailer.sendVerifyLoginEmail.getCall(0).args[0];
          expect(sendVerifyLoginEmailArgs.acceptLanguage).toBe('en-US');
          expect(sendVerifyLoginEmailArgs.location.city).toBe('Mountain View');
          expect(sendVerifyLoginEmailArgs.location.country).toBe(
            'United States'
          );
          expect(sendVerifyLoginEmailArgs.timeZone).toBe(
            'America/Los_Angeles'
          );
        });
      });

      it('skip sign-in confirmation on recently created account', () => {
        setupSkipNewAccounts(true, 0);

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeFalsy();
          expect(mockMailer.sendVerifyEmail.callCount).toBe(0);
          expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
          expect(response.emailVerified).toBeTruthy();

          expect(mockCadReminders.delete.callCount).toBe(1);

          sinon.assert.calledOnce(glean.login.success);
        });
      });

      it("don't skip sign-in confirmation on older account", () => {
        setupSkipNewAccounts(true, 10);

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeTruthy();
          expect(mockFxaMailer.sendVerifyLoginEmail.callCount).toBe(1);
          expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
          expect(response.verified).toBeFalsy();
        });
      });

      it('do not error if new device login notification is blocked', () => {
        setupSkipNewAccounts(true, 0);

        mockMailer.sendNewDeviceLoginEmail = sinon.spy(() =>
          Promise.reject(error.emailBouncedHard())
        );

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeFalsy();
          expect(mockFxaMailer.sendVerifyEmail.callCount).toBe(0);
          expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
          expect(
            mockFxaMailer.sendNewDeviceLoginEmail.args[0][0].deviceId
          ).toBe(mockRequest.payload.metricsContext.deviceId);
          expect(
            mockFxaMailer.sendNewDeviceLoginEmail.args[0][0].flowId
          ).toBe(mockRequest.payload.metricsContext.flowId);
          expect(
            mockFxaMailer.sendNewDeviceLoginEmail.args[0][0].flowBeginTime
          ).toBe(mockRequest.payload.metricsContext.flowBeginTime);
          expect(
            mockFxaMailer.sendNewDeviceLoginEmail.args[0][0].sync
          ).toBe(true);
          expect(
            mockFxaMailer.sendNewDeviceLoginEmail.args[0][0].uid
          ).toBe(uid);
          expect(response.emailVerified).toBeTruthy();
        });
      });

      it('logs metrics when accountAge is under maxAge config threshold', () => {
        glean.loginConfirmSkipFor.newAccount.reset();

        const mockAccountEventsManager = {
          recordSecurityEvent: sinon.fake(),
        };
        setupSkipNewAccounts(true, 0, { mockAccountEventsManager });

        return runTest(route, mockRequest, () => {
          sinon.assert.calledOnce(glean.loginConfirmSkipFor.newAccount);
          sinon.assert.calledWith(
            statsd.increment,
            'account.signin.confirm.bypass.newAccount'
          );
          sinon.assert.calledWithMatch(
            mockAccountEventsManager.recordSecurityEvent,
            mockDB,
            sinon.match({
              name: 'account.signin_confirm_bypass_new_account',
              uid,
              ipAddr: mockRequest.app.clientAddress,
              additionalInfo: {
                userAgent: mockRequest.headers['user-agent'],
                location: mockRequest.app.geo.location,
              },
            })
          );
        });
      });

      it('logs metrics when sign-in ipProfiling is allowed and a known ip address is used within threshold', () => {
        glean.loginConfirmSkipFor.knownIp.reset();
        config.securityHistory.ipProfiling.allowedRecency = 1 * 60 * 1000; // 1 minute
        mockDB.verifiedLoginSecurityEvents = sinon.spy(() => {
          return Promise.resolve([
            {
              name: 'account.login',
              createdAt: Date.now(),
              verified: true,
            },
          ]);
        });
        const mockAccountEventsManager = {
          recordSecurityEvent: sinon.fake(),
        };
        setupSkipNewAccounts(true, 0, { mockAccountEventsManager });

        return runTest(route, mockRequest, () => {
          expect(mockDB.verifiedLoginSecurityEvents.callCount).toBe(1);

          sinon.assert.called(glean.loginConfirmSkipFor.knownIp);
          sinon.assert.calledWithMatch(
            mockAccountEventsManager.recordSecurityEvent,
            mockDB,
            sinon.match({
              name: 'account.signin_confirm_bypass_known_ip',
              uid,
              ipAddr: mockRequest.app.clientAddress,
              additionalInfo: {
                userAgent: mockRequest.headers['user-agent'],
                location: mockRequest.app.geo.location,
              },
            })
          );
        });
      });
    });

    describe('skip for emails', () => {
      function setupSkipForEmails(email: string) {
        config.securityHistory.ipProfiling.allowedRecency = 0;
        config.signinConfirmation.skipForNewAccounts = { enabled: false };
        config.signinConfirmation.skipForEmailAddresses = [
          'skip@confirmation.com',
          'other@email.com',
        ];

        // Reset the spy to avoid leaking state between tests
        mockDB.verifiedLoginSecurityEvents = sinon.spy(() =>
          Promise.resolve([])
        );

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

        const innerAccountRoutes = makeRoutes({
          checkPassword: () => Promise.resolve(true),
          config,
          customs: mockCustoms,
          db: mockDB,
          log: mockLog,
          mailer: mockMailer,
          push: mockPush,
        });

        route = getRoute(innerAccountRoutes, '/account/login');
      }

      afterEach(() => {
        // Restore config to default to avoid leaking into subsequent tests
        config.securityHistory.ipProfiling.allowedRecency =
          defaultConfig.securityHistory.ipProfiling.allowedRecency;
      });

      it('should not skip sign-in confirmation for specified email', () => {
        setupSkipForEmails('not@skip.com');

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeTruthy();
          expect(mockFxaMailer.sendVerifyLoginEmail.callCount).toBe(1);
          expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
          expect(response.verified).toBeFalsy();
        });
      });

      it('should skip sign-in confirmation for specified email', () => {
        setupSkipForEmails('skip@confirmation.com');

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeFalsy();
          expect(mockMailer.sendVerifyLoginEmail.callCount).toBe(0);
          expect(mockFxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
          expect(response.emailVerified).toBeTruthy();
        });
      });
    });

    it('logs a Glean ping on verify login code email sent', () => {
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

    describe('skip for email regex', () => {
      function setupSkipForEmailRegex(email: string, regex: RegExp) {
        config.securityHistory.ipProfiling.allowedRecency = 0;
        config.signinConfirmation.skipForNewAccounts = { enabled: false };
        config.signinConfirmation.skipForEmailAddresses = [];
        config.signinConfirmation.skipForEmailRegex = regex;

        mockDB.verifiedLoginSecurityEvents = sinon.spy(() =>
          Promise.resolve([])
        );

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

        const innerAccountRoutes = makeRoutes({
          checkPassword: () => Promise.resolve(true),
          config,
          customs: mockCustoms,
          db: mockDB,
          log: mockLog,
          mailer: mockMailer,
          push: mockPush,
        });

        route = getRoute(innerAccountRoutes, '/account/login');
      }

      afterEach(() => {
        config.securityHistory.ipProfiling.allowedRecency =
          defaultConfig.securityHistory.ipProfiling.allowedRecency;
        config.signinConfirmation.skipForEmailRegex = /^$/;
      });

      it('should skip sign-in confirmation for email matching regex', () => {
        setupSkipForEmailRegex('qa-test@example.com', /.+@example\.com$/);

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeFalsy();
          expect(response.emailVerified).toBeTruthy();
        });
      });

      it('should not skip sign-in confirmation for email not matching regex', () => {
        setupSkipForEmailRegex('user@other.com', /.+@example\.com$/);

        return runTest(route, mockRequest, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.tokenVerificationId).toBeTruthy();
          expect(response.verified).toBeFalsy();
        });
      });
    });

    describe('skip for known device', () => {
      let mockAccountEventsManager: any;
      let savedIpProfiling: any;
      let savedRoute: any;

      beforeEach(() => {
        savedIpProfiling = config.securityHistory.ipProfiling;
        savedRoute = route;
        config.securityHistory.ipProfiling = {};
        config.signinConfirmation.skipForNewAccounts = { enabled: false };
        config.signinConfirmation.deviceFingerprinting = {
          enabled: true,
          reportOnlyMode: false,
          duration: 604800000, // 7 days
        };

        const email = mockRequest.payload.email;

        mockDB.accountRecord = function () {
          return Promise.resolve({
            authSalt: hexString(32),
            createdAt: Date.now(),
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

        mockAccountEventsManager = {
          recordSecurityEvent: sinon.fake(),
        };

        const innerAccountRoutes = makeRoutes({
          checkPassword: function () {
            return Promise.resolve(true);
          },
          config: {
            ...config,
            oauth: {
              ...config.oauth,
              openid: {
                key: 'test-key',
              },
            },
          },
          customs: mockCustoms,
          db: mockDB,
          log: mockLog,
          mailer: mockMailer,
          push: mockPush,
          cadReminders: mockCadReminders,
          mockAccountEventsManager: mockAccountEventsManager,
        });

        route = getRoute(innerAccountRoutes, '/account/login');
      });

      afterEach(() => {
        config.securityHistory.ipProfiling = savedIpProfiling;
        route = savedRoute;
      });

      it('should skip verification when device is recognized and not in report-only mode', () => {
        mockDB.verifiedLoginSecurityEventsByUid = sinon.spy(() =>
          Promise.resolve([
            {
              name: 'account.login',
              verified: true,
              createdAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
              additionalInfo: JSON.stringify({
                userAgent:
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: { country: 'US', state: 'CA' },
              }),
            },
          ])
        );

        const requestWithUserAgent = {
          ...mockRequest,
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        };

        return runTest(route, requestWithUserAgent, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.mustVerify).toBeFalsy();
          expect(response.sessionVerified).toBeTruthy();

          sinon.assert.calledWith(
            statsd.increment,
            'account.signin.confirm.bypass.knownDevice'
          );

          sinon.assert.calledWithMatch(
            mockAccountEventsManager.recordSecurityEvent,
            mockDB,
            sinon.match({
              name: 'account.signin_confirm_bypass_known_device',
              uid: uid,
              ipAddr: requestWithUserAgent.app.clientAddress,
              tokenId: undefined,
              additionalInfo: {
                userAgent:
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: requestWithUserAgent.app.geo.location,
              },
            })
          );
        });
      });

      it('should not skip verification when device is not recognized', () => {
        mockDB.verifiedLoginSecurityEventsByUid = sinon.spy(() =>
          Promise.resolve([])
        );

        const requestWithDifferentUserAgent = {
          ...mockRequest,
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        };

        return runTest(route, requestWithDifferentUserAgent, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.mustVerify).toBeTruthy();
          expect(response.verified).toBeFalsy();

          sinon.assert.calledWith(
            statsd.increment,
            'account.signin.confirm.device.notfound'
          );
        });
      });

      it('should not skip verification when in report-only mode', () => {
        config.signinConfirmation.deviceFingerprinting.reportOnlyMode = true;

        mockDB.verifiedLoginSecurityEventsByUid = sinon.spy(() =>
          Promise.resolve([
            {
              name: 'account.login',
              verified: true,
              createdAt: Date.now() - 60 * 60 * 1000,
              additionalInfo: JSON.stringify({
                userAgent:
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: { country: 'US', state: 'CA' },
              }),
            },
          ])
        );

        const requestWithUserAgent = {
          ...mockRequest,
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        };

        return runTest(route, requestWithUserAgent, (response: any) => {
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.mustVerify).toBeTruthy();
          expect(response.verified).toBeFalsy();

          // StatsD metric is emitted for report-only mode (non-enforcing)
          sinon.assert.calledWith(
            statsd.increment,
            'account.signin.confirm.bypass.knownDevice.reportOnly'
          );
        });
      });

      it('should handle errors gracefully and continue to existing logic', () => {
        mockDB.verifiedLoginSecurityEventsByUid = sinon.spy(() =>
          Promise.reject(new Error('Database connection failed'))
        );

        return runTest(route, mockRequest, () => {
          // Should continue to existing verification logic despite fingerprinting error
          expect(mockDB.createSessionToken.callCount).toBe(1);
          const tokenData = mockDB.createSessionToken.getCall(0).args[0];
          expect(tokenData.mustVerify).toBeTruthy();
        });
      });

      it('should not call device fingerprinting when disabled', () => {
        config.signinConfirmation.deviceFingerprinting.enabled = false;

        const originalSpy = mockDB.verifiedLoginSecurityEventsByUid;
        mockDB.verifiedLoginSecurityEventsByUid = sinon.spy(() =>
          Promise.resolve([])
        );

        return runTest(route, mockRequest, () => {
          // Should not call the device fingerprinting database method
          expect(mockDB.verifiedLoginSecurityEventsByUid.callCount).toBe(0);
          mockDB.verifiedLoginSecurityEventsByUid = originalSpy;
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
      expect(mockLog.error.callCount).toBe(0);
    }).then(() => {
      mockDB.sessions = sinon.spy(() => {
        return Promise.resolve(new Array(201));
      });
      mockLog.error.resetHistory();
      return runTest(route, mockRequest, () => {
        expect(mockLog.error.callCount).toBe(1);
        expect(mockLog.error.firstCall.args[0]).toBe('Account.login');
        expect(mockLog.error.firstCall.args[1].numSessions).toBe(201);
        mockDB.sessions = oldSessions;
      });
    });
  });

  describe('checks security history', () => {
    let record: any;
    const clientAddress = mockRequest.app.clientAddress;
    beforeEach(() => {
      mockLog.info = sinon.spy((op: any, arg: any) => {
        if (op.indexOf('Account.history') === 0) {
          record = arg;
        }
      });
    });

    it('with a seen ip address', () => {
      record = undefined;
      let securityQuery: any;
      mockDB.verifiedLoginSecurityEvents = sinon.spy((arg: any) => {
        securityQuery = arg;
        return Promise.resolve([
          {
            name: 'account.login',
            createdAt: Date.now(),
            verified: true,
          },
        ]);
      });
      return runTest(route, mockRequest, () => {
        expect(mockDB.verifiedLoginSecurityEvents.callCount).toBe(1);
        expect(securityQuery.uid).toBe(uid);
        expect(securityQuery.ipAddr).toBe(clientAddress);

        expect(record).toBeTruthy();
        expect(mockLog.info.args[0][0]).toBe('Account.history.verified');
        expect(record.uid).toBe(uid);
        expect(record.events).toBe(1);
        expect(record.recency).toBe('day');
      });
    });

    it('with a seen, unverified ip address', () => {
      record = undefined;
      let securityQuery: any;
      mockDB.verifiedLoginSecurityEvents = sinon.spy((arg: any) => {
        securityQuery = arg;
        return Promise.resolve([
          {
            name: 'account.login',
            createdAt: Date.now(),
            verified: false,
          },
        ]);
      });
      return runTest(route, mockRequest, () => {
        expect(mockDB.verifiedLoginSecurityEvents.callCount).toBe(1);
        expect(securityQuery.uid).toBe(uid);
        expect(securityQuery.ipAddr).toBe(clientAddress);

        expect(record).toBeTruthy();
        expect(mockLog.info.args[0][0]).toBe('Account.history.unverified');
        expect(record.uid).toBe(uid);
        expect(record.events).toBe(1);
      });
    });

    it('with a new ip address', () => {
      record = undefined;
      let securityQuery: any;
      mockDB.verifiedLoginSecurityEvents = sinon.spy((arg: any) => {
        securityQuery = arg;
        return Promise.resolve([]);
      });
      return runTest(route, mockRequest, () => {
        expect(mockDB.verifiedLoginSecurityEvents.callCount).toBe(1);
        expect(securityQuery.uid).toBe(uid);
        expect(securityQuery.ipAddr).toBe(clientAddress);

        expect(record).toBeUndefined();
      });
    });
  });

  it('records security event', () => {
    const clientAddress = mockRequest.app.clientAddress;
    let securityQuery: any;
    mockDB.securityEvent = sinon.spy((arg: any) => {
      securityQuery = arg;
      return Promise.resolve();
    });
    return runTest(route, mockRequest, () => {
      expect(mockDB.securityEvent.callCount).toBeGreaterThanOrEqual(1);
      expect(securityQuery.uid).toBe(uid);
      expect(securityQuery.ipAddr).toBe(clientAddress);
      expect(securityQuery.name).toBe('account.login');
    });
  });

  describe('blocked by customs', () => {
    describe('can unblock', () => {
      const oldCheck = mockCustoms.check;

      beforeAll(() => {
        mockCustoms.check = (_request: any, _email: any, action: any) => {
          if (action === 'unblockCodeFailed') {
            return Promise.resolve(false);
          }
          return Promise.reject(error.requestBlocked(true));
        };
      });

      beforeEach(() => {
        mockLog.activityEvent.resetHistory();
        mockLog.flowEvent.resetHistory();
      });

      afterAll(() => {
        mockCustoms.check = oldCheck;
      });

      describe('signin unblock enabled', () => {
        beforeAll(() => {
          mockLog.flowEvent.resetHistory();
        });

        it('without unblock code', async () => {
          await expect(runTest(route, mockRequest)).rejects.toMatchObject({
            errno: error.ERRNO.REQUEST_BLOCKED,
            output: {
              statusCode: 400,
              payload: {
                verificationMethod: 'email-captcha',
                verificationReason: 'login',
              },
            },
          });
          expect(mockLog.flowEvent.callCount).toBe(1);
          expect(mockLog.flowEvent.args[0][0].event).toBe(
            'account.login.blocked'
          );
          mockLog.flowEvent.resetHistory();
        });

        describe('with unblock code', () => {
          it('invalid code', async () => {
            mockDB.consumeUnblockCode = () =>
              Promise.reject(error.invalidUnblockCode());
            await expect(runTest(route, mockRequestWithUnblockCode)).rejects.toMatchObject({
              errno: error.ERRNO.INVALID_UNBLOCK_CODE,
              output: { statusCode: 400 },
            });
            expect(mockLog.flowEvent.callCount).toBe(2);
            expect(mockLog.flowEvent.args[1][0].event).toBe(
              'account.login.invalidUnblockCode'
            );
            mockLog.flowEvent.resetHistory();
          });

          it('expired code', async () => {
            // test 5 seconds old, to reduce flakiness of test
            mockDB.consumeUnblockCode = () =>
              Promise.resolve({
                createdAt:
                  Date.now() - (config.signinUnblock.codeLifetime + 5000),
              });
            await expect(runTest(route, mockRequestWithUnblockCode)).rejects.toMatchObject({
              errno: error.ERRNO.INVALID_UNBLOCK_CODE,
              output: { statusCode: 400 },
            });
            expect(mockLog.flowEvent.callCount).toBe(2);
            expect(mockLog.flowEvent.args[1][0].event).toBe(
              'account.login.invalidUnblockCode'
            );
            mockLog.activityEvent.resetHistory();
            mockLog.flowEvent.resetHistory();
          });

          it('unknown account', async () => {
            mockDB.accountRecord = () => Promise.reject(error.unknownAccount());
            mockDB.emailRecord = () => Promise.reject(error.unknownAccount());
            await expect(runTest(route, mockRequestWithUnblockCode)).rejects.toMatchObject({
              errno: error.ERRNO.REQUEST_BLOCKED,
              output: { statusCode: 400 },
            });
          });

          it('valid code', () => {
            mockDB.consumeUnblockCode = () =>
              Promise.resolve({ createdAt: Date.now() });
            return runTest(route, mockRequestWithUnblockCode, (res: any) => {
              expect(mockLog.flowEvent.callCount).toBe(4);
              expect(mockLog.flowEvent.args[0][0].event).toBe(
                'account.login.blocked'
              );
              expect(mockLog.flowEvent.args[1][0].event).toBe(
                'account.login.confirmedUnblockCode'
              );
              expect(mockLog.flowEvent.args[2][0].event).toBe(
                'account.login'
              );
              expect(mockLog.flowEvent.args[3][0].event).toBe(
                'flow.complete'
              );
            });
          });
        });
      });
    });

    describe('cannot unblock', () => {
      const oldCheck = mockCustoms.check;
      beforeAll(() => {
        mockCustoms.check = () => Promise.reject(error.requestBlocked(false));
      });

      afterAll(() => {
        mockCustoms.check = oldCheck;
      });

      it('without an unblock code', async () => {
        try {
          await runTest(route, mockRequest);
          expect(true).toBe(false); // should not reach
        } catch (err: any) {
          expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
          expect(err.output.statusCode).toBe(400);
          expect(err.output.payload.verificationMethod).toBeUndefined();
          expect(err.output.payload.verificationReason).toBeUndefined();
        }
      });

      it('with unblock code', async () => {
        try {
          await runTest(route, mockRequestWithUnblockCode);
          expect(true).toBe(false); // should not reach
        } catch (err: any) {
          expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
          expect(err.output.statusCode).toBe(400);
          expect(err.output.payload.verificationMethod).toBeUndefined();
          expect(err.output.payload.verificationReason).toBeUndefined();
        }
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
      () => { throw new Error('should have thrown'); },
      (err: any) => {
        expect(mockDB.accountRecord.callCount).toBe(1);
        expect(err.errno).toBe(142);
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
      () => { throw new Error('should have thrown'); },
      (err: any) => {
        expect(mockDB.totpToken.callCount).toBe(1);
        expect(err.errno).toBe(160);
      }
    );
  });

  it('can refuse new account logins for selected OAuth clients', async () => {
    const innerRoute = getRoute(
      makeRoutes({
        config: {
          oauth: {
            disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
          },
        },
      }),
      '/account/login'
    );

    const innerMockRequest = mocks.mockRequest({
      payload: {
        service: 'd15ab1edd15ab1ed',
      },
    });

    await expect(runTest(innerRoute, innerMockRequest)).rejects.toMatchObject({
      output: { statusCode: 503 },
      errno: error.ERRNO.DISABLED_CLIENT_ID,
    });
  });

  it('should use RP CMS email content for new login email', () => {
    rpConfigManager.fetchCMSData.resetHistory();
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

    const originalCreateSessionToken = mockDB.createSessionToken;

    // Simulate a verified session state. This will result in a new device
    // login email being sent.
    mockDB.createSessionToken = sinon.spy(async (opts: any) => {
      const result = await originalCreateSessionToken(opts);
      result.tokenVerificationId = null;
      result.tokenVerified = true;
      return result;
    });

    return runTest(route, mockRequestWithRpCmsConfig, () => {
      mockDB.createSessionToken = originalCreateSessionToken;
      sinon.assert.calledOnce(mockFxaMailer.sendNewDeviceLoginEmail);
      const args = mockFxaMailer.sendNewDeviceLoginEmail.args[0];
      const emailMessage = args[0];
      expect(emailMessage.cmsRpClientId).toBe('00f00f');
      expect(emailMessage.cmsRpFromName).toBe('Testo Inc.');
      expect(emailMessage.entrypoint).toBe('testo');
      expect(emailMessage.logoUrl).toBe('http://img.exmpl.gg/logo.svg');
      expect(emailMessage.subject).toBe(rpCmsConfig.NewDeviceLoginEmail.subject);
      expect(emailMessage.headline).toBe(rpCmsConfig.NewDeviceLoginEmail.headline);
      expect(emailMessage.description).toBe(
        rpCmsConfig.NewDeviceLoginEmail.description
      );
    });
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
    return runTest(route, mockRequest, (response: any) => {
      expect(response).toEqual({
        bundle: mockRequest.auth.credentials.keyBundle,
      });

      expect(mockDB.deleteKeyFetchToken.callCount).toBe(1);
      let args = mockDB.deleteKeyFetchToken.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toBe(mockRequest.auth.credentials);

      expect(mockLog.activityEvent.callCount).toBe(1);
      args = mockLog.activityEvent.args[0];
      expect(args.length).toBe(1);
      expect(args[0]).toEqual({
        country: 'United States',
        event: 'account.keyfetch',
        region: 'California',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid,
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
      });
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
        () => { throw new Error('should have thrown'); },
        (response: any) => {
          expect(response.errno).toBe(104);
          expect(response.message).toBe('Unconfirmed account');
        }
      )
      .then(() => {
        mockLog.activityEvent.resetHistory();
      });
  });
});

describe('/account/destroy', () => {
  const email = 'foo@example.com';
  const tokenVerified = true;
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');

  let mockDB: any, mockLog: any, mockRequest: any, mockPush: any, mockPushbox: any, mockCustoms: any;

  beforeEach(async () => {
    mockDB = {
      ...mocks.mockDB({ email: email, uid: uid }),
    };
    mockLog = mocks.mockLog();
    mockCustoms = mocks.mockCustoms();
    mockRequest = mocks.mockRequest({
      credentials: { uid, email, tokenVerified },
      log: mockLog,
      payload: {
        email: email,
        authPW: new Array(65).join('f'),
      },
    });
    mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
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
        accountDestroy: {
          requireVerifiedAccount: false,
        },
        domain: 'wibble',
      },
      db: mockDB,
      log: mockLog,
      push: mockPush,
      pushbox: mockPushbox,
      customs: mockCustoms,
    });
    return getRoute(accountRoutes, '/account/destroy');
  }

  it('should delete the account and enqueue account task', () => {
    const route = buildRoute();

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);

      expect(mockAccountQuickDelete).toHaveBeenCalledTimes(1);
      expect(mockAccountQuickDelete).toHaveBeenCalledWith(
        uid,
        ReasonForDeletion.UserRequested
      );

      sinon.assert.calledOnceWithExactly(mockGetAccountCustomerByUid, uid);
      sinon.assert.calledOnceWithExactly(mockAccountTasksDeleteAccount, {
        uid,
        customerId: 'customer123',
        reason: ReasonForDeletion.UserRequested,
      });
      sinon.assert.calledOnceWithExactly(glean.account.deleteComplete, mockRequest, {
        uid,
      });
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'accountDeleted.ByRequest',
        { uid }
      );
    });
  });

  it('should delete the account and enqueue account task on error', () => {
    const route = buildRoute();

    // Here we act like there's an error when calling accountDeleteManager.quickDelete(...)
    mockAccountQuickDelete = jest.fn().mockRejectedValue(new Error('quickDelete failed'));

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);
      sinon.assert.calledOnceWithExactly(mockAccountTasksDeleteAccount, {
        uid,
        customerId: 'customer123',
        reason: ReasonForDeletion.UserRequested,
      });
      sinon.assert.calledOnceWithExactly(glean.account.deleteComplete, mockRequest, {
        uid,
      });
    });
  });

  it('should delete the passwordless account', () => {
    mockDB = { ...mocks.mockDB({ email, uid, verifierSetAt: 0 }) };
    mockRequest = mocks.mockRequest({
      credentials: { uid, email, tokenVerified },
      log: mockLog,
      payload: {
        email: email,
      },
    });
    const route = buildRoute();

    return runTest(route, mockRequest, () => {
      sinon.assert.calledOnceWithExactly(mockDB.accountRecord, email);
      expect(mockAccountQuickDelete).toHaveBeenCalledTimes(1);
      expect(mockAccountQuickDelete).toHaveBeenCalledWith(
        uid,
        ReasonForDeletion.UserRequested
      );
      sinon.assert.calledOnceWithExactly(mockAccountTasksDeleteAccount, {
        uid,
        customerId: 'customer123',
        reason: ReasonForDeletion.UserRequested,
      });
      sinon.assert.calledOnceWithExactly(glean.account.deleteComplete, mockRequest, {
        uid,
      });
    });
  });

  it('should fail for mismatch session and account uid', async () => {
    mockDB = { ...mocks.mockDB({ email, uid }) };
    mockRequest = mocks.mockRequest({
      credentials: {
        uid: 'anotherone',
        email: `another@one.net`,
        tokenVerified,
      },
      log: mockLog,
      payload: {
        email,
      },
    });
    const route = buildRoute();

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      errno: 102,
    });
    sinon.assert.calledOnceWithExactly(mockCustoms.flag, '63.245.221.32', {
      email,
      errno: 102,
    });
  });
});

describe('/account', () => {
  const email = 'foo@example.com';
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');

  let log: any,
    request: any,
    mockCustomer: any,
    mockWebSubscriptionsResponse: any,
    mockStripeHelper: any,
    mockPlaySubscriptions: any,
    mockAppStoreSubscriptions: any,
    mockOAuthClientInfoLocal: any,
    mockFxaMailerLocal: any;

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
      log: log,
      db: mocks.mockDB({ email, uid }),
      stripeHelper: mockStripeHelper,
    });
    return getRoute(accountRoutes, '/account');
  }

  const webSubscription: any = {
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
      log: log,
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
    mockFxaMailerLocal = mocks.mockFxaMailer();
    mockOAuthClientInfoLocal = mocks.mockOAuthClientInfo();
    mockStripeHelper.fetchCustomer = sinon.spy(
      async (uid: any, email: any) => mockCustomer
    );
    mockStripeHelper.subscriptionsToResponse = sinon.spy(
      async (subscriptions: any) => mockWebSubscriptionsResponse
    );
    mockStripeHelper.removeFirestoreCustomer = jest.fn().mockResolvedValue(undefined);
    Container.set(CapabilityService, jest.fn());
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
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );
      Container.set(CapabilityService, jest.fn());
    });

    it('should return formatted Stripe subscriptions when subscriptions are enabled', () => {
      return runTest(buildRoute(), request, (result: any) => {
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
        expect(result.subscriptions).toEqual(mockWebSubscriptionsResponse);
      });
    });

    it('should swallow unknownCustomer errors from stripe.customer', () => {
      mockStripeHelper.fetchCustomer = sinon.spy(() => {
        throw error.unknownCustomer();
      });

      return runTest(buildRoute(), request, (result: any) => {
        expect(result.subscriptions).toEqual([]);
        expect(log.begin.callCount).toBe(1);
        expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
        expect(mockStripeHelper.subscriptionsToResponse.callCount).toBe(0);
      });
    });

    it('should propagate other errors from stripe.customer', async () => {
      mockStripeHelper.fetchCustomer = sinon.spy(() => {
        throw error.unexpectedError();
      });

      let failed = false;
      try {
        await runTest(buildRoute(), request, () => {});
      } catch (err: any) {
        failed = true;
        expect(err.errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
      }

      expect(failed).toBe(true);
    });

    it('should not return stripe.customer result when subscriptions are disabled', () => {
      return runTest(buildRoute(false), request, (result: any) => {
        expect(result.subscriptions).toEqual([]);

        expect(log.begin.callCount).toBe(1);
        expect(mockStripeHelper.fetchCustomer.callCount).toBe(0);
      });
    });
  });

  describe('Google Play subscriptions', () => {
    const mockPlayStoreSubscriptionPurchase: any = {
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
      isEntitlementActive: jest.fn().mockReturnValue(true),
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

    let subscriptionsEnabled: boolean, playSubscriptionsEnabled: boolean;

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
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );
      Container.set(OAuthClientInfoServiceName, mockOAuthClientInfoLocal);
      Container.set(FxaMailer, mockFxaMailerLocal);
      Container.set(CapabilityService, jest.fn());
      mockPlaySubscriptions = mocks.mockPlaySubscriptions(['getSubscriptions']);
      Container.set(PlaySubscriptions, mockPlaySubscriptions);
      mockPlaySubscriptions.getSubscriptions = sinon.spy(async (uid: any) => [
        mockAppendedPlayStoreSubscriptionPurchase,
      ]);
    });

    it('should return formatted Google Play subscriptions when Play subscriptions are enabled', () => {
      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockStripeHelper.subscriptionsToResponse.callCount).toBe(0);
          sinon.assert.calledOnceWithExactly(
            mockPlaySubscriptions.getSubscriptions,
            uid
          );
          expect(result.subscriptions).toEqual([
            mockFormattedPlayStoreSubscription,
          ]);
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
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );

      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockPlaySubscriptions.getSubscriptions.callCount).toBe(1);
          expect(result.subscriptions).toEqual([
            ...[mockFormattedPlayStoreSubscription],
            ...mockWebSubscriptionsResponse,
          ]);
        }
      );
    });

    it('should return an empty list when no active Google Play or web subscriptions are found', () => {
      mockPlaySubscriptions.getSubscriptions = sinon.spy(async (uid: any) => []);

      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockPlaySubscriptions.getSubscriptions.callCount).toBe(1);
          expect(result.subscriptions).toEqual([]);
        }
      );
    });

    it('should not return Play subscriptions when Play subscriptions are disabled', () => {
      playSubscriptionsEnabled = false;
      mockCustomer = {
        id: 1234,
        subscriptions: ['fake'],
      };
      mockWebSubscriptionsResponse = [webSubscription];
      mockStripeHelper.fetchCustomer = sinon.spy(
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );

      return runTest(
        buildRoute(subscriptionsEnabled, playSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockPlaySubscriptions.getSubscriptions.callCount).toBe(0);
          expect(result.subscriptions).toEqual(mockWebSubscriptionsResponse);
        }
      );
    });
  });

  describe('Apple App Store subscriptions', () => {
    const mockAppStoreSubscriptionPurchase: any = {
      productId: 'wow',
      autoRenewing: false,
      bundleId: 'hmm',
      isEntitlementActive: jest.fn().mockReturnValue(true),
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

    let subscriptionsEnabled: boolean, appStoreSubscriptionsEnabled: boolean;

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
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );
      Container.set(CapabilityService, jest.fn());
      mockAppStoreSubscriptions = mocks.mockAppStoreSubscriptions([
        'getSubscriptions',
      ]);
      Container.set(AppStoreSubscriptions, mockAppStoreSubscriptions);
      mockAppStoreSubscriptions.getSubscriptions = sinon.spy(async (uid: any) => [
        mockAppendedAppStoreSubscriptionPurchase,
      ]);
    });

    it('should return formatted Apple App Store subscriptions when App Store subscriptions are enabled', () => {
      return runTest(
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockStripeHelper.subscriptionsToResponse.callCount).toBe(0);
          sinon.assert.calledOnceWithExactly(
            mockAppStoreSubscriptions.getSubscriptions,
            uid
          );
          expect(result.subscriptions).toEqual([
            mockFormattedAppStoreSubscription,
          ]);
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
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );

      return runTest(
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockAppStoreSubscriptions.getSubscriptions.callCount).toBe(1);
          expect(result.subscriptions).toEqual([
            ...[mockFormattedAppStoreSubscription],
            ...mockWebSubscriptionsResponse,
          ]);
        }
      );
    });

    it('should return an empty list when no active Apple App Store or web subscriptions are found', () => {
      mockAppStoreSubscriptions.getSubscriptions = sinon.spy(async (uid: any) => []);

      return runTest(
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockAppStoreSubscriptions.getSubscriptions.callCount).toBe(1);
          expect(result.subscriptions).toEqual([]);
        }
      );
    });

    it('should not return App Store subscriptions when App Store subscriptions are disabled', () => {
      appStoreSubscriptionsEnabled = false;
      mockCustomer = {
        id: 1234,
        subscriptions: ['fake'],
      };
      mockWebSubscriptionsResponse = [webSubscription];
      mockStripeHelper.fetchCustomer = sinon.spy(
        async (uid: any, email: any) => mockCustomer
      );
      mockStripeHelper.subscriptionsToResponse = sinon.spy(
        async (subscriptions: any) => mockWebSubscriptionsResponse
      );

      return runTest(
        buildRoute(subscriptionsEnabled, false, appStoreSubscriptionsEnabled),
        request,
        (result: any) => {
          expect(log.begin.callCount).toBe(1);
          expect(mockStripeHelper.fetchCustomer.callCount).toBe(1);
          expect(mockAppStoreSubscriptions.getSubscriptions.callCount).toBe(0);
          expect(result.subscriptions).toEqual(mockWebSubscriptionsResponse);
        }
      );
    });
  });

  describe('expanded account data fields', () => {
    it('should return account metadata and 2FA status', () => {
      return runTest(buildRoute(), request, (result: any) => {
        expect(Object.prototype.hasOwnProperty.call(result, 'createdAt')).toBeTruthy();
        expect(
          Object.prototype.hasOwnProperty.call(result, 'passwordCreatedAt')
        ).toBeTruthy();
        expect(Object.prototype.hasOwnProperty.call(result, 'hasPassword')).toBeTruthy();
        expect(Object.prototype.hasOwnProperty.call(result, 'emails')).toBeTruthy();
        expect(Object.prototype.hasOwnProperty.call(result, 'totp')).toBeTruthy();
        expect(Object.prototype.hasOwnProperty.call(result, 'backupCodes')).toBeTruthy();
        expect(Object.prototype.hasOwnProperty.call(result, 'recoveryKey')).toBeTruthy();
        expect(
          Object.prototype.hasOwnProperty.call(result, 'recoveryPhone')
        ).toBeTruthy();
        expect(
          Object.prototype.hasOwnProperty.call(result, 'securityEvents')
        ).toBeTruthy();
        expect(
          Object.prototype.hasOwnProperty.call(result, 'linkedAccounts')
        ).toBeTruthy();
        expect(Array.isArray(result.emails)).toBe(true);
        expect(Array.isArray(result.securityEvents)).toBe(true);
        expect(Array.isArray(result.linkedAccounts)).toBe(true);
      });
    });
  });

  describe('recoveryPhone.available', () => {
    function buildRouteWithRecoveryPhone(recoveryPhoneConfig: any) {
      const accountRoutes = makeRoutes({
        config: {
          subscriptions: { enabled: false },
          recoveryPhone: recoveryPhoneConfig,
        },
        log: log,
        db: mocks.mockDB({ email, uid }),
        stripeHelper: mockStripeHelper,
      });
      return getRoute(accountRoutes, '/account');
    }

    it('should pass geo countryCode to the service', () => {
      const mockService = {
        hasConfirmed: sinon.fake.resolves({ exists: false, phoneNumber: null }),
        available: sinon.fake.resolves(true),
      };
      const route = buildRouteWithRecoveryPhone({
        enabled: true,
        allowedRegions: ['US'],
      });
      // Set after route creation — handler reads from Container at call time
      Container.set(RecoveryPhoneService, mockService);
      return runTest(route, request, (result: any) => {
        expect(mockService.available.firstCall.args[1]).toBe('US');
        expect(result.recoveryPhone.available).toBe(true);
      });
    });

    it('should return available false when service returns false', () => {
      const route = buildRouteWithRecoveryPhone({
        enabled: true,
        allowedRegions: ['US'],
      });
      Container.set(RecoveryPhoneService, {
        hasConfirmed: jest.fn().mockResolvedValue({ exists: false, phoneNumber: null }),
        available: jest.fn().mockResolvedValue(false),
      });
      return runTest(route, request, (result: any) => {
        expect(result.recoveryPhone.available).toBe(false);
      });
    });

    it('should return available false when service call fails', () => {
      const route = buildRouteWithRecoveryPhone({
        enabled: true,
        allowedRegions: ['US'],
      });
      Container.set(RecoveryPhoneService, {
        hasConfirmed: jest.fn().mockResolvedValue({ exists: false, phoneNumber: null }),
        available: jest.fn().mockRejectedValue(new Error('service error')),
      });
      return runTest(route, request, (result: any) => {
        expect(result.recoveryPhone.available).toBe(false);
      });
    });

    it('should return available false when geo location cannot be parsed', () => {
      const noGeoRequest = mocks.mockRequest({
        credentials: { uid, email },
        log: log,
        geo: {},
      });
      const route = buildRouteWithRecoveryPhone({
        enabled: true,
        allowedRegions: ['US'],
      });
      Container.set(RecoveryPhoneService, {
        hasConfirmed: jest.fn().mockResolvedValue({ exists: false, phoneNumber: null }),
        available: jest.fn().mockResolvedValue(false),
      });
      return runTest(route, noGeoRequest, (result: any) => {
        expect(result.recoveryPhone.available).toBe(false);
      });
    });
  });
});

describe('/account/email_bounce_status', () => {
  let log: any, mockDB: any;

  const email = 'test@example.com';

  function buildRoute(dbOverrides: any = {}) {
    log = mocks.mockLog();
    mockDB = {
      emailBounces: sinon.spy(() => Promise.resolve([])),
      ...dbOverrides,
    };
    const accountRoutes = makeRoutes({
      config: { smtp: { bounces: {} } },
      log: log,
      db: mockDB,
      customs: {
        check: sinon.spy(() => Promise.resolve()),
        checkAuthenticated: sinon.spy(() => Promise.resolve()),
      },
    });
    return getRoute(accountRoutes, '/account/email_bounce_status');
  }

  it('should return hasHardBounce: false when no bounces exist', () => {
    const request = mocks.mockRequest({ payload: { email } });
    return runTest(buildRoute(), request, (result: any) => {
      expect(result).toEqual({ hasHardBounce: false });
    });
  });

  it('should return hasHardBounce: true when a hard bounce exists', () => {
    const request = mocks.mockRequest({ payload: { email } });
    const route = buildRoute({
      emailBounces: sinon.spy(() =>
        Promise.resolve([{ bounceType: 1, email, createdAt: Date.now() }])
      ),
    });
    return runTest(route, request, (result: any) => {
      expect(result).toEqual({ hasHardBounce: true });
    });
  });

  it('should return hasHardBounce: false on db error', () => {
    const request = mocks.mockRequest({ payload: { email } });
    const route = buildRoute({
      emailBounces: sinon.spy(() => Promise.reject(new Error('db error'))),
    });
    return runTest(route, request, (result: any) => {
      expect(result).toEqual({ hasHardBounce: false });
    });
  });
});

describe('/account/metrics_opt', () => {
  let log: any, mockDB: any, mockCustoms: any;

  const uid = 'abc123';
  const email = 'test@example.com';

  function buildRoute(setMetricsOptStub: any) {
    log = mocks.mockLog();
    mockCustoms = {
      check: sinon.spy(() => Promise.resolve()),
      checkAuthenticated: sinon.spy(() => Promise.resolve()),
    };
    mockDB = mocks.mockDB({ email, uid });
    // Reset the shared profile mock's deleteCache spy
    profile.deleteCache.resetHistory();
    const accountRoutes = makeRoutes(
      {
        log: log,
        db: mockDB,
        customs: mockCustoms,
      },
      {
        'fxa-shared/db/models/auth': {
          Account: { setMetricsOpt: setMetricsOptStub },
          getAccountCustomerByUid: mockGetAccountCustomerByUid,
        },
      }
    );
    return getRoute(accountRoutes, '/account/metrics_opt');
  }

  it('should call setMetricsOpt and notify services on opt-out', () => {
    const setMetricsOptStub = sinon.stub().resolves();
    const route = buildRoute(setMetricsOptStub);
    const request = mocks.mockRequest({
      credentials: { uid, email },
      payload: { state: 'out' },
      log: log,
    });
    return runTest(route, request, (result: any) => {
      expect(result).toEqual({});
      sinon.assert.calledOnce(setMetricsOptStub);
      sinon.assert.calledWith(setMetricsOptStub, uid, 'out');
      sinon.assert.calledOnce(mockCustoms.checkAuthenticated);
      sinon.assert.calledOnce(profile.deleteCache);
    });
  });

  it('should call setMetricsOpt and notify services on opt-in', () => {
    const setMetricsOptStub = sinon.stub().resolves();
    const route = buildRoute(setMetricsOptStub);
    const request = mocks.mockRequest({
      credentials: { uid, email },
      payload: { state: 'in' },
      log: log,
    });
    return runTest(route, request, (result: any) => {
      expect(result).toEqual({});
      sinon.assert.calledOnce(setMetricsOptStub);
      sinon.assert.calledWith(setMetricsOptStub, uid, 'in');
    });
  });
});
