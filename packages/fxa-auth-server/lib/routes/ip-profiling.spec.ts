/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * NOTE: This test has been migrated from test/local/ip_profiling.js
 * It tests the IP profiling behavior in the account login route.
 *
 * This test uses shared mocks from test/mocks.js where possible, but keeps
 * paths that don't work from lib/routes/.
 */

import crypto from 'crypto';
import { Container } from 'typedi';
import { v4 as uuid } from 'uuid';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');
const { ProfileClient } = require('@fxa/profile/client');
const { AccountDeleteManager } = require('../account-delete');
const { AppConfig, AuthLogger } = require('../types');

const TEST_EMAIL = 'foo@gmail.com';
const MS_ONE_DAY = 1000 * 60 * 60 * 24;
const NOW = 1700000000000;
const UID = uuid({}, Buffer.alloc(16)).toString('hex');

const KNOWN_IP = '63.245.221.32'; // Mountain View, CA
const KNOWN_LOCATION = {
  city: 'Mountain View',
  country: 'United States',
  countryCode: 'US',
  state: 'California',
  stateCode: 'CA',
};

/**
 * Simplified mockRequest for this test file.
 * that don't resolve correctly when running from lib/routes/.
 */
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
    clearMetricsContext: jest.fn(),
    emitMetricsEvent: jest.fn().mockResolvedValue(),
    emitRouteFlowEvent: jest.fn().mockResolvedValue(),
    gatherMetricsContext: jest
      .fn()
      .mockImplementation((d: any) => Promise.resolve(d)),
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
    propagateMetricsContext: jest.fn().mockResolvedValue(),
    query: data.query || {},
    setMetricsFlowCompleteSignal: jest.fn(),
    stashMetricsContext: jest.fn().mockResolvedValue(),
    validateMetricsContext: jest.fn().mockReturnValue(true),
  };
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
  const log = mocks.mockLog();
  mocks.mockAccountEventsManager();
  Container.set(AccountDeleteManager, { enqueue: jest.fn() });
  Container.set(AppConfig, config);
  Container.set(AuthLogger, log);
  const cadReminders = mocks.mockCadReminders();
  const customs = mocks.mockCustoms();
  const signinUtils = require('./utils/signin')(
    log,
    config,
    customs,
    db,
    mailer,
    cadReminders
  );
  signinUtils.checkPassword = () => Promise.resolve(true);
  const glean = mocks.mockGlean();
  const { accountRoutes } = require('./account');

  const authServerCacheRedis = {
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(0),
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
    mocks.mockPush(),
    mocks.mockVerificationReminders(),
    null,
    null,
    null,
    null,
    glean,
    authServerCacheRedis,
    mocks.mockStatsd()
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

  beforeEach(() => {
    jest.useFakeTimers({
      now: NOW,
      doNotFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'nextTick',
        'queueMicrotask',
      ],
    });
    jest.clearAllMocks();
    mockFxaMailerInstance = mocks.mockFxaMailer({
      canSend: jest.fn().mockResolvedValue(true),
    });
    mocks.mockOAuthClientInfo();
    mockDBInstance = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
      uid: UID,
    });
    mockMailerInstance = mocks.mockMailer();
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

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    Container.reset();
  });

  it('no previously verified session', async () => {
    mockDBInstance.verifiedLoginSecurityEvents = jest.fn().mockResolvedValue([
      {
        name: 'account.login',
        createdAt: Date.now(),
        verified: false,
      },
    ]);

    await runTest(route, mockRequestInstance, (response: any) => {
      expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockFxaMailerInstance.sendNewDeviceLoginEmail
      ).toHaveBeenCalledTimes(0);
      expect(response.sessionVerified).toBe(false);
    });
  });

  it('previously verified session', async () => {
    mockDBInstance.verifiedLoginSecurityEvents = jest.fn().mockResolvedValue([
      {
        name: 'account.login',
        createdAt: Date.now(),
        verified: true,
      },
    ]);

    await runTest(route, mockRequestInstance, (response: any) => {
      expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(
        0
      );
      expect(
        mockFxaMailerInstance.sendNewDeviceLoginEmail
      ).toHaveBeenCalledTimes(1);
      expect(response.sessionVerified).toBe(true);
    });
  });

  it('previously verified session more than a day', async () => {
    mockDBInstance.securityEvents = jest.fn().mockResolvedValue([
      {
        name: 'account.login',
        createdAt: Date.now() - MS_ONE_DAY * 2, // Created two days ago
        verified: true,
      },
    ]);

    await runTest(route, mockRequestInstance, (response: any) => {
      expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockFxaMailerInstance.sendNewDeviceLoginEmail
      ).toHaveBeenCalledTimes(0);
      expect(response.sessionVerified).toBe(false);
    });
  });

  it('previously verified session with forced sign-in confirmation', async () => {
    const forceSigninEmail = 'forcedemail@mozilla.com';
    mockRequestInstance.payload.email = forceSigninEmail;

    mockDBInstance.accountRecord = jest.fn().mockResolvedValue({
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
    expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(1);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(
      0
    );
    expect(response.sessionVerified).toBe(false);

    response = await runTest(route, mockRequestInstance);
    expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(2);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(
      0
    );
    expect(response.sessionVerified).toBe(false);
  });

  it('previously verified session with suspicious request', async () => {
    mockRequestInstance.app.clientAddress = '63.245.221.32';
    mockRequestInstance.app.isSuspiciousRequest = true;

    let response = await runTest(route, mockRequestInstance);
    expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(1);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(
      0
    );
    expect(response.sessionVerified).toBe(false);

    response = await runTest(route, mockRequestInstance);
    expect(mockFxaMailerInstance.sendVerifyLoginEmail).toHaveBeenCalledTimes(2);
    expect(mockFxaMailerInstance.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(
      0
    );
    expect(response.sessionVerified).toBe(false);
  });
});
