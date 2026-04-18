/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const { getRoute } = require('../../test/routes_helpers');
const knownIpLocation = require('../../test/known-ip-location');
const mocks = require('../../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const otplib = require('otplib');
const gleanMock = mocks.mockGlean();
const { Container } = require('typedi');
const { AccountEventsManager } = require('../account-events');

const signupCodeAccount = {
  uid: 'foo',
  email: 'foo@example.org',
  emailCode: 'abcdef',
  emailVerified: false,
  tokenVerificationId: 'sometoken',
};

const MOCK_DEVICES = [
  // Current device
  {
    sessionTokenId: 'sessionTokenId',
    name: 'foo',
    type: 'desktop',
    pushEndpointExpired: false,
    pushPublicKey: 'foo',
    uaBrowser: 'Firefox',
  },
  // Only pushable device
  {
    sessionTokenId: 'sessionTokenId2',
    name: 'foo2',
    type: 'desktop',
    pushEndpointExpired: false,
    pushPublicKey: 'foo',
    uaBrowser: 'Firefox',
  },
  // Unsupported mobile device
  {
    sessionTokenId: 'sessionTokenId3',
    name: 'foo3',
    type: 'mobile',
    pushEndpointExpired: false,
    pushPublicKey: 'foo',
    uaBrowser: 'Firefox',
  },
];

function makeRoutes(options: any = {}) {
  const config = options.config || {};
  config.oauth = config.oauth || {};
  config.smtp = config.smtp || {};
  const db = options.db || mocks.mockDB();
  const log = options.log || mocks.mockLog();
  const mailer = options.mailer || mocks.mockMailer();
  const cadReminders = options.cadReminders || mocks.mockCadReminders();
  const glean = options.glean || gleanMock;
  const statsd = options.statsd || mocks.mockStatsd();

  Container.set(
    AccountEventsManager,
    options.accountEventsManager || { recordSecurityEvent: jest.fn() }
  );

  const Password =
    options.Password || require('../crypto/password')(log, config);
  const customs = options.customs || {
    v2Enabled: () => true,
    check: () => {
      return Promise.resolve(true);
    },
  };
  const signinUtils =
    options.signinUtils ||
    require('./utils/signin')(
      log,
      config,
      customs,
      db,
      mailer,
      cadReminders,
      statsd
    );

  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const push = options.push || mocks.mockPush();
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
  if (options.checkPassword) {
    signinUtils.checkPassword = options.checkPassword;
  }
  return require('./session')(
    log,
    db,
    Password,
    config,
    signinUtils,
    signupUtils,
    mailer,
    push,
    customs,
    glean,
    statsd
  );
}

function runTest(route: any, request: any) {
  return route.handler(request);
}

function hexString(bytes: number) {
  return crypto.randomBytes(bytes).toString('hex');
}

function getExpectedOtpCode(options: any = {}, secret = 'abcdef') {
  const authenticator = new otplib.authenticator.Authenticator();
  authenticator.options = Object.assign(
    {},
    otplib.authenticator.options,
    options,
    {
      secret,
    }
  );
  return authenticator.generate();
}

describe('/session/status', () => {
  let log: any, db: any, config: any, routes: any, route: any;

  beforeEach(() => {
    jest.clearAllMocks();
    log = mocks.mockLog();
    mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
    db = {
      account: () => {},
      totpToken: () => {},
    };
    config = {};
    routes = makeRoutes({ log, db, config });
    route = getRoute(routes, '/session/status');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('returns unknown account error', async () => {
    db.account = jest.fn().mockReturnValue(null);
    let error: any;
    try {
      const request = mocks.mockRequest({
        credentials: {
          uid: 'foo',
        },
      });
      await runTest(route, request);
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe('Unknown account');
  });

  it('returns status correctly', () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: false,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      verified: false,
      enabled: false,
    });
    const request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        state: 'unverified',
        verificationMethodValue: 'totp-2fa',
        verified: false,
        tokenVerified: false,
        tokenVerificationId: 'token-123',
        authenticatorAssuranceLevel: 1,
        uid: 'foo',
      },
    });
    return runTest(route, request).then((res: any) => {
      expect(res).toEqual({
        uid: 'foo',
        state: 'unverified',
        details: {
          accountEmailVerified: false,
          sessionVerificationMeetsMinimumAAL: true,
          sessionVerificationMethod: 'totp-2fa',
          sessionVerified: false,
          verified: false,
        },
      });
    });
  });

  it('has unverified primary email', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: false,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      verified: false,
      enabled: false,
    });

    const request = mocks.mockRequest({
      credentials: {
        uid: 'account-123',
        state: 'unverified',
        verified: false,
        tokenVerified: false,
        verificationMethodValue: 'email',
        authenticatorAssuranceLevel: 1,
      },
    });
    const resp = await runTest(route, request);

    expect(resp).toEqual({
      uid: 'account-123',
      state: 'unverified',
      details: {
        accountEmailVerified: false,
        sessionVerificationMethod: 'email',
        sessionVerified: false,
        verified: false,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });
  });

  it('has unverified session because of defined tokenVerificationId (tokenVerified: false)', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: false,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      verified: false,
      enabled: false,
    });

    const request = mocks.mockRequest({
      credentials: {
        uid: 'account-123',
        state: 'unverified',
        tokenVerified: false,
        verificationMethodValue: 'email',
        authenticatorAssuranceLevel: 1,
      },
    });
    const resp = await runTest(route, request);

    expect(resp).toEqual({
      uid: 'account-123',
      state: 'unverified',
      details: {
        accountEmailVerified: false,
        sessionVerificationMethod: 'email',
        sessionVerified: false,
        verified: false,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });
  });

  it('has unverified AAL 1', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: true,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      verified: true,
      enabled: true,
    });

    const request = mocks.mockRequest({
      credentials: {
        uid: 'account-123',
        state: 'unverified',
        tokenVerified: false,
        verificationMethodValue: 'email',
        authenticatorAssuranceLevel: 1,
      },
    });
    const resp = await runTest(route, request);

    expect(resp).toEqual({
      uid: 'account-123',
      state: 'unverified',
      details: {
        accountEmailVerified: true,
        sessionVerificationMethod: 'email',
        sessionVerified: false,
        verified: false,
        sessionVerificationMeetsMinimumAAL: false,
      },
    });
  });

  it('session is AAL1 but account requires AAL2 (TOTP enabled)', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: true,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      verified: true,
      enabled: true,
    });

    const request = mocks.mockRequest({
      credentials: {
        uid: 'account-123',
        state: 'verified',
        tokenVerified: true,
        verificationMethodValue: 'email',
        authenticatorAssuranceLevel: 1,
      },
    });
    const resp = await runTest(route, request);

    expect(resp).toEqual({
      uid: 'account-123',
      state: 'verified',
      details: {
        accountEmailVerified: true,
        sessionVerificationMethod: 'email',
        sessionVerified: true,
        verified: true,
        sessionVerificationMeetsMinimumAAL: false,
      },
    });
  });

  it('has verified AAL 1 state', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: true,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      enabled: false,
    });

    const request = mocks.mockRequest({
      credentials: {
        uid: 'account-123',
        state: 'verified',
        tokenVerified: true,
        verificationMethodValue: 'email',
        authenticatorAssuranceLevel: 1,
      },
    });
    const resp = await runTest(route, request);

    expect(resp).toEqual({
      uid: 'account-123',
      state: 'verified',
      details: {
        accountEmailVerified: true,
        sessionVerificationMethod: 'email',
        sessionVerified: true,
        verified: true,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });
  });

  it('has verified AAL 2', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'account-123',
      primaryEmail: {
        isVerified: true,
      },
    });
    db.totpToken = jest.fn().mockResolvedValue({
      verified: true,
      enabled: true,
    });

    const request = mocks.mockRequest({
      credentials: {
        uid: 'account-123',
        state: 'verified',
        tokenVerified: true,
        verificationMethodValue: 'totp-2fa',
        authenticatorAssuranceLevel: 2,
      },
    });
    const resp = await runTest(route, request);

    expect(resp).toEqual({
      uid: 'account-123',
      state: 'verified',
      details: {
        accountEmailVerified: true,
        sessionVerificationMethod: 'totp-2fa',
        sessionVerified: true,
        verified: true,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });
  });
});

