/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');

const { assert } = require('chai');
const crypto = require('crypto');
const error = require('../../../lib/error');
const getRoute = require('../../routes_helpers').getRoute;
const knownIpLocation = require('../../known-ip-location');
const mocks = require('../../mocks');
const P = require('../../../lib/promise');
const proxyquire = require('proxyquire');
const uuid = require('uuid');

const TEST_EMAIL = 'foo@gmail.com';
const TEST_EMAIL_ADDITIONAL = 'foo2@gmail.com';
const TEST_EMAIL_INVALID = 'example@dotless-domain';
const MS_IN_DAY = 1000 * 60 * 60 * 24;
// This is slightly less than 2 months ago, regardless of which
// months are in question (I'm looking at you, February...)
const MS_IN_ALMOST_TWO_MONTHS = MS_IN_DAY * 58;

const makeRoutes = function(options = {}, requireMocks) {
  const config = options.config || {};
  config.verifierVersion = config.verifierVersion || 0;
  config.smtp = config.smtp || {};
  config.memcached = config.memcached || {
    address: 'none',
    idle: 500,
    lifetime: 30,
  };
  config.i18n = {
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
  };
  config.lastAccessTimeUpdates = {};
  config.signinConfirmation = config.signinConfirmation || {};
  config.signinUnblock = config.signinUnblock || {};
  config.secondaryEmail = config.secondaryEmail || {};
  config.push = {
    allowedServerRegex: /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/,
  };

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: function() {
      return P.resolve(true);
    },
  };
  const push = options.push || require('../../../lib/push')(log, db, {});
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  return proxyquire('../../../lib/routes/emails', requireMocks || {})(
    log,
    db,
    options.mailer || {},
    config,
    customs,
    push,
    verificationReminders
  );
};

function runTest(route, request, assertions) {
  return route.handler(request).then(assertions);
}

describe('/recovery_email/status', () => {
  const config = {};
  const mockDB = mocks.mockDB();
  let pushCalled;
  const mockLog = mocks.mockLog({
    info: sinon.spy((op, data) => {
      if (data.name === 'recovery_email_reason.push') {
        pushCalled = true;
      }
    }),
  });
  const accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog,
  });
  const route = getRoute(accountRoutes, '/recovery_email/status');

  const mockRequest = mocks.mockRequest({
    credentials: {
      uid: uuid.v4('binary').toString('hex'),
      email: TEST_EMAIL,
    },
  });

  describe('invalid email', () => {
    let mockRequest;
    beforeEach(() => {
      mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID,
        },
      });
    });

    it('unverified account', () => {
      mockRequest.auth.credentials.emailVerified = false;

      return runTest(route, mockRequest)
        .then(
          () => assert.ok(false),
          response => {
            assert.equal(mockDB.deleteAccount.callCount, 1);
            assert.equal(
              mockDB.deleteAccount.firstCall.args[0].email,
              TEST_EMAIL_INVALID
            );
            assert.equal(response.errno, error.ERRNO.INVALID_TOKEN);

            assert.equal(mockLog.info.callCount, 2);
            const args = mockLog.info.args[1];
            assert.equal(args.length, 2);
            assert.equal(args[0], 'accountDeleted.invalidEmailAddress');
            assert.deepEqual(args[1], {
              email: TEST_EMAIL_INVALID,
              emailVerified: false,
            });
          }
        )
        .then(() => {
          mockDB.deleteAccount.resetHistory();
        });
    });

    it('unverified account - stale session token', () => {
      const log = {
        info: sinon.spy(),
        begin: sinon.spy(),
      };
      const db = mocks.mockDB();
      config.emailStatusPollingTimeout = MS_IN_ALMOST_TWO_MONTHS;
      const routes = makeRoutes({
        config,
        db,
        log,
      });

      mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID,
        },
      });
      const route = getRoute(routes, '/recovery_email/status');

      const date = new Date();
      date.setMonth(date.getMonth() - 2);

      mockRequest.auth.credentials.createdAt = date.getTime();
      mockRequest.auth.credentials.hello = 'mytest';
      mockRequest.auth.credentials.emailVerified = false;
      mockRequest.auth.credentials.uaBrowser = 'Firefox';
      mockRequest.auth.credentials.uaBrowserVersion = '57';

      return runTest(route, mockRequest)
        .then(
          () => assert.ok(false),
          response => {
            const args = log.info.firstCall.args;
            assert.equal(args[0], 'recovery_email.status.stale');
            assert.equal(args[1].email, TEST_EMAIL_INVALID);
            assert.equal(args[1].createdAt, date.getTime());
            assert.equal(args[1].browser, 'Firefox 57');
          }
        )
        .then(() => {
          mockDB.deleteAccount.resetHistory();
        });
    });

    it('verified account', () => {
      mockRequest.auth.credentials.uid = uuid.v4('binary').toString('hex');
      mockRequest.auth.credentials.emailVerified = true;
      mockRequest.auth.credentials.tokenVerified = true;

      return runTest(route, mockRequest, response => {
        assert.equal(mockDB.deleteAccount.callCount, 0);
        assert.deepEqual(response, {
          email: TEST_EMAIL_INVALID,
          verified: true,
          emailVerified: true,
          sessionVerified: true,
        });
      });
    });
  });

  it('valid email, verified account', () => {
    pushCalled = false;
    const mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: true,
      },
      query: {
        reason: 'push',
      },
    });

    return runTest(route, mockRequest, response => {
      assert.equal(pushCalled, true);

      assert.deepEqual(response, {
        email: TEST_EMAIL,
        verified: true,
        emailVerified: true,
        sessionVerified: true,
      });
    });
  });

  it('verified account, verified session', () => {
    mockRequest.auth.credentials.emailVerified = true;
    mockRequest.auth.credentials.tokenVerified = true;

    return runTest(route, mockRequest, response => {
      assert.deepEqual(response, {
        email: TEST_EMAIL,
        verified: true,
        sessionVerified: true,
        emailVerified: true,
      });
    });
  });

  it('verified account, unverified session, must verify session', () => {
    mockRequest.auth.credentials.emailVerified = true;
    mockRequest.auth.credentials.tokenVerified = false;
    mockRequest.auth.credentials.mustVerify = true;

    return runTest(route, mockRequest, response => {
      assert.deepEqual(response, {
        email: TEST_EMAIL,
        verified: false,
        sessionVerified: false,
        emailVerified: true,
      });
    });
  });

  it('verified account, unverified session, neednt verify session', () => {
    mockRequest.auth.credentials.emailVerified = true;
    mockRequest.auth.credentials.tokenVerified = false;
    mockRequest.auth.credentials.mustVerify = false;

    return runTest(route, mockRequest, response => {
      assert.deepEqual(response, {
        email: TEST_EMAIL,
        verified: true,
        sessionVerified: false,
        emailVerified: true,
      });
    });
  });
});

