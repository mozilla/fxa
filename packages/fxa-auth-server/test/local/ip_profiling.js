/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const getRoute = require('../routes_helpers').getRoute;
const mocks = require('../mocks');
const P = require('../../lib/promise');
const proxyquire = require('proxyquire');
const uuid = require('uuid');

const TEST_EMAIL = 'foo@gmail.com';
const MS_ONE_DAY = 1000 * 60 * 60 * 24;
const UID = uuid.v4('binary').toString('hex');

function makeRoutes(options = {}, requireMocks) {
  const { db, mailer } = options;
  const config = {
    oauth: {},
    securityHistory: {
      ipProfiling: {
        allowedRecency: MS_ONE_DAY,
      },
    },
    signinConfirmation: {},
    smtp: {},
  };
  const log = mocks.mockLog();
  const customs = {
    check() {
      return P.resolve(true);
    },
    flag() {},
  };
  const subhub = options.subhub || mocks.mockSubHub();
  const signinUtils = require('../../lib/routes/utils/signin')(
    log,
    config,
    customs,
    db,
    mailer
  );
  signinUtils.checkPassword = () => P.resolve(true);
  return proxyquire('../../lib/routes/account', requireMocks || {})(
    log,
    db,
    mailer,
    require('../../lib/crypto/password')(log, config),
    config,
    customs,
    subhub,
    signinUtils,
    mocks.mockPush(),
    mocks.mockVerificationReminders()
  );
}

function runTest(route, request, assertions) {
  return new P((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('IP Profiling', () => {
  let route, accountRoutes, mockDB, mockMailer, mockRequest;

  beforeEach(() => {
    mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
      uid: UID,
    });
    mockMailer = mocks.mockMailer();
    mockRequest = mocks.mockRequest({
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
    accountRoutes = makeRoutes({
      db: mockDB,
      mailer: mockMailer,
    });
    route = getRoute(accountRoutes, '/account/login');
  });

  it('no previously verified session', () => {
    mockDB.securityEvents = function() {
      return P.resolve([
        {
          name: 'account.login',
          createdAt: Date.now(),
          verified: false,
        },
      ]);
    };

    return runTest(route, mockRequest, response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session not verified');
    });
  });

  it('previously verified session', () => {
    mockDB.securityEvents = function() {
      return P.resolve([
        {
          name: 'account.login',
          createdAt: Date.now(),
          verified: true,
        },
      ]);
    };

    return runTest(route, mockRequest, response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        0,
        'mailer.sendVerifyLoginEmail was not called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 1);
      assert.equal(response.verified, true, 'session verified');
    });
  });

  it('previously verified session more than a day', () => {
    mockDB.securityEvents = function() {
      return P.resolve([
        {
          name: 'account.login',
          createdAt: Date.now() - MS_ONE_DAY * 2, // Created two days ago
          verified: true,
        },
      ]);
    };

    return runTest(route, mockRequest, response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
    });
  });

  it('previously verified session with forced sign-in confirmation', () => {
    const forceSigninEmail = 'forcedemail@mozilla.com';
    mockRequest.payload.email = forceSigninEmail;

    mockDB.accountRecord = function() {
      return P.resolve({
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
        lastAuthAt: function() {
          return Date.now();
        },
        uid: UID,
        wrapWrapKb: crypto.randomBytes(32),
      });
    };

    return runTest(route, mockRequest, response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
      return runTest(route, mockRequest);
    }).then(response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        2,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
    });
  });

  it('previously verified session with suspicious request', () => {
    mockRequest.app.clientAddress = '63.245.221.32';
    mockRequest.app.isSuspiciousRequest = true;

    return runTest(route, mockRequest, response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
      return runTest(route, mockRequest);
    }).then(response => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        2,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
    });
  });
});
