/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const { Container } = require('typedi');
const { OtpUtils } = require('../../../lib/routes/utils/otp');
const { AccountEventsManager } = require('../../../lib/account-events');
const { strategy } = require('../../../lib/routes/auth-schemes/mfa');

describe('mfa', () => {
  let log,
    db,
    customs,
    routes,
    route,
    request,
    mailer,
    otpUtils,
    statsd,
    mockGetCredentialsFunc,
    code = '';

  const TEST_EMAIL = 'test@email.com';
  const UID = 'uid';
  const SESSION_TOKEN_ID = 'session-123';
  const UA_BROWSER = 'Firefox';
  const action = 'test';
  const sandbox = sinon.createSandbox();

  const config = {
    mfa: {
      enabled: true,
      actions: ['test'],
      otp: {
        digits: 6,
        // Code would be valid for 30 seconds
        step: 1,
        window: 30,
      },
      jwt: {
        secretKey: 'foxes',
        expiresInSec: 10,
        audience: 'fxa',
        issuer: 'accounts.firefox.com',
      },
    },
  };

  async function runTest(routePath, requestOptions, method) {
    routes = require('../../../lib/routes/mfa').default(
      customs,
      db,
      log,
      mailer,
      statsd,
      config
    );
    route = getRoute(routes, routePath, method);
    request = mocks.mockRequest(requestOptions);
    request.emitMetricsEvent = sandbox.spy(() => Promise.resolve({}));
    return await route.handler(request);
  }

  async function runAuthStrategyTest(token) {
    const { authenticate } = strategy(config, mockGetCredentialsFunc)();
    const req = {
      headers: {
        authorization: 'Bearer ' + token,
      },
    };
    const h = {
      authenticated(opts) {
        return opts;
      },
    };
    return authenticate(req, h);
  }

  beforeEach(() => {
    const mockAccountEventsManager = {
      recordSecurityEvent: sandbox.fake(),
    };
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    mailer = mocks.mockMailer();
    statsd = mocks.mockStatsd();
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
    });
    // TODO: Add and check glean events
    // glean = mocks.mockGlean();
    otpUtils = new OtpUtils(db, statsd);
    mockGetCredentialsFunc = sandbox.fake.returns({
      // There's typically much more data returned by this callback, but
      // for testing purposes this is sufficient.
      id: SESSION_TOKEN_ID,
      uid: UID,
      uaBrowser: UA_BROWSER,
    });

    Container.set(OtpUtils, otpUtils);
    Container.set(AccountEventsManager, mockAccountEventsManager);

    code = '';
    mailer.sendVerifyAccountChangeEmail = sandbox.spy(
      (_emails, _account, data) => {
        code = data.code;
      }
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('sends otp, verifies otp, and gets a valid jwt in return', async () => {
    const requestResult = await runTest(
      '/mfa/otp/request',
      {
        credentials: {
          uid: UID,
          id: SESSION_TOKEN_ID,
          email: TEST_EMAIL,
        },
        payload: {
          action,
        },
      },
      'POST'
    );

    const verifyResult = await runTest(
      '/mfa/otp/verify',
      {
        credentials: {
          uid: UID,
          id: SESSION_TOKEN_ID,
          email: TEST_EMAIL,
        },
        payload: {
          action,
          code,
        },
      },
      'POST'
    );

    // Due to how we mock this stuff, the auth strategy doesn't kick in, so test it directly.
    const authResult = await runAuthStrategyTest(verifyResult.accessToken);

    assert.isDefined(requestResult);
    assert.equal(requestResult.status, 'success');
    assert.match(code, new RegExp(`^\\d{${config.mfa.otp.digits}}$`));

    assert.isDefined(verifyResult);
    assert.isDefined(verifyResult.accessToken);

    assert.isDefined(authResult);
    assert.equal(authResult.credentials.uid, UID);
    assert.equal(authResult.credentials.scope[0], 'mfa:test');

    // The session token id should be extracted from the jwt
    // and queried so we can get all the meta data about the
    // session that this token was issued from.
    assert.equal(authResult.credentials.id, SESSION_TOKEN_ID);
    assert.equal(authResult.credentials.uaBrowser, UA_BROWSER);
  });

  it('will not allow an invalid token', async () => {
    let error;
    try {
      await runAuthStrategyTest('boo');
    } catch (err) {
      error = err;
    }
    assert.isDefined(error);
    assert.equal(error.errno, 110);
    assert.equal(error.message, 'Unauthorized for route');
  });

  it('will not allow an expired token', async () => {
    let error;
    try {
      // Old, but previously valid token
      await runAuthStrategyTest(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWQiLCJzY29wZSI6WyJwcm90ZWN0ZWQtYWN0aW9uczp0ZXN0Il0sImlhdCI6MTc1NTg4MTQ4NiwianRpIjoiY2QyNTJjZjYtM2MwNi00OWYyLWE4OTItNjU5NTc2MjhjZWU5IiwiZXhwIjoxNzU1ODgxNDk2LCJhdWQiOiJmeGEiLCJpc3MiOiJhY2NvdW50cy5maXJlZm94LmNvbSJ9.GB_vrTsRXmpVF5WYKCaUPqCcP5WOBS2wOvuzvkjafiw'
      );
    } catch (err) {
      error = err;
    }
    assert.isDefined(error);
    assert.equal(error.errno, 110);
    assert.equal(error.message, 'Unauthorized for route');
  });
});
