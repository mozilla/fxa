/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * NOTE: This test has been migrated from test/local/ip_profiling.js
 * It tests the IP profiling behavior in the account login route.
 *
 * This test uses inline mocks to avoid dependency on the complex mocks.js
 * which has proxyquire path resolution issues when called from lib/routes.
 */

// IMPORTANT: Set environment variable BEFORE any imports that might load config
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';

import crypto from 'crypto';
import sinon from 'sinon';
import { Container } from 'typedi';
import { v4 as uuid } from 'uuid';
import { normalizeEmail } from 'fxa-shared/email/helpers';

const TEST_EMAIL = 'foo@gmail.com';
const MS_ONE_DAY = 1000 * 60 * 60 * 24;
const UID = uuid({}, Buffer.alloc(16)).toString('hex');

const KNOWN_IP = '63.245.221.32'; // Mountain View, CA
const KNOWN_LOCATION = {
  city: 'Mountain View',
  country: 'United States',
  countryCode: 'US',
  state: 'California',
  stateCode: 'CA',
};

const { ProfileClient } = require('@fxa/profile/client');
const { AccountEventsManager } = require('../account-events');
const { AccountDeleteManager } = require('../account-delete');
const { AppConfig, AuthLogger } = require('../types');
const { FxaMailer } = require('../senders/fxa-mailer');
const { OAuthClientInfoServiceName } = require('../senders/oauth_client_info');

function mockGlean() {
  const noopAsync = sinon.stub().resolves({});
  return {
    login: {
      success: noopAsync,
      error: noopAsync,
      totpSuccess: noopAsync,
      totpFailure: noopAsync,
      verifyCodeConfirmationEmailSent: noopAsync,
      verifyCodeEmailSent: noopAsync,
      complete: noopAsync,
    },
    registration: {
      accountCreated: noopAsync,
      confirmationEmailSent: noopAsync,
      complete: noopAsync,
      error: noopAsync,
    },
    resetPassword: {
      emailSent: noopAsync,
      createNewSuccess: noopAsync,
      accountReset: noopAsync,
    },
    account: {
      passwordChanged: noopAsync,
      passwordReset: noopAsync,
    },
    loginConfirmSkipFor: {
      knownIp: noopAsync,
    },
  };
}

function mockLog() {
  return {
    activityEvent: sinon.stub().resolves(),
    amplitudeEvent: sinon.stub().resolves(),
    begin: sinon.stub(),
    error: sinon.stub(),
    flowEvent: sinon.stub().resolves(),
    info: sinon.stub(),
    notifyAttachedServices: sinon.stub().resolves(),
    warn: sinon.stub(),
    summary: sinon.stub(),
    trace: sinon.stub(),
    debug: sinon.stub(),
  };
}

function mockDB(data: any) {
  return {
    account: sinon.stub().resolves({
      email: data.email,
      emailVerified: data.emailVerified,
      uid: data.uid,
      primaryEmail: {
        normalizedEmail: normalizeEmail(data.email),
        email: data.email,
        isVerified: data.emailVerified,
        isPrimary: true,
      },
    }),
    accountRecord: sinon.stub().resolves({
      authSalt: crypto.randomBytes(32),
      data: crypto.randomBytes(32),
      email: data.email,
      emailVerified: data.emailVerified,
      primaryEmail: {
        normalizedEmail: normalizeEmail(data.email),
        email: data.email,
        isVerified: data.emailVerified,
        isPrimary: true,
      },
      kA: crypto.randomBytes(32),
      lastAuthAt: () => Date.now(),
      uid: data.uid,
      wrapWrapKb: crypto.randomBytes(32),
      verifierSetAt: Date.now(),
    }),
    createSessionToken: sinon.stub().callsFake((opts: any) => {
      return Promise.resolve({
        createdAt: opts.createdAt || Date.now(),
        data: crypto.randomBytes(32).toString('hex'),
        email: opts.email || data.email,
        emailVerified: opts.emailVerified ?? data.emailVerified,
        lastAuthAt: () => opts.createdAt || Date.now(),
        id: crypto.randomBytes(32).toString('hex'),
        tokenVerificationId: opts.tokenVerificationId,
        tokenVerified: !opts.tokenVerificationId,
        mustVerify: opts.mustVerify ?? false,
        uid: opts.uid || data.uid,
      });
    }),
    createKeyFetchToken: sinon.stub().resolves({
      data: crypto.randomBytes(32).toString('hex'),
      id: crypto.randomBytes(32).toString('hex'),
      uid: data.uid,
    }),
    securityEvents: sinon.stub().resolves([]),
    securityEvent: sinon.stub().resolves(),
    verifiedLoginSecurityEvents: sinon.stub().resolves([]),
    touchSessionToken: sinon.stub().resolves(),
    totpToken: sinon.stub().resolves({ enabled: false }),
    sessions: sinon.stub().resolves([]),
    devices: sinon.stub().resolves([]),
  };
}