describe('/session/reauth', () => {
  const TEST_EMAIL = 'foo@example.com';
  const TEST_UID = 'abcdef123456';
  const TEST_AUTHPW = hexString(32);

  let log: any,
    config: any,
    customs: any,
    db: any,
    mailer: any,
    signinUtils: any,
    routes: any,
    route: any,
    request: any,
    SessionToken: any;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {};
    customs = {
      checkAuthenticated: () => {
        return Promise.resolve(true);
      },
    };
    db = mocks.mockDB({
      email: TEST_EMAIL,
      uid: TEST_UID,
    });
    mailer = mocks.mockMailer();
    mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
    signinUtils = require('./utils/signin')(log, config, customs, db, mailer);
    SessionToken = require('../tokens/index')(log, config).SessionToken;
    routes = makeRoutes({ log, config, customs, db, mailer, signinUtils });
    route = getRoute(routes, '/session/reauth');
    request = mocks.mockRequest({
      log: log,
      payload: {
        authPW: TEST_AUTHPW,
        email: TEST_EMAIL,
        service: 'sync',
        reason: 'signin',
        metricsContext: {
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
        keys: true,
      },
      uaBrowser: 'Firefox',
      uaBrowserVersion: '50',
      uaOS: 'Android',
      uaOSVersion: '6',
      uaDeviceType: 'mobile',
      uaFormFactor: 'trapezoid',
    });
    return SessionToken.fromHex(hexString(16), {
      email: TEST_EMAIL,
      uid: TEST_UID,
      createdAt: 12345678,
      emailVerified: true,
    }).then((sessionToken: any) => {
      request.auth.credentials = sessionToken;
    });
  });

  it('emits the correct series of calls', () => {
    signinUtils.checkEmailAddress = jest.fn(() => Promise.resolve(true));
    signinUtils.checkPassword = jest.fn(() => Promise.resolve(true));
    signinUtils.checkCustomsAndLoadAccount = jest.fn(async () => {
      const accountRecord = await db.accountRecord(TEST_EMAIL);
      return { accountRecord };
    });
    signinUtils.sendSigninNotifications = jest.fn(() => Promise.resolve());
    signinUtils.createKeyFetchToken = jest.fn(() =>
      Promise.resolve({ data: 'KEYFETCHTOKEN' })
    );
    signinUtils.getSessionVerificationStatus = jest.fn(() => ({
      sessionVerified: true,
      verified: true,
    }));
    const testNow = Math.floor(Date.now() / 1000);
    return runTest(route, request).then((res: any) => {
      expect(signinUtils.checkCustomsAndLoadAccount).toHaveBeenCalledTimes(1);
      let args = signinUtils.checkCustomsAndLoadAccount.mock.calls[0];
      expect(args.length).toBe(3);
      expect(args[0]).toBe(request);
      expect(args[1]).toBe(TEST_EMAIL);

      expect(db.accountRecord).toHaveBeenCalledTimes(2);
      args = db.accountRecord.mock.calls[0];
      expect(args.length).toBe(1);
      expect(args[0]).toBe(TEST_EMAIL);

      expect(signinUtils.checkEmailAddress).toHaveBeenCalledTimes(1);
      args = signinUtils.checkEmailAddress.mock.calls[0];
      expect(args.length).toBe(3);
      expect(args[0].uid).toBe(TEST_UID);
      expect(args[1]).toBe(TEST_EMAIL);
      expect(args[2]).toBeUndefined();

      expect(signinUtils.checkPassword).toHaveBeenCalledTimes(1);
      args = signinUtils.checkPassword.mock.calls[0];
      expect(args.length).toBe(3);
      expect(args[0].uid).toBe(TEST_UID);
      expect(args[1].authPW.toString('hex')).toBe(TEST_AUTHPW);
      expect(args[2].app.clientAddress).toBe(knownIpLocation.ip);

      expect(db.updateSessionToken).toHaveBeenCalledTimes(1);
      args = db.updateSessionToken.mock.calls[0];
      expect(args.length).toBe(1);
      expect(args[0]).toBe(request.auth.credentials);

      expect(signinUtils.sendSigninNotifications).toHaveBeenCalledTimes(1);
      args = signinUtils.sendSigninNotifications.mock.calls[0];
      expect(args.length).toBe(4);
      expect(args[0]).toBe(request);
      expect(args[1].uid).toBe(TEST_UID);
      expect(args[2]).toBe(request.auth.credentials);
      expect(args[3]).toBeUndefined();

      expect(signinUtils.createKeyFetchToken).toHaveBeenCalledTimes(1);
      args = signinUtils.createKeyFetchToken.mock.calls[0];
      expect(args.length).toBe(4);
      expect(args[0]).toBe(request);
      expect(args[1].uid).toBe(TEST_UID);
      expect(args[2].authPW.toString('hex')).toBe(TEST_AUTHPW);
      expect(args[3]).toBe(request.auth.credentials);

      expect(signinUtils.getSessionVerificationStatus).toHaveBeenCalledTimes(1);
      args = signinUtils.getSessionVerificationStatus.mock.calls[0];
      expect(args.length).toBe(2);
      expect(args[0]).toBe(request.auth.credentials);
      expect(args[1]).toBeUndefined();

      expect(Object.keys(res).length).toBe(7);
      expect(res.uid).toBe(TEST_UID);
      expect(res.authAt).toBeGreaterThanOrEqual(testNow);
      expect(res.keyFetchToken).toBe('KEYFETCHTOKEN');
      expect(res.emailVerified).toBe(true);
      expect(res.sessionVerified).toBe(true);
      expect(res.verified).toBe(true);
    });
  });

  it('erorrs when session uid and email account uid mismatch', () => {
    db = mocks.mockDB({
      email: 'hello@bs.gg',
      uid: 'quux',
    });
    const routes = makeRoutes({
      log,
      config,
      customs,
      db,
      mailer,
      signinUtils,
    });
    const route = getRoute(routes, '/session/reauth');
    const req = {
      ...request,
      payload: { ...request.payload, email: 'hello@bs.gg' },
    };
    return runTest(route, req).then(
      () => {
        throw new Error('request should have been rejected');
      },
      (err: any) => {
        expect(db.accountRecord).toHaveBeenCalledTimes(1);
        expect(err.errno).toBe(error.ERRNO.ACCOUNT_UNKNOWN);
      }
    );
  });

  it('correctly updates sessionToken details', () => {
    signinUtils.checkPassword = jest.fn(() => {
      return Promise.resolve(true);
    });
    const testNow = Date.now();
    const testNowSeconds = Math.floor(Date.now() / 1000);

    expect(!request.auth.credentials.authAt).toBeTruthy();
    expect(request.auth.credentials.lastAuthAt() < testNowSeconds).toBeTruthy();
    expect(!request.auth.credentials.uaBrowser).toBeTruthy();
    expect(!request.auth.credentials.uaBrowserVersion).toBeTruthy();
    expect(!request.auth.credentials.uaOS).toBeTruthy();
    expect(!request.auth.credentials.uaOSVersion).toBeTruthy();
    expect(!request.auth.credentials.uaDeviceType).toBeTruthy();
    expect(!request.auth.credentials.uaFormFactor).toBeTruthy();

    return runTest(route, request).then((res: any) => {
      expect(db.updateSessionToken).toHaveBeenCalledTimes(1);
      const sessionToken = db.updateSessionToken.mock.calls[0][0];
      expect(sessionToken.authAt).toBeGreaterThanOrEqual(testNow);
      expect(sessionToken.lastAuthAt()).toBeGreaterThanOrEqual(testNowSeconds);
      expect(sessionToken.uaBrowser).toBe('Firefox');
      expect(sessionToken.uaBrowserVersion).toBe('50');
      expect(sessionToken.uaOS).toBe('Android');
      expect(sessionToken.uaOSVersion).toBe('6');
      expect(sessionToken.uaDeviceType).toBe('mobile');
      expect(sessionToken.uaFormFactor).toBe('trapezoid');
    });
  });

  it('correctly updates to mustVerify=true when requesting keys', () => {
    signinUtils.checkPassword = jest.fn(() => {
      return Promise.resolve(true);
    });

    expect(!request.auth.credentials.mustVerify).toBeTruthy();

    return runTest(route, request).then((res: any) => {
      expect(db.updateSessionToken).toHaveBeenCalledTimes(1);
      const sessionToken = db.updateSessionToken.mock.calls[0][0];
      expect(sessionToken.mustVerify).toBeTruthy();
    });
  });

  it('correctly updates to mustVerify=true when explicit verificationMethod is requested in payload', () => {
    signinUtils.checkPassword = jest.fn(() => {
      return Promise.resolve(true);
    });

    expect(!request.auth.credentials.mustVerify).toBeTruthy();

    request.payload.verificationMethod = 'email-2fa';
    return runTest(route, request).then((res: any) => {
      expect(db.updateSessionToken).toHaveBeenCalledTimes(1);
      const sessionToken = db.updateSessionToken.mock.calls[0][0];
      expect(sessionToken.mustVerify).toBeTruthy();
    });
  });

  it('leaves mustVerify=false when not requesting keys', () => {
    signinUtils.checkPassword = jest.fn(() => {
      return Promise.resolve(true);
    });
    request.query.keys = false;

    expect(!request.auth.credentials.mustVerify).toBeTruthy();

    return runTest(route, request).then((res: any) => {
      expect(db.updateSessionToken).toHaveBeenCalledTimes(1);
      const sessionToken = db.updateSessionToken.mock.calls[0][0];
      expect(!sessionToken.mustVerify).toBeTruthy();
    });
  });

  it('does not return a keyFetchToken when not requesting keys', () => {
    signinUtils.checkPassword = jest.fn(() => {
      return Promise.resolve(true);
    });
    signinUtils.createKeyFetchToken = jest.fn(() => {
      throw new Error('should not be called');
    });
    request.query.keys = false;

    return runTest(route, request).then((res: any) => {
      expect(signinUtils.createKeyFetchToken).toHaveBeenCalledTimes(0);
      expect(!res.keyFetchToken).toBeTruthy();
    });
  });

  it('correctly rejects incorrect passwords', () => {
    signinUtils.checkPassword = jest.fn(() => {
      return Promise.resolve(false);
    });

    return runTest(route, request).then(
      (res: any) => {
        throw new Error('request should have been rejected');
      },
      (err: any) => {
        expect(signinUtils.checkPassword).toHaveBeenCalledTimes(1);
        expect(err.errno).toBe(error.ERRNO.INCORRECT_PASSWORD);
      }
    );
  });

  it('can refuse reauth for selected OAuth clients', async () => {
    const route = getRoute(
      makeRoutes({
        config: {
          ...config,
          oauth: {
            ...config.oauth,
            disableNewConnectionsForClients: ['d15ab1edd15ab1ed'],
          },
        },
      }),
      '/session/reauth'
    );

    const mockRequest = mocks.mockRequest({
      payload: {
        service: 'd15ab1edd15ab1ed',
      },
    });

    await expect(runTest(route, mockRequest)).rejects.toMatchObject({
      output: { statusCode: 503 },
      errno: error.ERRNO.DISABLED_CLIENT_ID,
    });
  });
});

