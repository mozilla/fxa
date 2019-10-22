/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const getRoute = require('../../routes_helpers').getRoute;
const knownIpLocation = require('../../known-ip-location');
const mocks = require('../../mocks');
const P = require('../../../lib/promise');
const error = require('../../../lib/error');
const sinon = require('sinon');
const otplib = require('otplib');
const assert = require('../../assert');

const ROOT_DIR = '../../..';

const signupCodeAccount = {
  uid: 'foo',
  email: 'foo@example.org',
  emailCode: 'abcdef',
  emailVerified: false,
};

function makeRoutes(options = {}) {
  const config = options.config || {};
  config.oauth = config.oauth || {};
  config.smtp = config.smtp || {};
  const db = options.db || mocks.mockDB();
  const log = options.log || mocks.mockLog();
  const mailer = options.mailer || mocks.mockMailer();
  const Password =
    options.Password || require('../../../lib/crypto/password')(log, config);
  const customs = options.customs || {
    check: () => {
      return P.resolve(true);
    },
  };
  const signinUtils =
    options.signinUtils ||
    require('../../../lib/routes/utils/signin')(
      log,
      config,
      customs,
      db,
      mailer
    );

  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const push = options.push || mocks.mockPush();
  const signupUtils =
    options.signupUtils ||
    require('../../../lib/routes/utils/signup')(
      log,
      db,
      mailer,
      push,
      verificationReminders
    );
  if (options.checkPassword) {
    signinUtils.checkPassword = options.checkPassword;
  }
  return require('../../../lib/routes/session')(
    log,
    db,
    Password,
    config,
    signinUtils,
    signupUtils,
    mailer
  );
}

function runTest(route, request) {
  return route.handler(request);
}

function hexString(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function getExpectedOtpCode(options = {}, secret = 'abcdef') {
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
  const log = mocks.mockLog();
  const config = {};
  const routes = makeRoutes({ log, config });
  const route = getRoute(routes, '/session/status');
  const request = mocks.mockRequest({
    credentials: {
      email: 'foo@example.org',
      state: 'unverified',
      uid: 'foo',
    },
  });

  it('returns status correctly', () => {
    return runTest(route, request).then(res => {
      assert.equal(Object.keys(res).length, 2);
      assert.equal(res.uid, 'foo');
      assert.equal(res.state, 'unverified');
    });
  });
});