function mockMailer() {
  return {
    sendVerifyLoginEmail: sinon.stub().resolves(),
    sendNewDeviceLoginEmail: sinon.stub().resolves(),
    sendVerifyEmail: sinon.stub().resolves(),
    sendVerifyLoginCodeEmail: sinon.stub().resolves(),
  };
}

function mockFxaMailer() {
  const mock = {
    canSend: sinon.stub().resolves(true),
    sendNewDeviceLoginEmail: sinon.stub().resolves(),
    sendVerifyLoginEmail: sinon.stub().resolves(),
  };
  Container.set(FxaMailer, mock);
  return mock;
}

function mockOAuthClientInfo() {
  const mock = {
    fetch: sinon.stub().resolves('sync'),
  };
  Container.set(OAuthClientInfoServiceName, mock);
  return mock;
}

function mockPush() {
  return {
    notifyDeviceConnected: sinon.stub().resolves(),
    notifyDeviceDisconnected: sinon.stub().resolves(),
    notifyPasswordChanged: sinon.stub().resolves(),
    notifyPasswordReset: sinon.stub().resolves(),
    notifyAccountUpdated: sinon.stub().resolves(),
    notifyAccountDestroyed: sinon.stub().resolves(),
    notifyCommandReceived: sinon.stub().resolves(),
    notifyProfileUpdated: sinon.stub().resolves(),
    notifyVerifyLoginRequest: sinon.stub().resolves(),
    sendPush: sinon.stub().resolves(),
  };
}

function mockVerificationReminders() {
  return {
    keys: ['first', 'second', 'third', 'final'],
    create: sinon.stub().returns({ first: 1, second: 1, third: 1, final: 1 }),
    delete: sinon.stub().returns({ first: 1, second: 1, third: 1, final: 1 }),
    process: sinon.stub().returns({ first: [], second: [], third: [], final: [] }),
  };
}

function mockCadReminders() {
  return {
    keys: ['first', 'second', 'third'],
    create: sinon.stub().returns({ first: 1, second: 1, third: 1 }),
    delete: sinon.stub().returns({ first: 1, second: 1, third: 1 }),
    get: sinon.stub().returns({ first: null, second: null, third: null }),
    process: sinon.stub().returns({ first: [], second: [], third: [] }),
  };
}

function mockStatsd() {
  return {
    increment: sinon.stub(),
    timing: sinon.stub(),
    histogram: sinon.stub(),
  };
}

function mockRequest(data: any) {
  const metricsContext = data.payload?.metricsContext || {};

  return {
    app: {
      acceptLanguage: 'en-US',
      clientAddress: KNOWN_IP,
      devices: Promise.resolve([]),
      features: new Set(),
      geo: {
        timeZone: 'America/Los_Angeles',
        location: KNOWN_LOCATION,
      },
      locale: 'en-US',
      metricsContext: Promise.resolve(metricsContext),
      ua: {
        browser: 'Firefox',
        browserVersion: '57.0',
        os: 'Mac OS X',
        osVersion: '10.13',
        deviceType: null,
        formFactor: null,
      },
      isMetricsEnabled: Promise.resolve(true),
    },
    auth: {
      credentials: data.credentials,
    },
    clearMetricsContext: sinon.stub(),
    emitMetricsEvent: sinon.stub().resolves(),
    emitRouteFlowEvent: sinon.stub().resolves(),
    gatherMetricsContext: sinon.stub().callsFake((d: any) => Promise.resolve(d)),
    headers: {
      'user-agent': 'test user-agent',
    },
    info: {
      received: Date.now() - 1,
      completed: 0,
    },
    params: {},
    path: data.path,
    payload: data.payload || {},
    propagateMetricsContext: sinon.stub().resolves(),
    query: data.query || {},
    setMetricsFlowCompleteSignal: sinon.stub(),
    stashMetricsContext: sinon.stub().resolves(),
    validateMetricsContext: sinon.stub().returns(true),
  };
}

function getRoute(routes: any[], path: string) {
  return routes.find((r: any) => r.path === path);
}