describe('/session/destroy', () => {
  let route: any;
  let request: any;
  let log: any;
  let db: any;
  let securityEventStub: any;

  beforeEach(() => {
    db = mocks.mockDB();
    log = mocks.mockLog();
    const config = {};
    securityEventStub = jest.fn();
    const routes = makeRoutes({
      log,
      config,
      db,
      accountEventsManager: { recordSecurityEvent: securityEventStub },
    });
    route = getRoute(routes, '/session/destroy');
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'foo',
      },
      log: log,
    });
  });

  it('responds correctly when session is destroyed', () => {
    return runTest(route, request).then((res: any) => {
      expect(Object.keys(res).length).toBe(0);
      expect(securityEventStub).toHaveBeenCalledTimes(1);
      expect(securityEventStub).toHaveBeenCalledWith(db, {
        name: 'session.destroy',
        uid: 'foo',
        ipAddr: '63.245.221.32',
        tokenId: undefined,
        additionalInfo: {
          userAgent: 'test user-agent',
          location: {
            city: 'Mountain View',
            country: 'United States',
            countryCode: 'US',
            state: 'California',
            stateCode: 'CA',
          },
        },
      });
    });
  });

  it('responds correctly when custom session is destroyed', () => {
    db.sessionToken = jest.fn(() => {
      return Promise.resolve({
        uid: 'foo',
      });
    });
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'foo',
      },
      log: log,
      payload: {
        customSessionToken: 'foo',
      },
    });

    return runTest(route, request).then((res: any) => {
      expect(Object.keys(res).length).toBe(0);
    });
  });

  it('throws on invalid session token', () => {
    db.sessionToken = jest.fn(() => {
      return Promise.resolve({
        uid: 'diff-user',
      });
    });
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'foo',
      },
      log: log,
      payload: {
        customSessionToken: 'foo',
      },
    });

    return runTest(route, request).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.message).toBe('Invalid session token');
      }
    );
  });
});

