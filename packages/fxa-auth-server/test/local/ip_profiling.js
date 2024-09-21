/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const getRoute = require('../routes_helpers').getRoute;
const mocks = require('../mocks');
const uuid = require('uuid');
const { Container } = require('typedi');
const { ProfileClient } = require('@fxa/profile/client');
const { AccountEventsManager } = require('../../lib/account-events');
const { AccountDeleteManager } = require('../../lib/account-delete');
const { AppConfig, AuthLogger } = require('../../lib/types');
const { gleanMetrics } = require('../../lib/metrics/glean');
const defaultConfig = require('../../config').default.getProperties();

const TEST_EMAIL = 'foo@gmail.com';
const MS_ONE_DAY = 1000 * 60 * 60 * 24;
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');

function makeRoutes(options = {}) {
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
  Container.set(AccountEventsManager, {
    recordSecurityEvent: () => {},
  });
  Container.set(AccountDeleteManager, { enqueue: () => {} });
  Container.set(AppConfig, config);
  Container.set(AuthLogger, log);
  const cadReminders = mocks.mockCadReminders();
  const customs = {
    check() {
      return Promise.resolve(true);
    },
    flag() {},
  };
  const signinUtils = require('../../lib/routes/utils/signin')(
    log,
    config,
    customs,
    db,
    mailer,
    cadReminders
  );
  signinUtils.checkPassword = () => Promise.resolve(true);
  const glean = gleanMetrics(defaultConfig);
  const { accountRoutes } = require('../../lib/routes/account');

  return accountRoutes(
    log,
    db,
    mailer,
    require('../../lib/crypto/password')(log, config),
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
    glean
  );
}

function runTest(route, request, assertions) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('IP Profiling', function () {
  let route, accountRoutes, mockDB, mockMailer, mockRequest;
  this.timeout(30000);

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
    Container.set(ProfileClient, {});
    accountRoutes = makeRoutes({
      db: mockDB,
      mailer: mockMailer,
    });
    route = getRoute(accountRoutes, '/account/login');
  });

  after(() => {
    Container.reset();
  });

  it('no previously verified session', () => {
    mockDB.securityEvents = function () {
      return Promise.resolve([
        {
          name: 'account.login',
          createdAt: Date.now(),
          verified: false,
        },
      ]);
    };

    return runTest(route, mockRequest, (response) => {
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
    mockDB.securityEvents = function () {
      return Promise.resolve([
        {
          name: 'account.login',
          createdAt: Date.now(),
          verified: true,
        },
      ]);
    };

    return runTest(route, mockRequest, (response) => {
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
    mockDB.securityEvents = function () {
      return Promise.resolve([
        {
          name: 'account.login',
          createdAt: Date.now() - MS_ONE_DAY * 2, // Created two days ago
          verified: true,
        },
      ]);
    };

    return runTest(route, mockRequest, (response) => {
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

    mockDB.accountRecord = function () {
      return Promise.resolve({
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
        lastAuthAt: function () {
          return Date.now();
        },
        uid: UID,
        wrapWrapKb: crypto.randomBytes(32),
      });
    };

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
      return runTest(route, mockRequest);
    }).then((response) => {
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

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockMailer.sendVerifyLoginEmail.callCount,
        1,
        'mailer.sendVerifyLoginEmail was called'
      );
      assert.equal(mockMailer.sendNewDeviceLoginEmail.callCount, 0);
      assert.equal(response.verified, false, 'session verified');
      return runTest(route, mockRequest);
    }).then((response) => {
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