describe('/session/reauth', () => {
  const TEST_EMAIL = 'foo@example.com';
  const TEST_UID = 'abcdef123456';
  const TEST_AUTHPW = hexString(32);

  let log,
    config,
    customs,
    db,
    mailer,
    signinUtils,
    routes,
    route,
    request,
    SessionToken;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {};
    customs = {
      check: () => {
        return P.resolve(true);
      },
    };
    db = mocks.mockDB({
      email: TEST_EMAIL,
      uid: TEST_UID,
    });
    mailer = mocks.mockMailer();
    signinUtils = require('../../../lib/routes/utils/signin')(
      log,
      config,
      customs,
      db,
      mailer
    );
    SessionToken = require('../../../lib/tokens/index')(log, config)
      .SessionToken;
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
    }).then(sessionToken => {
      request.auth.credentials = sessionToken;
    });
  });

  it('emits the correct series of calls', () => {
    signinUtils.checkEmailAddress = sinon.spy(() => P.resolve(true));
    signinUtils.checkPassword = sinon.spy(() => P.resolve(true));
    signinUtils.checkCustomsAndLoadAccount = sinon.spy(() =>
      P.props({ accountRecord: db.accountRecord(TEST_EMAIL) })
    );
    signinUtils.sendSigninNotifications = sinon.spy(() => P.resolve());
    signinUtils.createKeyFetchToken = sinon.spy(() =>
      P.resolve({ data: 'KEYFETCHTOKEN' })
    );
    signinUtils.getSessionVerificationStatus = sinon.spy(() => ({
      verified: true,
    }));
    const testNow = Math.floor(Date.now() / 1000);
    return runTest(route, request).then(res => {
      assert.equal(
        signinUtils.checkCustomsAndLoadAccount.callCount,
        1,
        'checkCustomsAndLoadAccount was called'
      );
      let args = signinUtils.checkCustomsAndLoadAccount.args[0];
      assert.equal(
        args.length,
        2,
        'checkCustomsAndLoadAccount was called with correct number of arguments'
      );
      assert.equal(
        args[0],
        request,
        'checkCustomsAndLoadAccount was called with request as first argument'
      );
      assert.equal(
        args[1],
        TEST_EMAIL,
        'checkCustomsAndLoadAccount was called with email as second argument'
      );

      assert.equal(
        db.accountRecord.callCount,
        1,
        'db.accountRecord was called'
      );
      args = db.accountRecord.args[0];
      assert.equal(
        args.length,
        1,
        'db.accountRecord was called with correct number of arguments'
      );
      assert.equal(
        args[0],
        TEST_EMAIL,
        'db.accountRecord was called with email as first argument'
      );

      assert.equal(
        signinUtils.checkEmailAddress.callCount,
        1,
        'checkEmaiLAddress was called'
      );
      args = signinUtils.checkEmailAddress.args[0];
      assert.equal(
        args.length,
        3,
        'checkEmailAddress was called with correct number of arguments'
      );
      assert.equal(
        args[0].uid,
        TEST_UID,
        'checkEmailAddress was called with account record as first argument'
      );
      assert.equal(
        args[1],
        TEST_EMAIL,
        'checkEmaiLAddress was called with email as second argument'
      );
      assert.equal(
        args[2],
        undefined,
        'checkEmaiLAddress was called with undefined originalLoginEmail as third argument'
      );

      assert.equal(
        signinUtils.checkPassword.callCount,
        1,
        'checkPassword was called'
      );
      args = signinUtils.checkPassword.args[0];
      assert.equal(
        args.length,
        3,
        'checkPassword was called with correct number of arguments'
      );
      assert.equal(
        args[0].uid,
        TEST_UID,
        'checkPassword was called with account record as first argument'
      );
      assert.equal(
        args[1].authPW.toString('hex'),
        TEST_AUTHPW,
        'checkPassword was called with Password object as second argument'
      );
      assert.equal(
        args[2],
        knownIpLocation.ip,
        'checkPassword was called with mock ip address as third argument'
      );

      assert.equal(
        db.updateSessionToken.callCount,
        1,
        'db.updateSessionToken was called'
      );
      args = db.updateSessionToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.updateSessionToken was called with correct number of arguments'
      );
      assert.equal(
        args[0],
        request.auth.credentials,
        'db.updateSessionToken was called with sessionToken as first argument'
      );

      assert.equal(
        signinUtils.sendSigninNotifications.callCount,
        1,
        'sendSigninNotifications was called'
      );
      args = signinUtils.sendSigninNotifications.args[0];
      assert.equal(
        args.length,
        4,
        'sendSigninNotifications was called with correct number of arguments'
      );
      assert.equal(
        args[0],
        request,
        'sendSigninNotifications was called with request as first argument'
      );
      assert.equal(
        args[1].uid,
        TEST_UID,
        'sendSigninNotifications was called with account record as second argument'
      );
      assert.equal(
        args[2],
        request.auth.credentials,
        'sendSigninNotifications was called with sessionToken as third argument'
      );
      assert.equal(
        args[3],
        undefined,
        'sendSigninNotifications was called with undefined verificationMethod as third argument'
      );

      assert.equal(
        signinUtils.createKeyFetchToken.callCount,
        1,
        'createKeyFetchToken was called'
      );
      args = signinUtils.createKeyFetchToken.args[0];
      assert.equal(
        args.length,
        4,
        'createKeyFetchToken was called with correct number of arguments'
      );
      assert.equal(
        args[0],
        request,
        'createKeyFetchToken was called with request as first argument'
      );
      assert.equal(
        args[1].uid,
        TEST_UID,
        'createKeyFetchToken was called with account record as second argument'
      );
      assert.equal(
        args[2].authPW.toString('hex'),
        TEST_AUTHPW,
        'createKeyFetchToken was called with Password object as third argument'
      );
      assert.equal(
        args[3],
        request.auth.credentials,
        'createKeyFetchToken was called with sessionToken as fourth argument'
      );

      assert.equal(
        signinUtils.getSessionVerificationStatus.callCount,
        1,
        'getSessionVerificationStatus was called'
      );
      args = signinUtils.getSessionVerificationStatus.args[0];
      assert.equal(
        args.length,
        2,
        'getSessionVerificationStatus was called with correct number of arguments'
      );
      assert.equal(
        args[0],
        request.auth.credentials,
        'getSessionVerificationStatus was called with sessionToken as first argument'
      );
      assert.equal(
        args[1],
        undefined,
        'getSessionVerificationStatus was called with undefined verificationMethod as first argument'
      );

      assert.equal(
        Object.keys(res).length,
        4,
        'response object had correct number of keys'
      );
      assert.equal(res.uid, TEST_UID, 'response object contained correct uid');
      assert.ok(
        res.authAt >= testNow,
        'response object contained an updated authAt timestamp'
      );
      assert.equal(
        res.keyFetchToken,
        'KEYFETCHTOKEN',
        'response object contained the keyFetchToken'
      );
      assert.equal(
        res.verified,
        true,
        'response object indicated correct verification status'
      );
    });
  });

  it('correctly updates sessionToken details', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(true);
    });
    const testNow = Date.now();
    const testNowSeconds = Math.floor(Date.now() / 1000);

    assert.ok(
      !request.auth.credentials.authAt,
      'sessionToken starts off with no authAt'
    );
    assert.ok(
      request.auth.credentials.lastAuthAt() < testNowSeconds,
      'sessionToken starts off with low lastAuthAt'
    );
    assert.ok(
      !request.auth.credentials.uaBrowser,
      'sessionToken starts off with no uaBrowser'
    );
    assert.ok(
      !request.auth.credentials.uaBrowserVersion,
      'sessionToken starts off with no uaBrowserVersion'
    );
    assert.ok(
      !request.auth.credentials.uaOS,
      'sessionToken starts off with no uaOS'
    );
    assert.ok(
      !request.auth.credentials.uaOSVersion,
      'sessionToken starts off with no uaOSVersion'
    );
    assert.ok(
      !request.auth.credentials.uaDeviceType,
      'sessionToken starts off with no uaDeviceType'
    );
    assert.ok(
      !request.auth.credentials.uaFormFactor,
      'sessionToken starts off with no uaFormFactor'
    );

    return runTest(route, request).then(res => {
      assert.equal(
        db.updateSessionToken.callCount,
        1,
        'db.updateSessionToken was called'
      );
      const sessionToken = db.updateSessionToken.args[0][0];
      assert.ok(
        sessionToken.authAt >= testNow,
        'sessionToken has updated authAt timestamp'
      );
      assert.ok(
        sessionToken.lastAuthAt() >= testNowSeconds,
        'sessionToken has udpated lastAuthAt'
      );
      assert.equal(
        sessionToken.uaBrowser,
        'Firefox',
        'sessionToken has updated uaBrowser'
      );
      assert.equal(
        sessionToken.uaBrowserVersion,
        '50',
        'sessionToken has updated uaBrowserVersion'
      );
      assert.equal(
        sessionToken.uaOS,
        'Android',
        'sessionToken has updated uaOS'
      );
      assert.equal(
        sessionToken.uaOSVersion,
        '6',
        'sessionToken has updated uaOSVersion'
      );
      assert.equal(
        sessionToken.uaDeviceType,
        'mobile',
        'sessionToken has updated uaDeviceType'
      );
      assert.equal(
        sessionToken.uaFormFactor,
        'trapezoid',
        'sessionToken has updated uaFormFactor'
      );
    });
  });

  it('correctly updates to mustVerify=true when requesting keys', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(true);
    });

    assert.ok(
      !request.auth.credentials.mustVerify,
      'sessionToken starts off with mustVerify=false'
    );

    return runTest(route, request).then(res => {
      assert.equal(
        db.updateSessionToken.callCount,
        1,
        'db.updateSessionToken was called'
      );
      const sessionToken = db.updateSessionToken.args[0][0];
      assert.ok(
        sessionToken.mustVerify,
        'sessionToken has updated to mustVerify=true'
      );
    });
  });

  it('correctly updates to mustVerify=true when explicit verificationMethod is requested in payload', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(true);
    });

    assert.ok(
      !request.auth.credentials.mustVerify,
      'sessionToken starts off with mustVerify=false'
    );

    request.payload.verificationMethod = 'email-2fa';
    return runTest(route, request).then(res => {
      assert.equal(
        db.updateSessionToken.callCount,
        1,
        'db.updateSessionToken was called'
      );
      const sessionToken = db.updateSessionToken.args[0][0];
      assert.ok(
        sessionToken.mustVerify,
        'sessionToken has updated to mustVerify=true'
      );
    });
  });

  it('leaves mustVerify=false when not requesting keys', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(true);
    });
    request.query.keys = false;

    assert.ok(
      !request.auth.credentials.mustVerify,
      'sessionToken starts off with mustVerify=false'
    );

    return runTest(route, request).then(res => {
      assert.equal(
        db.updateSessionToken.callCount,
        1,
        'db.updateSessionToken was called'
      );
      const sessionToken = db.updateSessionToken.args[0][0];
      assert.ok(
        !sessionToken.mustVerify,
        'sessionToken still has mustVerify=false'
      );
    });
  });

  it('does not return a keyFetchToken when not requesting keys', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(true);
    });
    signinUtils.createKeyFetchToken = sinon.spy(() => {
      assert.fail('should not be called');
    });
    request.query.keys = false;

    return runTest(route, request).then(res => {
      assert.equal(
        signinUtils.createKeyFetchToken.callCount,
        0,
        'createKeyFetchToken was not called'
      );
      assert.ok(
        !res.keyFetchToken,
        'response object did not contain a keyFetchToken'
      );
    });
  });

  it('correctly rejects incorrect passwords', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(false);
    });

    return runTest(route, request).then(
      res => {
        assert.fail('request should have been rejected');
      },
      err => {
        assert.equal(
          signinUtils.checkPassword.callCount,
          1,
          'checkPassword was called'
        );
        assert.equal(
          err.errno,
          error.ERRNO.INCORRECT_PASSWORD,
          'the errno was correct'
        );
      }
    );
  });

  it('reflects the requested verificationMethod in the response body', () => {
    signinUtils.checkPassword = sinon.spy(() => {
      return P.resolve(true);
    });
    request.auth.credentials.emailVerified = true;
    request.auth.credentials.tokenVerified = false;
    request.auth.credentials.tokenVerificationId = 'myCoolId';
    request.auth.credentials.tokenVerificationCode = 'myAwesomerCode';
    request.auth.credentials.tokenVerificationCodeExpiresAt =
      Date.now() + 10000;
    request.payload.verificationMethod = 'email-2fa';
    return runTest(route, request).then(res => {
      assert.ok(res);
      assert.equal(
        res.verified,
        false,
        'result reports the session as unverified'
      );
      assert.equal(
        res.verificationReason,
        'login',
        'result reports the verificationReason as "login"'
      );
      assert.equal(
        res.verificationMethod,
        'email-2fa',
        'result reports the verificationReason as requested'
      );
    });
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

    try {
      await runTest(route, mockRequest);
      assert.fail('should have errored');
    } catch (err) {
      assert.equal(err.output.statusCode, 503);
      assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
    }
  });
});