describe('/session/duplicate', () => {
  let route: any;
  let request: any;
  let log: any;
  let db: any;

  beforeEach(async () => {
    db = mocks.mockDB({});
    log = mocks.mockLog();
    mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
    const config = {};
    const routes = makeRoutes({ log, config, db });
    route = getRoute(routes, '/session/duplicate');

    const Token = require(`../tokens/token`)(log);
    const SessionToken = require(`../tokens/session_token`)(log, Token, {
      tokenLifetimes: {
        sessionTokenWithoutDevice: 2419200000,
      },
    });

    const sessionToken = await SessionToken.create({
      uid: 'foo',
      createdAt: 234567,
      email: 'foo@example.org',
      emailCode: 'abcdef',
      emailVerified: true,
      tokenVerified: true,
      verifierSetAt: 123456,
      locale: 'en-AU',
      uaBrowser: 'Firefox',
      uaBrowserVersion: '49',
      uaOS: 'Windows',
      uaOSVersion: '10',
      uaDeviceType: 'mobile',
      uaFormFactor: 'frobble',
    });

    request = mocks.mockRequest({
      credentials: sessionToken,
      log: log,
      uaBrowser: 'Chrome',
      uaBrowserVersion: '12',
      uaOS: 'iOS',
      uaOSVersion: '7',
      uaDeviceType: 'desktop',
      uaFormFactor: 'womble',
    });
  });

  it('correctly duplicates a session token', () => {
    return runTest(route, request).then((res: any) => {
      expect(Object.keys(res).length).toBe(6);
      expect(res.uid).toBe(request.auth.credentials.uid);
      expect(res.sessionToken).toBeTruthy();
      expect(res.authAt).toBe(request.auth.credentials.createdAt);
      expect(res.emailVerified).toBe(true);
      expect(res.sessionVerified).toBe(true);
      expect(res.verified).toBe(true);

      expect(db.createSessionToken).toHaveBeenCalledTimes(1);
      const sessionTokenOptions = db.createSessionToken.mock.calls[0][0];
      expect(Object.keys(sessionTokenOptions).length).toBe(37);
      expect(sessionTokenOptions.uid).toBe('foo');
      expect(sessionTokenOptions.createdAt).toBeTruthy();
      expect(sessionTokenOptions.email).toBe('foo@example.org');
      expect(sessionTokenOptions.emailCode).toBe('abcdef');
      expect(sessionTokenOptions.emailVerified).toBe(true);
      expect(sessionTokenOptions.verifierSetAt).toBe(123456);
      expect(sessionTokenOptions.locale).toBe('en-AU');
      expect(!sessionTokenOptions.mustVerify).toBeTruthy();
      expect(sessionTokenOptions.tokenVerificationId).toBeNull();
      expect(sessionTokenOptions.uaBrowser).toBe('Chrome');
      expect(sessionTokenOptions.uaBrowserVersion).toBe('12');
      expect(sessionTokenOptions.uaOS).toBe('iOS');
      expect(sessionTokenOptions.uaOSVersion).toBe('7');
      expect(sessionTokenOptions.uaDeviceType).toBe('desktop');
      expect(sessionTokenOptions.uaFormFactor).toBe('womble');
    });
  });

  it('correctly generates new codes for unverified sessions', () => {
    request.auth.credentials.tokenVerified = false;
    request.auth.credentials.tokenVerificationId = 'myCoolId';
    return runTest(route, request).then((res: any) => {
      expect(Object.keys(res).length).toBe(8);
      expect(res.uid).toBe(request.auth.credentials.uid);
      expect(res.sessionToken).toBeTruthy();
      expect(res.authAt).toBe(request.auth.credentials.createdAt);
      expect(res.emailVerified).toBe(true);
      expect(res.sessionVerified).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.verificationMethod).toBe('email');
      expect(res.verificationReason).toBe('login');

      expect(db.createSessionToken).toHaveBeenCalledTimes(1);
      const sessionTokenOptions = db.createSessionToken.mock.calls[0][0];
      expect(Object.keys(sessionTokenOptions).length).toBe(37);
      expect(sessionTokenOptions.uid).toBe('foo');
      expect(sessionTokenOptions.createdAt).toBeTruthy();
      expect(sessionTokenOptions.email).toBe('foo@example.org');
      expect(sessionTokenOptions.emailCode).toBe('abcdef');
      expect(sessionTokenOptions.emailVerified).toBe(true);
      expect(sessionTokenOptions.verifierSetAt).toBe(123456);
      expect(sessionTokenOptions.locale).toBe('en-AU');
      expect(!sessionTokenOptions.mustVerify).toBeTruthy();
      expect(sessionTokenOptions.tokenVerificationId).toBeTruthy();
      expect(sessionTokenOptions.tokenVerificationId).not.toBe('myCoolId');
      expect(sessionTokenOptions.uaBrowser).toBe('Chrome');
      expect(sessionTokenOptions.uaBrowserVersion).toBe('12');
      expect(sessionTokenOptions.uaOS).toBe('iOS');
      expect(sessionTokenOptions.uaOSVersion).toBe('7');
      expect(sessionTokenOptions.uaDeviceType).toBe('desktop');
      expect(sessionTokenOptions.uaFormFactor).toBe('womble');
    });
  });

  it('correctly reports verification reason for unverified emails', () => {
    request.auth.credentials.emailVerified = false;
    return runTest(route, request).then((res: any) => {
      expect(Object.keys(res).length).toBe(8);
      expect(res.uid).toBe(request.auth.credentials.uid);
      expect(res.sessionToken).toBeTruthy();
      expect(res.authAt).toBe(request.auth.credentials.createdAt);
      expect(res.emailVerified).toBe(false);
      expect(res.sessionVerified).toBe(true);
      expect(res.verified).toBe(false);
      expect(res.verificationMethod).toBe('email');
      expect(res.verificationReason).toBe('signup');
    });
  });
});