describe('/recovery_email/resend_code', () => {
  const config = {};
  const secondEmailCode = crypto.randomBytes(16);
  const mockDB = mocks.mockDB({ secondEmailCode: secondEmailCode });
  const mockLog = mocks.mockLog();
  mockLog.flowEvent = sinon.spy(() => {
    return P.resolve();
  });
  const mockMailer = mocks.mockMailer();
  const mockMetricsContext = mocks.mockMetricsContext();
  const accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
  });
  const route = getRoute(accountRoutes, '/recovery_email/resend_code');

  it('verification', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        deviceId: 'wibble',
        email: TEST_EMAIL,
        emailVerified: false,
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: 52,
        uaOS: 'Mac OS X',
        uaOSVersion: '10.10',
      },
      query: {},
      payload: {
        service: 'sync',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        },
        style: 'trailhead',
      },
    });

    return runTest(route, mockRequest, response => {
      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once');
      assert.equal(
        mockLog.flowEvent.args[0][0].event,
        'email.verification.resent'
      );

      assert.equal(mockMailer.sendVerifyCode.callCount, 1);
      const args = mockMailer.sendVerifyCode.args[0];
      assert.equal(args[2].uaBrowser, 'Firefox');
      assert.equal(args[2].uaBrowserVersion, '52');
      assert.equal(args[2].uaOS, 'Mac OS X');
      assert.equal(args[2].uaOSVersion, '10.10');
      assert.ok(knownIpLocation.location.city.has(args[2].location.city));
      assert.equal(args[2].location.country, knownIpLocation.location.country);
      assert.equal(args[2].ip, knownIpLocation.ip);
      assert.equal(args[2].timeZone, knownIpLocation.location.tz);
      assert.strictEqual(args[2].uaDeviceType, undefined);
      assert.equal(args[2].deviceId, mockRequest.auth.credentials.deviceId);
      assert.equal(args[2].flowId, mockRequest.payload.metricsContext.flowId);
      assert.equal(
        args[2].flowBeginTime,
        mockRequest.payload.metricsContext.flowBeginTime
      );
      assert.equal(args[2].service, mockRequest.payload.service);
      assert.equal(args[2].uid, mockRequest.auth.credentials.uid);
      assert.equal(args[2].style, 'trailhead');
    }).then(() => {
      mockMailer.sendVerifyCode.resetHistory();
      mockLog.flowEvent.resetHistory();
    });
  });

  it('verification additional email', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        deviceId: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '50',
        uaOS: 'Android',
        uaOSVersion: '6',
        uaDeviceType: 'tablet',
      },
      query: {
        service: 'foo',
      },
      payload: {
        email: 'secondEmail@email.com',
      },
    });

    return runTest(route, mockRequest, response => {
      assert.equal(mockMailer.sendVerifySecondaryEmail.callCount, 1);
      assert.equal(
        mockMailer.sendVerifySecondaryEmail.args[0][2].deviceId,
        mockRequest.auth.credentials.deviceId
      );
      assert.equal(
        mockMailer.sendVerifySecondaryEmail.args[0][2].flowId,
        mockMetricsContext.flowId
      );
      assert.equal(
        mockMailer.sendVerifySecondaryEmail.args[0][2].flowBeginTime,
        mockMetricsContext.flowBeginTime
      );
      assert.equal(
        mockMailer.sendVerifySecondaryEmail.args[0][2].service,
        'foo'
      );
      assert.equal(
        mockMailer.sendVerifySecondaryEmail.args[0][2].uid,
        mockRequest.auth.credentials.uid
      );

      assert.equal(mockMailer.sendVerifyCode.callCount, 0);
      assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0);
      const args = mockMailer.sendVerifySecondaryEmail.getCall(0).args;
      assert.equal(args[2].code, secondEmailCode, 'email code set');
    }).then(() => {
      mockMailer.sendVerifySecondaryEmail.resetHistory();
      mockLog.flowEvent.resetHistory();
    });
  });

  it('confirmation', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        deviceId: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '50',
        uaOS: 'Android',
        uaOSVersion: '6',
        uaDeviceType: 'tablet',
      },
      query: {},
      payload: {
        service: 'foo',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        },
      },
    });
    mockLog.flowEvent.resetHistory();

    return runTest(route, mockRequest, response => {
      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once');
      assert.equal(
        mockLog.flowEvent.args[0][0].event,
        'email.confirmation.resent'
      );

      assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1);
      const args = mockMailer.sendVerifyLoginEmail.args[0];
      assert.equal(args[2].uaBrowser, 'Firefox');
      assert.equal(args[2].uaBrowserVersion, '50');
      assert.equal(args[2].uaOS, 'Android');
      assert.equal(args[2].uaOSVersion, '6');
      assert.strictEqual(args[2].uaDeviceType, 'tablet');
      assert.equal(args[2].deviceId, mockRequest.auth.credentials.deviceId);
      assert.equal(args[2].flowId, mockRequest.payload.metricsContext.flowId);
      assert.equal(
        args[2].flowBeginTime,
        mockRequest.payload.metricsContext.flowBeginTime
      );
      assert.equal(args[2].service, mockRequest.payload.service);
      assert.equal(args[2].uid, mockRequest.auth.credentials.uid);
    });
  });
});