describe('/session/destroy', () => {
  let route;
  let request;
  let log;
  let db;

  beforeEach(() => {
    db = mocks.mockDB();
    log = mocks.mockLog();
    const config = {};
    const routes = makeRoutes({ log, config, db });
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
    return runTest(route, request).then(res => {
      assert.equal(Object.keys(res).length, 0);
    });
  });

  it('responds correctly when custom session is destroyed', () => {
    db.sessionToken = sinon.spy(() => {
      return P.resolve({
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

    return runTest(route, request).then(res => {
      assert.equal(Object.keys(res).length, 0);
    });
  });

  it('throws on invalid session token', () => {
    db.sessionToken = sinon.spy(() => {
      return P.resolve({
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

    return runTest(route, request).then(assert, err => {
      assert.equal(err.message, 'Invalid session token');
    });
  });
});

describe('/session/duplicate', () => {
  let route;
  let request;
  let log;
  let db;

  beforeEach(async () => {
    db = mocks.mockDB({});
    log = mocks.mockLog();
    const config = {};
    const routes = makeRoutes({ log, config, db });
    route = getRoute(routes, '/session/duplicate');

    const Token = require(`${ROOT_DIR}/lib/tokens/token`)(log);
    const SessionToken = require(`${ROOT_DIR}/lib/tokens/session_token`)(
      log,
      Token,
      {
        tokenLifetimes: {
          sessionTokenWithoutDevice: 2419200000,
        },
      }
    );

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
    return runTest(route, request).then(res => {
      assert.equal(
        Object.keys(res).length,
        4,
        'response has correct number of keys'
      );
      assert.equal(
        res.uid,
        request.auth.credentials.uid,
        'response includes correctly-copied uid'
      );
      assert.ok(res.sessionToken, 'response includes a sessionToken');
      assert.equal(
        res.authAt,
        request.auth.credentials.createdAt,
        'response includes correctly-copied auth timestamp'
      );
      assert.equal(
        res.verified,
        true,
        'response includes correctly-copied verification flag'
      );

      assert.equal(
        db.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      const sessionTokenOptions = db.createSessionToken.args[0][0];
      assert.equal(
        Object.keys(sessionTokenOptions).length,
        37,
        'was called with correct number of options'
      );
      assert.equal(
        sessionTokenOptions.uid,
        'foo',
        'db.createSessionToken called with correct uid'
      );
      assert.ok(
        sessionTokenOptions.createdAt,
        'db.createSessionToken called with correct createdAt'
      );
      assert.equal(
        sessionTokenOptions.email,
        'foo@example.org',
        'db.createSessionToken called with correct email'
      );
      assert.equal(
        sessionTokenOptions.emailCode,
        'abcdef',
        'db.createSessionToken called with correct emailCode'
      );
      assert.equal(
        sessionTokenOptions.emailVerified,
        true,
        'db.createSessionToken called with correct emailverified'
      );
      assert.equal(
        sessionTokenOptions.verifierSetAt,
        123456,
        'db.createSessionToken called with correct verifierSetAt'
      );
      assert.equal(
        sessionTokenOptions.locale,
        'en-AU',
        'db.createSessionToken called with correct locale'
      );
      assert.ok(
        !sessionTokenOptions.mustVerify,
        'db.createSessionToken called with falsy mustVerify'
      );
      assert.equal(
        sessionTokenOptions.tokenVerificationId,
        undefined,
        'db.createSessionToken called with correct tokenVerificationId'
      );
      assert.equal(
        sessionTokenOptions.tokenVerificationCode,
        undefined,
        'db.createSessionToken called with correct tokenVerificationCode'
      );
      assert.equal(
        sessionTokenOptions.tokenVerificationCodeExpiresAt,
        undefined,
        'db.createSessionToken called with correct tokenVerificationCodeExpiresAt'
      );
      assert.equal(
        sessionTokenOptions.uaBrowser,
        'Chrome',
        'db.createSessionToken called with correct uaBrowser'
      );
      assert.equal(
        sessionTokenOptions.uaBrowserVersion,
        '12',
        'db.createSessionToken called with correct uaBrowserVersion'
      );
      assert.equal(
        sessionTokenOptions.uaOS,
        'iOS',
        'db.createSessionToken called with correct uaOS'
      );
      assert.equal(
        sessionTokenOptions.uaOSVersion,
        '7',
        'db.createSessionToken called with correct uaOSVersion'
      );
      assert.equal(
        sessionTokenOptions.uaDeviceType,
        'desktop',
        'db.createSessionToken called with correct uaDeviceType'
      );
      assert.equal(
        sessionTokenOptions.uaFormFactor,
        'womble',
        'db.createSessionToken called with correct uaFormFactor'
      );
    });
  });

  it('correctly generates new codes for unverified sessions', () => {
    request.auth.credentials.tokenVerified = false;
    request.auth.credentials.tokenVerificationId = 'myCoolId';
    request.auth.credentials.tokenVerificationCode = 'myAwesomerCode';
    request.auth.credentials.tokenVerificationCodeExpiresAt =
      Date.now() + 10000;
    return runTest(route, request).then(res => {
      assert.equal(
        Object.keys(res).length,
        6,
        'response has correct number of keys'
      );
      assert.equal(
        res.uid,
        request.auth.credentials.uid,
        'response includes correctly-copied uid'
      );
      assert.ok(res.sessionToken, 'response includes a sessionToken');
      assert.equal(
        res.authAt,
        request.auth.credentials.createdAt,
        'response includes correctly-copied auth timestamp'
      );
      assert.equal(
        res.verified,
        false,
        'response includes correctly-copied verification flag'
      );
      assert.equal(
        res.verificationMethod,
        'email',
        'response includes correct verification method'
      );
      assert.equal(
        res.verificationReason,
        'login',
        'response includes correct verification reason'
      );

      assert.equal(
        db.createSessionToken.callCount,
        1,
        'db.createSessionToken was called once'
      );
      const sessionTokenOptions = db.createSessionToken.args[0][0];
      assert.equal(
        Object.keys(sessionTokenOptions).length,
        37,
        'was called with correct number of options'
      );
      assert.equal(
        sessionTokenOptions.uid,
        'foo',
        'db.createSessionToken called with correct uid'
      );
      assert.ok(
        sessionTokenOptions.createdAt,
        'db.createSessionToken called with correct createdAt'
      );
      assert.equal(
        sessionTokenOptions.email,
        'foo@example.org',
        'db.createSessionToken called with correct email'
      );
      assert.equal(
        sessionTokenOptions.emailCode,
        'abcdef',
        'db.createSessionToken called with correct emailCode'
      );
      assert.equal(
        sessionTokenOptions.emailVerified,
        true,
        'db.createSessionToken called with correct emailverified'
      );
      assert.equal(
        sessionTokenOptions.verifierSetAt,
        123456,
        'db.createSessionToken called with correct verifierSetAt'
      );
      assert.equal(
        sessionTokenOptions.locale,
        'en-AU',
        'db.createSessionToken called with correct locale'
      );
      assert.ok(
        !sessionTokenOptions.mustVerify,
        'db.createSessionToken called with falsy mustVerify'
      );
      assert.ok(
        sessionTokenOptions.tokenVerificationId,
        'db.createSessionToken called with a truthy tokenVerificationId'
      );
      assert.notEqual(
        sessionTokenOptions.tokenVerificationId,
        'myCoolId',
        'db.createSessionToken called with a new tokenVerificationId'
      );
      assert.ok(
        sessionTokenOptions.tokenVerificationCode,
        'db.createSessionToken called with a truthy tokenVerificationCode'
      );
      assert.notEqual(
        sessionTokenOptions.tokenVerificationCode,
        'myAwesomerCode',
        'db.createSessionToken called with a new tokenVerificationCode'
      );
      assert.equal(
        sessionTokenOptions.tokenVerificationCodeExpiresAt,
        0,
        'db.createSessionToken called with correct tokenVerificationCodeExpiresAt'
      );
      assert.equal(
        sessionTokenOptions.uaBrowser,
        'Chrome',
        'db.createSessionToken called with correct uaBrowser'
      );
      assert.equal(
        sessionTokenOptions.uaBrowserVersion,
        '12',
        'db.createSessionToken called with correct uaBrowserVersion'
      );
      assert.equal(
        sessionTokenOptions.uaOS,
        'iOS',
        'db.createSessionToken called with correct uaOS'
      );
      assert.equal(
        sessionTokenOptions.uaOSVersion,
        '7',
        'db.createSessionToken called with correct uaOSVersion'
      );
      assert.equal(
        sessionTokenOptions.uaDeviceType,
        'desktop',
        'db.createSessionToken called with correct uaDeviceType'
      );
      assert.equal(
        sessionTokenOptions.uaFormFactor,
        'womble',
        'db.createSessionToken called with correct uaFormFactor'
      );
    });
  });

  it('correctly reports verification reason for unverified emails', () => {
    request.auth.credentials.emailVerified = false;
    return runTest(route, request).then(res => {
      assert.equal(
        Object.keys(res).length,
        6,
        'response has correct number of keys'
      );
      assert.equal(
        res.uid,
        request.auth.credentials.uid,
        'response includes correctly-copied uid'
      );
      assert.ok(res.sessionToken, 'response includes a sessionToken');
      assert.equal(
        res.authAt,
        request.auth.credentials.createdAt,
        'response includes correctly-copied auth timestamp'
      );
      assert.equal(
        res.verified,
        false,
        'response includes correctly-copied verification flag'
      );
      assert.equal(
        res.verificationMethod,
        'email',
        'response includes correct verification method'
      );
      assert.equal(
        res.verificationReason,
        'signup',
        'response includes correct verification reason'
      );
    });
  });
});

describe('/session/verify_code', () => {
  let route, request, log, db, mailer;

  function setup(options = {}) {
    db = mocks.mockDB({ ...signupCodeAccount, ...options });
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    const config = {};
    const routes = makeRoutes({ log, config, db, mailer });
    route = getRoute(routes, '/session/verify_code');

    const expectedCode = getExpectedOtpCode({}, signupCodeAccount.emailCode);

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
  }

  beforeEach(() => {
    setup();
  });

  it('should verify the account and session with a valid code', async () => {
    const response = await runTest(route, request);
    assert.deepEqual(response, {});
    assert.calledOnce(db.account);
    assert.calledWithExactly(db.account, signupCodeAccount.uid);
    assert.calledOnce(db.verifyEmail);
    assert.calledOnce(db.verifyTokensWithMethod);
    assert.calledWithExactly(
      db.verifyTokensWithMethod,
      'sessionTokenId',
      'email-2fa'
    );
  });

  it('should skip verify account and but still verify session with a valid code', async () => {
    setup({ emailVerified: true });
    const response = await runTest(route, request);
    assert.deepEqual(response, {});
    assert.calledOnce(db.account);
    assert.calledWithExactly(db.account, signupCodeAccount.uid);
    assert.notCalled(db.verifyEmail);
    assert.calledOnce(db.verifyTokensWithMethod);
    assert.calledWithExactly(
      db.verifyTokensWithMethod,
      'sessionTokenId',
      'email-2fa'
    );
  });

  it('should fail for invalid code', async () => {
    request.payload.code =
      request.payload.code === '123123' ? '123122' : '123123';
    await assert.failsAsync(runTest(route, request), {
      errno: 183,
      'output.statusCode': 400,
    });
  });
});

describe('/session/resend_code', () => {
  let route, request, log, db, mailer;

  beforeEach(() => {
    db = mocks.mockDB({ ...signupCodeAccount });
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    const config = {};
    const routes = makeRoutes({ log, config, db, mailer });
    route = getRoute(routes, '/session/resend_code');

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

  it('should resend the verification code email with unverified account', async () => {
    const response = await runTest(route, request);
    assert.deepEqual(response, {});
    assert.calledOnce(db.account);
    assert.calledOnce(mailer.sendVerifyShortCodeEmail);

    const expectedCode = getExpectedOtpCode({}, signupCodeAccount.emailCode);
    const args = mailer.sendVerifyShortCodeEmail.args[0];
    assert.equal(args[2].code, expectedCode);
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

    db.account = sinon.spy(() => verifiedAccount);
    const response = await runTest(route, request);
    assert.deepEqual(response, {});
    assert.calledOnce(db.account);
    assert.calledOnce(mailer.sendVerifyLoginCodeEmail);

    const expectedCode = getExpectedOtpCode(
      {},
      verifiedAccount.primaryEmail.emailCode
    );
    const args = mailer.sendVerifyLoginCodeEmail.args[0];
    assert.equal(args[2].code, expectedCode);
  });
});