describe('/session/verify_code', () => {
  let route: any,
    request: any,
    log: any,
    db: any,
    mailer: any,
    fxaMailer: any,
    push: any,
    customs: any,
    cadReminders: any,
    expectedCode: any;

  function setup(options: any = {}) {
    db = mocks.mockDB({ ...signupCodeAccount, ...options });
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    fxaMailer = mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
    push = mocks.mockPush();
    customs = mocks.mockCustoms();
    customs.check = jest.fn(() => Promise.resolve(true));
    cadReminders = mocks.mockCadReminders();
    const statsd = mocks.mockStatsd();
    const config = {};

    const routes = makeRoutes({
      log,
      config,
      db,
      mailer,
      push,
      customs,
      cadReminders,
      gleanMock,
      statsd,
    });
    route = getRoute(routes, '/session/verify_code');

    expectedCode = getExpectedOtpCode({}, signupCodeAccount.emailCode);

    request = mocks.mockRequest({
      credentials: {
        ...signupCodeAccount,
        uaBrowser: 'Firefox',
        id: 'sessionTokenId',
      },
      payload: {
        code: expectedCode,
        service: 'sync',
        newsletters: [],
      },
      log,
      uaBrowser: 'Firefox',
    });
    request.emitMetricsEvent = jest.fn(() => Promise.resolve({}));
  }

  beforeEach(() => {
    setup();
  });

  it('should verify the account and session with a valid code', async () => {
    gleanMock.registration.accountVerified.mockClear();
    gleanMock.registration.complete.mockClear();
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
    expect(customs.checkAuthenticated).toHaveBeenCalledWith(
      request,
      signupCodeAccount.uid,
      signupCodeAccount.email,
      'verifySessionCode'
    );
    expect(db.account).toHaveBeenCalledTimes(1);
    expect(db.account).toHaveBeenCalledWith(signupCodeAccount.uid);
    expect(db.verifyEmail).toHaveBeenCalledTimes(1);
    expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
    expect(db.verifyTokensWithMethod).toHaveBeenCalledWith(
      'sessionTokenId',
      'email-2fa'
    );
    expect(fxaMailer.sendPostVerifyEmail).toHaveBeenCalledTimes(1);
    expect(gleanMock.registration.accountVerified).toHaveBeenCalledTimes(1);
    expect(gleanMock.registration.complete).toHaveBeenCalledTimes(1);
  });

  it('should skip verify account and but still verify session with a valid code', async () => {
    setup({ emailVerified: true });
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(db.account).toHaveBeenCalledTimes(1);
    expect(db.account).toHaveBeenCalledWith(signupCodeAccount.uid);
    expect(db.verifyEmail).not.toHaveBeenCalled();
    expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
    expect(db.verifyTokensWithMethod).toHaveBeenCalledWith(
      'sessionTokenId',
      'email-2fa'
    );
    expect(push.notifyAccountUpdated).toHaveBeenCalledTimes(1);

    const args = request.emitMetricsEvent.mock.calls[1];
    expect(args[0]).toBe('account.confirmed');
    expect(args[1].uid).toBe(signupCodeAccount.uid);
    expect(gleanMock.login.verifyCodeConfirmed).toHaveBeenCalledTimes(1);
    expect(fxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(1);
  });

  it('should succeed even if push notification fails', async () => {
    setup({ emailVerified: true });
    push.notifyAccountUpdated = jest.fn(() =>
      Promise.reject(new Error('push timeout'))
    );
    const routes = makeRoutes({
      log,
      config: {},
      db,
      mailer,
      push,
      customs,
      cadReminders,
      gleanMock,
    });
    route = getRoute(routes, '/session/verify_code');

    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(push.notifyAccountUpdated).toHaveBeenCalledTimes(1);
  });

  it('should fail for invalid code', async () => {
    request.payload.code =
      request.payload.code === '123123' ? '123122' : '123123';
    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: 183,
      output: { statusCode: 400 },
    });
  });

  it('should verify the account and send post verify email with old sync scope', async () => {
    request.payload = {
      code: expectedCode,
      scopes: ['https://identity.mozilla.com/apps/oldsync'],
    };
    await runTest(route, request);
    expect(db.verifyEmail).toHaveBeenCalledTimes(1);
    expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
    expect(fxaMailer.sendPostVerifyEmail).toHaveBeenCalledTimes(1);
  });

  it('should verify the account and not send post verify email', async () => {
    request.payload = {
      code: expectedCode,
      scopes: [],
    };
    await runTest(route, request);
    expect(db.verifyEmail).toHaveBeenCalledTimes(1);
    expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
    expect(fxaMailer.sendPostVerifyEmail).not.toHaveBeenCalled();
    expect(mailer.sendPostVerifyEmail).not.toHaveBeenCalled();
  });
});