function makeRoutes(options: { db: any; mailer: any }) {
  const { db, mailer } = options;
  const config = {
    oauth: {},
    securityHistory: {
      ipProfiling: {
        allowedRecency: MS_ONE_DAY,
      },
      ipHmacKey: 'cool',
    },
    signinConfirmation: {},
    smtp: {},
  };
  const log = mockLog();
  Container.set(AccountEventsManager, {
    recordSecurityEvent: sinon.stub().resolves(),
  });
  Container.set(AccountDeleteManager, { enqueue: sinon.stub() });
  Container.set(AppConfig, config);
  Container.set(AuthLogger, log);
  const cadReminders = mockCadReminders();
  const customs = {
    check: sinon.stub().resolves(true),
    flag: sinon.stub(),
  };
  const signinUtils = require('./utils/signin')(
    log,
    config,
    customs,
    db,
    mailer,
    cadReminders
  );
  signinUtils.checkPassword = () => Promise.resolve(true);
  const glean = mockGlean();
  const { accountRoutes } = require('./account');

  const authServerCacheRedis = {
    get: sinon.stub().resolves(null),
    del: sinon.stub().resolves(0),
  };

  return accountRoutes(
    log,
    db,
    mailer,
    require('../crypto/password')(log, config),
    config,
    customs,
    signinUtils,
    null,
    mockPush(),
    mockVerificationReminders(),
    null,
    null,
    null,
    null,
    glean,
    authServerCacheRedis,
    mockStatsd()
  );
}

async function runTest(
  route: any,
  request: any,
  assertions?: (response: any) => void
): Promise<any> {
  const response = await route.handler(request);
  if (assertions) {
    assertions(response);
  }
  return response;
}

describe('IP Profiling', () => {
  let route: any;
  let accountRoutes: any;
  let mockDBInstance: any;
  let mockMailerInstance: any;
  let mockFxaMailerInstance: any;
  let mockRequestInstance: any;

  jest.setTimeout(30000);

  beforeEach(() => {
    jest.clearAllMocks();
    mockFxaMailerInstance = mockFxaMailer();
    mockOAuthClientInfo();
    mockDBInstance = mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
      uid: UID,
    });
    mockMailerInstance = mockMailer();
    mockRequestInstance = mockRequest({
      payload: {
        authPW: crypto.randomBytes(32).toString('hex'),
        email: TEST_EMAIL,
        service: 'sync',
        reason: 'signin',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        },
      },
      query: {
        keys: 'true',
      },
    });
    Container.set(ProfileClient, {});
    accountRoutes = makeRoutes({
      db: mockDBInstance,
      mailer: mockMailerInstance,
    });
    route = getRoute(accountRoutes, '/account/login');
  });

  afterAll(() => {
    Container.reset();
  });

  it('no previously verified session', async () => {
    mockDBInstance.verifiedLoginSecurityEvents = sinon.stub().resolves([
      {
        name: 'account.login',
        createdAt: Date.now(),
        verified: false,
      },
    ]);

    await runTest(route, mockRequestInstance, (response: any) => {
      expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(1);
      expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(0);
      expect(response.sessionVerified).toBe(false);
    });
  });

  it('previously verified session', async () => {
    mockDBInstance.verifiedLoginSecurityEvents = sinon.stub().resolves([
      {
        name: 'account.login',
        createdAt: Date.now(),
        verified: true,
      },
    ]);

    await runTest(route, mockRequestInstance, (response: any) => {
      expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(0);
      expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(1);
      expect(response.sessionVerified).toBe(true);
    });
  });

  it('previously verified session more than a day', async () => {
    mockDBInstance.securityEvents = sinon.stub().resolves([
      {
        name: 'account.login',
        createdAt: Date.now() - MS_ONE_DAY * 2, // Created two days ago
        verified: true,
      },
    ]);

    await runTest(route, mockRequestInstance, (response: any) => {
      expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(1);
      expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(0);
      expect(response.sessionVerified).toBe(false);
    });
  });

  it('previously verified session with forced sign-in confirmation', async () => {
    const forceSigninEmail = 'forcedemail@mozilla.com';
    mockRequestInstance.payload.email = forceSigninEmail;

    mockDBInstance.accountRecord = sinon.stub().resolves({
      authSalt: crypto.randomBytes(32),
      data: crypto.randomBytes(32),
      email: forceSigninEmail,
      emailVerified: true,
      primaryEmail: {
        normalizedEmail: forceSigninEmail,
        email: forceSigninEmail,
        isVerified: true,
        isPrimary: true,
      },
      kA: crypto.randomBytes(32),
      lastAuthAt: () => Date.now(),
      uid: UID,
      wrapWrapKb: crypto.randomBytes(32),
    });

    let response = await runTest(route, mockRequestInstance);
    expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(1);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(response.sessionVerified).toBe(false);

    response = await runTest(route, mockRequestInstance);
    expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(2);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(response.sessionVerified).toBe(false);
  });

  it('previously verified session with suspicious request', async () => {
    mockRequestInstance.app.clientAddress = '63.245.221.32';
    mockRequestInstance.app.isSuspiciousRequest = true;

    let response = await runTest(route, mockRequestInstance);
    expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(1);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(response.sessionVerified).toBe(false);

    response = await runTest(route, mockRequestInstance);
    expect(mockMailerInstance.sendVerifyLoginEmail.callCount).toBe(2);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(response.sessionVerified).toBe(false);
  });
});