describe('/recovery_email/verify_code', () => {
  const uid = uuid.v4('binary').toString('hex');
  const mockLog = mocks.mockLog();
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    metricsContext: mocks.mockMetricsContext({
      gather(data) {
        return Promise.resolve(
          Object.assign(data, {
            flowCompleteSignal: 'account.signed',
            flow_time: 10000,
            flow_id:
              'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            time: Date.now() - 10000,
          })
        );
      },
    }),
    query: {},
    payload: {
      code: 'e3c5b0e3f5391e134596c27519979b93',
      service: 'sync',
      uid: uid,
    },
  });
  const dbData = {
    email: TEST_EMAIL,
    emailCode: Buffer.from(mockRequest.payload.code, 'hex'),
    emailVerified: false,
    secondEmail: 'test@email.com',
    secondEmailCode: crypto.randomBytes(16).toString('hex'),
    uid: uid,
  };
  const dbErrors = {
    verifyTokens: error.invalidVerificationCode({}),
  };
  const mockDB = mocks.mockDB(dbData, dbErrors);
  const mockMailer = mocks.mockMailer();
  const mockPush = mocks.mockPush();
  const mockCustoms = mocks.mockCustoms();
  const verificationReminders = mocks.mockVerificationReminders();
  const accountRoutes = makeRoutes({
    checkPassword: function() {
      return P.resolve(true);
    },
    config: {},
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    push: mockPush,
    verificationReminders,
  });
  const route = getRoute(accountRoutes, '/recovery_email/verify_code');

  afterEach(() => {
    mockDB.verifyTokens.resetHistory();
    mockDB.verifyEmail.resetHistory();
    mockLog.activityEvent.resetHistory();
    mockLog.flowEvent.resetHistory();
    mockLog.notifyAttachedServices.resetHistory();
    mockMailer.sendPostVerifyEmail.resetHistory();
    mockPush.notifyAccountUpdated.resetHistory();
    verificationReminders.delete.resetHistory();
  });

  describe('verifyTokens rejects with INVALID_VERIFICATION_CODE', () => {
    it('without a reminder payload', () => {
      return runTest(route, mockRequest, response => {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'calls verifyTokens');
        assert.equal(mockDB.verifyEmail.callCount, 1, 'calls verifyEmail');
        assert.equal(mockCustoms.check.callCount, 1, 'calls customs.check');

        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          1,
          'logs verified'
        );
        let args = mockLog.notifyAttachedServices.args[0];
        assert.equal(args[0], 'verified');
        assert.equal(args[2].uid, uid);
        assert.equal(args[2].marketingOptIn, undefined);
        assert.equal(args[2].service, 'sync');
        assert.equal(args[2].country, 'United States', 'set country');
        assert.equal(args[2].countryCode, 'US', 'set country code');
        assert.equal(args[2].userAgent, 'test user-agent');

        assert.equal(
          mockMailer.sendPostVerifyEmail.callCount,
          1,
          'sendPostVerifyEmail was called once'
        );
        assert.equal(
          mockMailer.sendPostVerifyEmail.args[0][2].service,
          mockRequest.payload.service
        );
        assert.equal(mockMailer.sendPostVerifyEmail.args[0][2].uid, uid);

        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'activityEvent was called once'
        );
        args = mockLog.activityEvent.args[0];
        assert.equal(
          args.length,
          1,
          'log.activityEvent was passed one argument'
        );
        assert.deepEqual(
          args[0],
          {
            country: 'United States',
            event: 'account.verified',
            marketingOptIn: false,
            newsletters: undefined,
            region: 'California',
            service: 'sync',
            uid: uid.toString('hex'),
            userAgent: 'test user-agent',
          },
          'event data was correct'
        );

        assert.equal(
          mockLog.amplitudeEvent.callCount,
          1,
          'amplitudeEvent was called once'
        );
        args = mockLog.amplitudeEvent.args[0];
        assert.equal(
          args[0].event_type,
          'fxa_reg - email_confirmed',
          'first call to amplitudeEvent was email_confirmed event'
        );
        assert.equal(
          args[0].user_properties.newsletter_state,
          'unsubscribed',
          'newsletter_state was correct'
        );

        assert.equal(
          mockLog.flowEvent.callCount,
          2,
          'flowEvent was called twice'
        );
        assert.equal(
          mockLog.flowEvent.args[0][0].event,
          'email.verify_code.clicked',
          'first event was email.verify_code.clicked'
        );
        assert.equal(
          mockLog.flowEvent.args[1][0].event,
          'account.verified',
          'second event was event account.verified'
        );

        assert.equal(
          mockPush.notifyAccountUpdated.callCount,
          1,
          'mockPush.notifyAccountUpdated should have been called once'
        );
        args = mockPush.notifyAccountUpdated.args[0];
        assert.equal(
          args.length,
          3,
          'mockPush.notifyAccountUpdated should have been passed three arguments'
        );
        assert.equal(
          args[0].toString('hex'),
          uid,
          'first argument should have been uid'
        );
        assert.ok(
          Array.isArray(args[1]),
          'second argument should have been devices array'
        );
        assert.equal(
          args[2],
          'accountVerify',
          'third argument should have been reason'
        );

        assert.equal(verificationReminders.delete.callCount, 1);
        args = verificationReminders.delete.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], uid);

        assert.equal(JSON.stringify(response), '{}');
      });
    });

    it('with marketingOptIn', () => {
      mockRequest.payload.marketingOptIn = true;
      return runTest(route, mockRequest, response => {
        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          1,
          'logs verified'
        );
        let args = mockLog.notifyAttachedServices.args[0];
        assert.equal(args[0], 'verified');
        assert.equal(args[2].uid, uid);
        assert.equal(args[2].marketingOptIn, true);
        assert.equal(args[2].service, 'sync');

        assert.equal(
          mockLog.amplitudeEvent.callCount,
          2,
          'amplitudeEvent was called twice'
        );
        args = mockLog.amplitudeEvent.args[1];
        assert.equal(
          args[0].event_type,
          'fxa_reg - email_confirmed',
          'second call to amplitudeEvent was email_confirmed event'
        );
        assert.equal(
          args[0].user_properties.newsletter_state,
          'subscribed',
          'newsletter_state was correct'
        );

        assert.equal(JSON.stringify(response), '{}');
      });
    });

    it('with newsletters', () => {
      mockRequest.payload.newsletters = ['test-pilot', 'firefox-pilot'];
      return runTest(route, mockRequest, response => {
        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          1,
          'logs verified'
        );
        let args = mockLog.notifyAttachedServices.args[0];
        assert.equal(args[0], 'verified');
        assert.equal(args[2].uid, uid);
        assert.deepEqual(args[2].newsletters, ['test-pilot', 'firefox-pilot']);
        assert.equal(args[2].service, 'sync');

        assert.equal(
          mockLog.amplitudeEvent.callCount,
          3,
          'amplitudeEvent was called 3 times'
        );
        args = mockLog.amplitudeEvent.args[2];
        assert.equal(
          args[0].event_type,
          'fxa_reg - email_confirmed',
          'second call to amplitudeEvent was email_confirmed event'
        );
        assert.deepEqual(
          args[0].user_properties.newsletters,
          ['test_pilot', 'firefox_pilot'],
          'newsletters was correct'
        );

        assert.equal(JSON.stringify(response), '{}');
      });
    });

    it('with a reminder payload', () => {
      mockRequest.payload.reminder = 'second';

      return runTest(route, mockRequest, response => {
        assert.equal(mockLog.activityEvent.callCount, 1);

        assert.equal(mockLog.flowEvent.callCount, 3);
        assert.equal(
          mockLog.flowEvent.args[0][0].event,
          'email.verify_code.clicked'
        );
        assert.equal(mockLog.flowEvent.args[1][0].event, 'account.verified');
        assert.equal(
          mockLog.flowEvent.args[2][0].event,
          'account.reminder.second'
        );

        assert.equal(verificationReminders.delete.callCount, 1);
        assert.equal(mockMailer.sendPostVerifyEmail.callCount, 1);
        assert.equal(mockPush.notifyAccountUpdated.callCount, 1);

        assert.equal(JSON.stringify(response), '{}');
      });
    });
  });

  describe('verifyTokens resolves', () => {
    before(() => {
      dbData.emailVerified = true;
      dbErrors.verifyTokens = undefined;
    });

    it('email verification', () => {
      return runTest(route, mockRequest, response => {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens');
        assert.equal(
          mockDB.verifyEmail.callCount,
          0,
          'does not call db.verifyEmail'
        );
        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          0,
          'does not call log.notifyAttachedServices'
        );
        assert.equal(
          mockLog.activityEvent.callCount,
          0,
          'log.activityEvent was not called'
        );
        assert.equal(
          mockPush.notifyAccountUpdated.callCount,
          0,
          'mockPush.notifyAccountUpdated should not have been called'
        );
        assert.equal(
          mockPush.notifyDeviceConnected.callCount,
          0,
          'mockPush.notifyDeviceConnected should not have been called (no devices)'
        );
      });
    });

    it('email verification with associated device', () => {
      mockDB.deviceFromTokenVerificationId = function(
        uid,
        tokenVerificationId
      ) {
        return P.resolve({
          name: 'my device',
          id: '123456789',
          type: 'desktop',
        });
      };
      return runTest(route, mockRequest, response => {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens');
        assert.equal(
          mockDB.verifyEmail.callCount,
          0,
          'does not call db.verifyEmail'
        );
        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          0,
          'does not call log.notifyAttachedServices'
        );
        assert.equal(
          mockLog.activityEvent.callCount,
          0,
          'log.activityEvent was not called'
        );
        assert.equal(
          mockPush.notifyAccountUpdated.callCount,
          0,
          'mockPush.notifyAccountUpdated should not have been called'
        );
        assert.equal(
          mockPush.notifyDeviceConnected.callCount,
          1,
          'mockPush.notifyDeviceConnected should have been called'
        );
      });
    });

    it('sign-in confirmation', () => {
      dbData.emailCode = crypto.randomBytes(16);

      return runTest(route, mockRequest, response => {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens');
        assert.equal(
          mockDB.verifyEmail.callCount,
          0,
          'does not call db.verifyEmail'
        );
        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          0,
          'does not call log.notifyAttachedServices'
        );

        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        let args = mockLog.activityEvent.args[0];
        assert.equal(
          args.length,
          1,
          'log.activityEvent was passed one argument'
        );
        assert.deepEqual(
          args[0],
          {
            country: 'United States',
            event: 'account.confirmed',
            region: 'California',
            service: 'sync',
            userAgent: 'test user-agent',
            uid: uid.toString('hex'),
          },
          'event data was correct'
        );

        assert.equal(
          mockPush.notifyAccountUpdated.callCount,
          1,
          'mockPush.notifyAccountUpdated should have been called once'
        );
        args = mockPush.notifyAccountUpdated.args[0];
        assert.equal(
          args.length,
          3,
          'mockPush.notifyAccountUpdated should have been passed three arguments'
        );
        assert.equal(
          args[0].toString('hex'),
          uid,
          'first argument should have been uid'
        );
        assert.ok(
          Array.isArray(args[1]),
          'second argument should have been devices array'
        );
        assert.equal(
          args[2],
          'accountConfirm',
          'third argument should have been reason'
        );
      });
    });

    it('secondary email verification', () => {
      dbData.emailCode = crypto.randomBytes(16).toString('hex');
      mockRequest.payload.code = dbData.secondEmailCode.toString('hex');
      mockRequest.payload.type = 'secondary';
      mockRequest.payload.verifiedEmail = dbData.secondEmail;

      return runTest(route, mockRequest, response => {
        assert.equal(mockDB.verifyEmail.callCount, 1, 'call db.verifyEmail');
        let args = mockDB.verifyEmail.args[0];
        assert.equal(
          args.length,
          2,
          'mockDB.verifyEmail was passed correct arguments'
        );
        assert.equal(
          args[0].email,
          dbData.email,
          'correct account primary email was passed'
        );
        assert.equal(
          args[1].toString('hex'),
          dbData.secondEmailCode.toString('hex'),
          'correct email code was passed'
        );

        assert.equal(
          mockMailer.sendPostVerifySecondaryEmail.callCount,
          1,
          'call mailer.sendPostVerifySecondaryEmail'
        );
        args = mockMailer.sendPostVerifySecondaryEmail.args[0];
        assert.equal(
          args.length,
          3,
          'mockMailer.sendPostVerifySecondaryEmail was passed correct arguments'
        );
        assert.equal(
          args[1].email,
          dbData.email,
          'correct account primary email was passed'
        );
        assert.equal(
          args[2].secondaryEmail,
          dbData.secondEmail,
          'correct secondary email was passed'
        );
        assert.equal(args[2].service, mockRequest.payload.service);
        assert.equal(args[2].uid, uid);
      });
    });
  });
});