describe('/session/resend_code', () => {
  let route: any,
    request: any,
    log: any,
    db: any,
    mailer: any,
    fxaMailer: any,
    oauthClientInfo: any,
    push: any,
    customs: any;

  beforeEach(() => {
    db = mocks.mockDB({ ...signupCodeAccount });
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    fxaMailer = mocks.mockFxaMailer();
    oauthClientInfo = mocks.mockOAuthClientInfo();
    push = mocks.mockPush();
    customs = {
      check: jest.fn(),
      checkAuthenticated: jest.fn(),
    };
    const config = {};
    const routes = makeRoutes({ log, config, db, mailer, push, customs });
    route = getRoute(routes, '/session/resend_code');

    request = mocks.mockRequest({
      acceptLanguage: 'en-US',
      credentials: {
        ...signupCodeAccount,
        uaBrowser: 'Firefox',
        id: 'sessionTokenId',
      },
      log,
      location: {
        city: 'Mountain View',
        country: 'United States',
        countryCode: 'US',
        state: 'California',
        stateCode: 'CA',
      },
      timeZone: 'America/Los_Angeles',
      uaBrowser: 'Firefox',
    });
  });

  it('should resend the verification code email with unverified account', async () => {
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(db.account).toHaveBeenCalledTimes(1);
    expect(fxaMailer.sendVerifyShortCodeEmail).toHaveBeenCalledTimes(1);

    const expectedCode = getExpectedOtpCode({}, signupCodeAccount.emailCode);
    const args = fxaMailer.sendVerifyShortCodeEmail.mock.calls[0][0];
    expect(args.acceptLanguage).toBe('en-US');
    expect(args.code).toBe(expectedCode);
    expect(args.location.city).toBe('Mountain View');
    expect(args.location.country).toBe('United States');
    expect(args.location.stateCode).toBe('CA');
    expect(args.timeZone).toBe('America/Los_Angeles');

    expect(customs.checkAuthenticated).toHaveBeenCalledWith(
      request,
      signupCodeAccount.uid,
      signupCodeAccount.email,
      'sendVerifyCode'
    );
  });

  it('should resend the verification code email with verified account', async () => {
    const verifiedAccount = {
      uid: 'foo',
      email: 'foo@example.org',
      primaryEmail: {
        isVerified: true,
        isPrimary: true,
        emailCode: 'abcdef',
      },
    };

    db.account = jest.fn(() => verifiedAccount);
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(db.account).toHaveBeenCalledTimes(1);
    expect(oauthClientInfo.fetch).toHaveBeenCalledTimes(1);
    expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);

    const expectedCode = getExpectedOtpCode(
      {},
      verifiedAccount.primaryEmail.emailCode
    );
    const args = fxaMailer.sendVerifyLoginCodeEmail.mock.calls[0];
    expect(args[0].code).toBe(expectedCode);
  });
});

