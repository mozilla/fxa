/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/mfa.js (Mocha → Jest).
 * Split sinon.assert + chai assert spread into sinon.assert + expect.
 */

import sinon from 'sinon';
import { Container } from 'typedi';
import { AppError } from '@fxa/accounts/errors';
import { strategy } from './auth-schemes/mfa';

const mocks = require('../../test/mocks');
const getRoute = require('../../test/routes_helpers').getRoute;
const { OtpUtils } = require('./utils/otp');
const { AccountEventsManager } = require('../account-events');

describe('mfa', () => {
  let log: any,
    db: any,
    customs: any,
    routes: any,
    route: any,
    request: any,
    mailer: any,
    otpUtils: any,
    statsd: any,
    mockGetCredentialsFunc: any,
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

  async function runTest(routePath: string, requestOptions: any, method: string) {
    routes = require('./mfa').default(
      customs,
      db,
      log,
      mailer,
      statsd,
      config as any
    );
    route = getRoute(routes, routePath, method);
    request = mocks.mockRequest(requestOptions);
    request.emitMetricsEvent = sandbox.spy(() => Promise.resolve({}));
    return await route.handler(request);
  }

  async function runAuthStrategyTest(token: string) {
    const { authenticate } = strategy(
      config as any,
      mockGetCredentialsFunc,
      db,
      statsd
    )();
    const req: any = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      route: {
        path: '/v1/test',
      },
    };
    const h: any = {
      authenticated(opts: any) {
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
    const fxaMailer = mocks.mockFxaMailer();
    statsd = mocks.mockStatsd();
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      emailVerified: true,
    });
    otpUtils = new OtpUtils(db, statsd);
    mockGetCredentialsFunc = sandbox.fake.returns({
      id: SESSION_TOKEN_ID,
      uid: UID,
      uaBrowser: UA_BROWSER,
      authenticatorAssuranceLevel: 2,
      tokenVerified: true,
    });

    Container.set(OtpUtils, otpUtils);
    Container.set(AccountEventsManager, mockAccountEventsManager);

    code = '';
    mailer.sendVerifyAccountChangeEmail = sandbox.spy(
      (_emails: any, _account: any, data: any) => {
        code = data.code;
      }
    );
    fxaMailer.sendVerifyAccountChangeEmail = sandbox.spy(
      (data: any) => {
        code = data.code;
      }
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  afterAll(() => {
    Container.reset();
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
    const authResult: any = await runAuthStrategyTest(verifyResult.accessToken);

    expect(requestResult).toBeDefined();
    expect(requestResult.status).toBe('success');
    expect(code).toMatch(new RegExp(`^\\d{${config.mfa.otp.digits}}$`));

    expect(verifyResult).toBeDefined();
    expect(verifyResult.accessToken).toBeDefined();

    expect(authResult).toBeDefined();
    expect(authResult.credentials.uid).toBe(UID);
    expect(authResult.credentials.scope[0]).toBe('mfa:test');

    // The session token id should be extracted from the jwt
    // and queried so we can get all the meta data about the
    // session that this token was issued from.
    expect(authResult.credentials.id).toBe(SESSION_TOKEN_ID);
    expect(authResult.credentials.uaBrowser).toBe(UA_BROWSER);

    // Make sure customs was invoked
    sinon.assert.calledWith(
      customs.checkAuthenticated,
      sinon.match.any,
      UID,
      TEST_EMAIL,
      'mfaOtpCodeRequestForTest'
    );
    sinon.assert.calledWith(
      customs.checkAuthenticated,
      sinon.match.any,
      UID,
      TEST_EMAIL,
      'mfaOtpCodeVerifyForTest'
    );
  });

  it('will not allow an invalid token', async () => {
    let error: any;
    try {
      await runAuthStrategyTest('boo');
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errno).toBe(AppError.ERRNO.INVALID_MFA_TOKEN);
    expect(error.message).toBe('Invalid or expired MFA token');
  });

  it('will not allow an expired token', async () => {
    let error: any;
    try {
      // Old, but previously valid token
      await runAuthStrategyTest(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1aWQiLCJzY29wZSI6WyJwcm90ZWN0ZWQtYWN0aW9uczp0ZXN0Il0sImlhdCI6MTc1NTg4MTQ4NiwianRpIjoiY2QyNTJjZjYtM2MwNi00OWYyLWE4OTItNjU5NTc2MjhjZWU5IiwiZXhwIjoxNzU1ODgxNDk2LCJhdWQiOiJmeGEiLCJpc3MiOiJhY2NvdW50cy5maXJlZm94LmNvbSJ9.GB_vrTsRXmpVF5WYKCaUPqCcP5WOBS2wOvuzvkjafiw'
      );
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errno).toBe(AppError.ERRNO.INVALID_MFA_TOKEN);
    expect(error.message).toBe('Invalid or expired MFA token');
  });
});