describe('/recovery_email', () => {
  const uid = uuid.v4('binary').toString('hex');
  const mockLog = mocks.mockLog();
  let dbData, accountRoutes, mockDB, mockRequest, route;
  const mockMailer = mocks.mockMailer();
  const mockPush = mocks.mockPush();
  const mockCustoms = mocks.mockCustoms();

  beforeEach(() => {
    mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        deviceId: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        normalizedEmail: TEST_EMAIL.toLowerCase(),
      },
      log: mockLog,
      payload: {
        email: TEST_EMAIL_ADDITIONAL,
      },
    });
    dbData = {
      email: TEST_EMAIL,
      uid: uid,
      secondEmail: TEST_EMAIL_ADDITIONAL,
    };
    mockDB = mocks.mockDB(dbData);
    accountRoutes = makeRoutes({
      checkPassword: function() {
        return P.resolve(true);
      },
      config: {
        secondaryEmail: {
          minUnverifiedAccountTime: MS_IN_DAY,
        },
      },
      customs: mockCustoms,
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      push: mockPush,
    });
  });

  describe('/recovery_email', () => {
    beforeEach(() => {
      mockDB.getSecondaryEmail = sinon.spy(() => {
        return P.reject(error.unknownSecondaryEmail());
      });
    });

    it('should create email on account', () => {
      route = getRoute(accountRoutes, '/recovery_email');
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(mockDB.createEmail.callCount, 1, 'call db.createEmail');
        assert.equal(
          mockMailer.sendVerifySecondaryEmail.callCount,
          1,
          'call db.sendVerifySecondaryEmail'
        );
        assert.equal(
          mockMailer.sendVerifySecondaryEmail.args[0][2].deviceId,
          mockRequest.auth.credentials.deviceId
        );
        assert.equal(
          mockMailer.sendVerifySecondaryEmail.args[0][2].uid,
          mockRequest.auth.credentials.uid
        );
      }).then(() => {
        mockDB.createEmail.resetHistory();
        mockMailer.sendVerifySecondaryEmail.resetHistory();
      });
    });

    it('should fail with unverified primary email', () => {
      route = getRoute(accountRoutes, '/recovery_email');
      mockRequest.auth.credentials.emailVerified = false;
      return runTest(route, mockRequest)
        .then(
          () =>
            assert.fail(
              'Should have failed adding secondary email with unverified primary email'
            ),
          err => assert.equal(err.errno, 104, 'unverified account')
        )
        .then(() => {
          mockDB.createEmail.resetHistory();
        });
    });

    it('should fail when adding secondary email that is same as primary', () => {
      route = getRoute(accountRoutes, '/recovery_email');
      mockRequest.payload.email = TEST_EMAIL;

      return runTest(route, mockRequest)
        .then(
          () =>
            assert.fail(
              'Should have failed when adding secondary email that is same as primary'
            ),
          err =>
            assert.equal(
              err.errno,
              139,
              'cannot add secondary email, same as primary'
            )
        )
        .then(() => {
          mockDB.createEmail.resetHistory();
        });
    });

    it('creates secondary email if another user unverified primary more than day old, deletes unverified account', () => {
      mockDB.getSecondaryEmail = sinon.spy(() => {
        return P.resolve({
          isVerified: false,
          isPrimary: true,
          normalizedEmail: TEST_EMAIL,
          createdAt: Date.now() - MS_IN_DAY,
          uid: crypto.randomBytes(16),
        });
      });
      route = getRoute(accountRoutes, '/recovery_email');
      mockRequest.payload.email = TEST_EMAIL_ADDITIONAL;
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(
          mockDB.deleteAccount.callCount,
          1,
          'call db.deleteAccount'
        );
        assert.equal(mockDB.createEmail.callCount, 1, 'call db.createEmail');
        let args = mockDB.createEmail.getCall(0).args;
        assert.equal(
          args[1].email,
          TEST_EMAIL_ADDITIONAL,
          'call db.createEmail with correct email'
        );
        assert.equal(
          mockMailer.sendVerifySecondaryEmail.callCount,
          1,
          'call mailer.sendVerifySecondaryEmail'
        );

        assert.equal(mockLog.info.callCount, 5);
        args = mockLog.info.args[4];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'accountDeleted.unverifiedSecondaryEmail');
        assert.equal(args[1].normalizedEmail, TEST_EMAIL);
      }).then(() => {
        mockDB.deleteAccount.resetHistory();
        mockDB.createEmail.resetHistory();
        mockMailer.sendVerifySecondaryEmail.resetHistory();
      });
    });

    it('fails create email if another user unverified primary less than day old', () => {
      mockDB.getSecondaryEmail = sinon.spy(() => {
        return P.resolve({
          isVerified: false,
          isPrimary: true,
          normalizedEmail: TEST_EMAIL,
          createdAt: Date.now(),
          uid: crypto.randomBytes(16),
        });
      });
      route = getRoute(accountRoutes, '/recovery_email');
      mockRequest.payload.email = TEST_EMAIL_ADDITIONAL;

      return runTest(route, mockRequest).then(
        () => assert.fail('Should have failed when creating email'),
        err =>
          assert.equal(
            err.errno,
            141,
            'cannot add secondary email, newly created primary account'
          )
      );
    });

    it('deletes secondary email if there was an error sending verification email', () => {
      route = getRoute(accountRoutes, '/recovery_email');
      mockMailer.sendVerifySecondaryEmail = sinon.spy(() => {
        return P.reject(new Error('failed to send'));
      });

      return runTest(route, mockRequest, () => {
        assert.fail('should have failed');
      })
        .catch(err => {
          assert.equal(err.errno, 151, 'failed to send email error');
          assert.equal(err.output.payload.code, 422);
          assert.equal(mockDB.createEmail.callCount, 1, 'call db.createEmail');
          assert.equal(mockDB.deleteEmail.callCount, 1, 'call db.deleteEmail');
          assert.equal(
            mockDB.deleteEmail.args[0][0],
            mockRequest.auth.credentials.uid,
            'correct uid passed'
          );
          assert.equal(
            mockDB.deleteEmail.args[0][1],
            TEST_EMAIL_ADDITIONAL,
            'correct email passed'
          );
          assert.equal(
            mockMailer.sendVerifySecondaryEmail.callCount,
            1,
            'call db.sendVerifySecondaryEmail'
          );
          assert.equal(
            mockMailer.sendVerifySecondaryEmail.args[0][2].deviceId,
            mockRequest.auth.credentials.deviceId
          );
          assert.equal(
            mockMailer.sendVerifySecondaryEmail.args[0][2].uid,
            mockRequest.auth.credentials.uid
          );
        })
        .then(() => {
          mockDB.createEmail.resetHistory();
          mockDB.deleteEmail.resetHistory();
          mockMailer.sendVerifySecondaryEmail.resetHistory();
        });
    });
  });

  describe('/recovery_emails', () => {
    it('should get all account emails', () => {
      route = getRoute(accountRoutes, '/recovery_emails');
      return runTest(route, mockRequest, response => {
        assert.equal(response.length, 1, 'should return account email');
        assert.equal(
          response[0].email,
          dbData.email,
          'should return users email'
        );
        assert.equal(mockDB.account.callCount, 1, 'call db.account');
      }).then(() => {
        mockDB.accountEmails.resetHistory();
      });
    });
  });

  describe('/recovery_email/destroy', () => {
    it('should delete email from account ', () => {
      route = getRoute(accountRoutes, '/recovery_email/destroy');
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(mockDB.deleteEmail.callCount, 1, 'call db.deleteEmail');
      });
    });

    it('should reset outstanding tokens on the account ', () => {
      route = getRoute(accountRoutes, '/recovery_email/destroy');
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(
          mockDB.resetAccountTokens.callCount,
          1,
          'call db.resetAccountTokens'
        );
      });
    });

    it('should send secondary email post delete notification, if email is verified', () => {
      const tempEmail = 'anotherEmail@one.com';
      mockRequest.payload = {
        email: tempEmail,
      };
      mockDB.account = sinon.spy(() => {
        return P.resolve({
          uid: mockRequest.auth.credentials.uid,
          isVerified: true,
          isPrimary: false,
          emails: [
            {
              normalizedEmail: TEST_EMAIL,
              email: TEST_EMAIL,
              isVerified: true,
              isPrimary: true,
            },
            {
              normalizedEmail: tempEmail.toLowerCase(),
              email: tempEmail,
              isVerified: true,
              isPrimary: false,
            },
          ],
        });
      });
      route = getRoute(accountRoutes, '/recovery_email/destroy');
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(mockDB.deleteEmail.callCount, 1, 'call db.deleteEmail');
        assert.equal(
          mockMailer.sendPostRemoveSecondaryEmail.callCount,
          1,
          'call mailer.sendVerifySecondaryEmail'
        );
      });
    });

    it("shouldn't send secondary email post delete notification, if email is unverified", () => {
      const tempEmail = 'anotherEmail@one.com';
      mockRequest.payload = {
        email: tempEmail,
      };
      mockDB.account = sinon.spy(() => {
        return P.resolve({
          uid: mockRequest.auth.credentials.uid,
          isVerified: true,
          isPrimary: false,
          emails: [
            {
              normalizedEmail: TEST_EMAIL,
              email: TEST_EMAIL,
              isVerified: true,
              isPrimary: true,
            },
            {
              normalizedEmail: tempEmail,
              email: tempEmail,
              isVerified: false,
              isPrimary: false,
            },
          ],
        });
      });
      route = getRoute(accountRoutes, '/recovery_email/destroy');
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(mockDB.deleteEmail.callCount, 1, 'call db.deleteEmail');
        assert.equal(
          mockMailer.sendPostRemoveSecondaryEmail.callCount,
          0,
          "shouldn't call mailer.sendVerifySecondaryEmail"
        );
      });
    });

    afterEach(() => {
      mockDB.deleteEmail.resetHistory();
      mockMailer.sendPostRemoveSecondaryEmail.resetHistory();
    });
  });

  describe('/recovery_email/set_primary', () => {
    it('should set primary email on account', () => {
      mockDB.getSecondaryEmail = sinon.spy(() => {
        return P.resolve({
          uid: mockRequest.auth.credentials.uid,
          isVerified: true,
          isPrimary: false,
        });
      });

      route = getRoute(accountRoutes, '/recovery_email/set_primary');
      return runTest(route, mockRequest, response => {
        assert.ok(response);
        assert.equal(
          mockDB.setPrimaryEmail.callCount,
          1,
          'call db.setPrimaryEmail'
        );
        assert.equal(
          mockPush.notifyProfileUpdated.callCount,
          1,
          'call db.notifyProfileUpdated'
        );
        assert.equal(
          mockLog.notifyAttachedServices.callCount,
          1,
          'call db.notifyAttachedServices'
        );
        assert.equal(
          mockMailer.sendPostChangePrimaryEmail.callCount,
          1,
          'call db.sendPostChangePrimaryEmail'
        );

        const args = mockLog.notifyAttachedServices.args[0];
        assert.equal(
          args.length,
          3,
          'log.notifyAttachedServices was passed three arguments'
        );
        assert.equal(
          args[0],
          'primaryEmailChanged',
          'first argument was event name'
        );
        assert.equal(
          args[1],
          mockRequest,
          'second argument was request object'
        );
        assert.equal(
          args[2].uid,
          mockRequest.auth.credentials.uid,
          'third argument was event data with a uid'
        );
        assert.equal(
          args[2].email,
          TEST_EMAIL_ADDITIONAL,
          'third argument was event data with new email'
        );
      }).then(() => {
        mockDB.setPrimaryEmail.resetHistory();
        mockPush.notifyProfileUpdated.resetHistory();
        mockMailer.sendPostChangePrimaryEmail.resetHistory();
      });
    });

    it('should fail when setting email to email user does not own', () => {
      mockDB.getSecondaryEmail = sinon.spy(() => {
        return P.resolve({
          uid: uuid.v4('binary').toString('hex'),
          isVerified: true,
          isPrimary: false,
        });
      });

      route = getRoute(accountRoutes, '/recovery_email/set_primary');
      return runTest(route, mockRequest).then(
        () => assert.fail('should have errored'),
        err =>
          assert.equal(
            err.errno,
            148,
            'correct errno changing email to non account email'
          )
      );
    });

    it('should fail when setting email is unverified', () => {
      mockDB.getSecondaryEmail = sinon.spy(() => {
        return P.resolve({
          uid: mockRequest.auth.credentials.uid,
          isVerified: false,
          isPrimary: false,
        });
      });

      route = getRoute(accountRoutes, '/recovery_email/set_primary');
      return runTest(route, mockRequest).then(
        () => assert.fail('should have errored'),
        err =>
          assert.equal(
            err.errno,
            147,
            'correct errno changing email to unverified email'
          )
      );
    });
  });
});