describe('/session/verify/send_push', () => {
  let route: any, request: any, log: any, db: any, mailer: any, push: any;

  beforeEach(() => {
    db = mocks.mockDB({ ...signupCodeAccount, devices: MOCK_DEVICES });
    db.totpToken = jest.fn(() => Promise.resolve({ enabled: false }));
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    push = mocks.mockPush();
    const config = {
      contentServer: { url: 'http://localhost:3030' },
    };
    const routes = makeRoutes({ log, config, db, mailer, push });
    route = getRoute(routes, '/session/verify/send_push');

    request = mocks.mockRequest({
      credentials: {
        ...signupCodeAccount,
        uaBrowser: 'Firefox',
        id: 'sessionTokenId',
      },
      log,
      uaBrowser: 'Firefox',
    });
  });

  it('should send a push notification with verification code', async () => {
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(db.devices).toHaveBeenCalledTimes(1);
    expect(db.totpToken).toHaveBeenCalledTimes(1);
    expect(db.account).toHaveBeenCalledTimes(1);

    const args = push.notifyVerifyLoginRequest.mock.calls[0];
    expect(args[0]).toBe('foo');
    expect(args[1]).toEqual([
      {
        sessionTokenId: 'sessionTokenId2',
        name: 'foo2',
        type: 'desktop',
        pushEndpointExpired: false,
        pushPublicKey: 'foo',
        uaBrowser: 'Firefox',
      },
    ]);
    expect(args[2].title).toBe('Logging in to your Mozilla account?');
    expect(args[2].body).toBe('Click here to confirm it\u2019s you');
    const url = args[2].url;
    expect(url).toContain('http://localhost:3030/signin_push_code_confirm?');
    expect(url).toContain('tokenVerificationId=sometoken');
    expect(url).toMatch(/code=\d{6}/);
    expect(url).toContain('uid=foo');
    expect(url).toContain('email=foo%40example.org');
    expect(url).toContain(
      'remoteMetaData=%257B%2522deviceFamily%2522%253A%2522Firefox%2522%252C%2522ipAddress%2522%253A%252263.245.221.32%2522%257D'
    );
  });

  it('should not send a push notification if TOTP token is verified and enabled', async () => {
    db.totpToken = jest.fn(() =>
      Promise.resolve({ verified: true, enabled: true })
    );
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(db.totpToken).toHaveBeenCalledTimes(1);
    expect(push.notifyVerifyLoginRequest).not.toHaveBeenCalled();
  });
});

describe('/session/verify/verify_push', () => {
  let route: any,
    request: any,
    log: any,
    db: any,
    mailer: any,
    push: any,
    customs: any;

  beforeEach(() => {
    db = mocks.mockDB({ ...signupCodeAccount, devices: MOCK_DEVICES });
    db.deviceFromTokenVerificationId = jest.fn(() =>
      Promise.resolve(MOCK_DEVICES[1])
    );
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    push = mocks.mockPush();
    customs = mocks.mockCustoms();
    mocks.mockOAuthClientInfo();
    const config = {};
    const routes = makeRoutes({ log, config, db, mailer, push, customs });
    route = getRoute(routes, '/session/verify/verify_push');
  });

  it('should verify push notification login request', async () => {
    const expectedCode = getExpectedOtpCode({}, signupCodeAccount.emailCode);
    request = mocks.mockRequest({
      log,
      credentials: {
        ...signupCodeAccount,
        uaBrowser: 'Firefox',
        id: 'sessionTokenId',
      },
      payload: {
        code: expectedCode,
        uid: 'foo',
        email: 'a@aa.com',
        tokenVerificationId: 'sometoken',
      },
    });
    const response = await runTest(route, request);
    expect(response).toEqual({});

    expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
    expect(customs.checkAuthenticated).toHaveBeenCalledWith(
      request,
      'foo',
      signupCodeAccount.email,
      'verifySessionCode'
    );
    expect(db.devices).toHaveBeenCalledTimes(1);
    expect(db.devices).toHaveBeenCalledWith('foo');
    expect(db.deviceFromTokenVerificationId).toHaveBeenCalledTimes(1);
    expect(db.deviceFromTokenVerificationId).toHaveBeenCalledWith(
      'foo',
      'sometoken'
    );
    expect(db.account).toHaveBeenCalledTimes(1);
    expect(db.account.mock.calls[0][0]).toBe('foo');
    expect(db.verifyTokens).toHaveBeenCalledTimes(1);
    expect(db.verifyTokens.mock.calls[0][0]).toBe('sometoken');

    expect(push.notifyAccountUpdated).toHaveBeenCalledTimes(1);
    expect(push.notifyAccountUpdated).toHaveBeenCalledWith(
      'foo',
      MOCK_DEVICES,
      'accountConfirm'
    );
  });

  it('should return if session is already verified', async () => {
    db.deviceFromTokenVerificationId = jest.fn(() =>
      Promise.resolve(undefined)
    );
    request = mocks.mockRequest({
      log,
      credentials: {
        ...signupCodeAccount,
        uaBrowser: 'Firefox',
        id: 'sessionTokenId',
      },
      payload: {
        code: '123123',
        uid: 'foo',
        email: 'foo@example.org',
        tokenVerificationId: 'sometoken',
      },
    });
    const response = await runTest(route, request);
    expect(response).toEqual({});
    expect(db.verifyTokens).not.toHaveBeenCalled();
  });

  it('should fail if invalid code', async () => {
    request = mocks.mockRequest({
      log,
      credentials: {
        ...signupCodeAccount,
        uaBrowser: 'Firefox',
        id: 'sessionTokenId',
      },
      payload: {
        code: '123123',
        uid: 'foo',
        email: 'foo@example.org',
        tokenVerificationId: 'sometoken',
      },
    });
    await expect(runTest(route, request)).rejects.toMatchObject({
      errno: 183,
      message: 'Invalid or expired confirmation code',
    });

    expect(customs.checkAuthenticated).toHaveBeenCalledTimes(2);
    expect(customs.checkAuthenticated).toHaveBeenCalledWith(
      request,
      'foo',
      'foo@example.org',
      'verifySessionCode'
    );

    expect(customs.checkAuthenticated).toHaveBeenCalledWith(
      request,
      'foo',
      'foo@example.org',
      'verifySessionCodeFailed'
    );
  });
});
