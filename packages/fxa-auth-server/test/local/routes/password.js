/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const mocks = require('../../mocks');
const getRoute = require('../../routes_helpers').getRoute;

const P = require('../../../lib/promise');
const uuid = require('uuid');
const crypto = require('crypto');
const error = require('../../../lib/error');
const sinon = require('sinon');
const log = require('../../../lib/log');

const TEST_EMAIL = 'foo@gmail.com';

function makeRoutes(options = {}) {
  const config = options.config || {
    verifierVersion: 0,
    smtp: {},
  };
  const log = options.log || mocks.mockLog();
  const db = options.db || {};
  const mailer = options.mailer || {};
  const Password = require('../../../lib/crypto/password')(log, config);
  const customs = options.customs || {};
  const signinUtils = require('../../../lib/routes/utils/signin')(
    log,
    config,
    customs,
    db,
    mailer
  );
  config.secondaryEmail = config.secondaryEmail || {};
  return require('../../../lib/routes/password')(
    log,
    db,
    Password,
    config.smtp.redirectDomain || '',
    mailer,
    config.verifierVersion,
    options.customs || {},
    signinUtils,
    options.push || {},
    config,
    {
      removePublicAndCanGrantTokens: () => {},
    }
  );
}

function runRoute(routes, name, request) {
  return getRoute(routes, name).handler(request);
}

describe('/password', () => {
  it('/forgot/send_code', () => {
    const mockCustoms = mocks.mockCustoms();
    const uid = uuid.v4('binary').toString('hex');
    const passwordForgotTokenId = crypto.randomBytes(16).toString('hex');
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      passCode: 'foo',
      passwordForgotTokenId,
      uid,
    });
    const mockMailer = mocks.mockMailer();
    const mockMetricsContext = mocks.mockMetricsContext();
    const mockLog = log('ERROR', 'test', {
      stdout: {
        on: sinon.spy(),
        write: sinon.spy(),
      },
      stderr: {
        on: sinon.spy(),
        write: sinon.spy(),
      },
    });
    mockLog.flowEvent = sinon.spy(() => {
      return P.resolve();
    });
    const passwordRoutes = makeRoutes({
      customs: mockCustoms,
      db: mockDB,
      mailer: mockMailer,
      metricsContext: mockMetricsContext,
      log: mockLog,
    });

    const mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        metricsContext: {
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - 1,
        },
      },
      query: {},
      metricsContext: mockMetricsContext,
    });
    return runRoute(
      passwordRoutes,
      '/password/forgot/send_code',
      mockRequest
    ).then(response => {
      assert.equal(
        mockDB.accountRecord.callCount,
        1,
        'db.emailRecord was called once'
      );

      assert.equal(
        mockDB.createPasswordForgotToken.callCount,
        1,
        'db.createPasswordForgotToken was called once'
      );
      let args = mockDB.createPasswordForgotToken.args[0];
      assert.equal(
        args.length,
        1,
        'db.createPasswordForgotToken was passed one argument'
      );
      assert.deepEqual(
        args[0].uid,
        uid,
        'db.createPasswordForgotToken was passed the correct uid'
      );
      assert.equal(
        args[0].createdAt,
        undefined,
        'db.createPasswordForgotToken was not passed a createdAt timestamp'
      );

      assert.equal(
        mockRequest.validateMetricsContext.callCount,
        1,
        'validateMetricsContext was called'
      );

      assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1);
      args = mockMetricsContext.setFlowCompleteSignal.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'account.reset');

      assert.equal(mockMetricsContext.stash.callCount, 1);
      args = mockMetricsContext.stash.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0].id, passwordForgotTokenId);
      assert.equal(args[0].uid, uid);

      assert.equal(
        mockLog.flowEvent.callCount,
        2,
        'log.flowEvent was called twice'
      );
      assert.equal(
        mockLog.flowEvent.args[0][0].event,
        'password.forgot.send_code.start',
        'password.forgot.send_code.start event was logged'
      );
      assert.equal(
        mockLog.flowEvent.args[1][0].event,
        'password.forgot.send_code.completed',
        'password.forgot.send_code.completed event was logged'
      );

      assert.equal(
        mockMailer.sendRecoveryEmail.callCount,
        1,
        'mailer.sendRecoveryEmail was called once'
      );
      args = mockMailer.sendRecoveryEmail.args[0];
      assert.equal(args[2].location.city, 'Mountain View');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].timeZone, 'America/Los_Angeles');
      assert.equal(args[2].uid, uid);
      assert.equal(args[2].deviceId, 'wibble');
    });
  });

  it('/forgot/resend_code', () => {
    const mockCustoms = mocks.mockCustoms();
    const uid = uuid.v4('binary').toString('hex');
    const mockDB = mocks.mockDB();
    const mockMailer = mocks.mockMailer();
    const mockMetricsContext = mocks.mockMetricsContext();
    const mockLog = log('ERROR', 'test', {
      stdout: {
        on: sinon.spy(),
        write: sinon.spy(),
      },
      stderr: {
        on: sinon.spy(),
        write: sinon.spy(),
      },
    });
    mockLog.flowEvent = sinon.spy(() => {
      return P.resolve();
    });
    const passwordRoutes = makeRoutes({
      customs: mockCustoms,
      db: mockDB,
      mailer: mockMailer,
      metricsContext: mockMetricsContext,
      log: mockLog,
    });

    const mockRequest = mocks.mockRequest({
      credentials: {
        data: crypto.randomBytes(16).toString('hex'),
        email: TEST_EMAIL,
        passCode: Buffer.from('abcdef', 'hex'),
        ttl: function() {
          return 17;
        },
        uid: uid,
      },
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        email: TEST_EMAIL,
        metricsContext: {
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - 1,
        },
      },
      query: {},
    });
    return runRoute(
      passwordRoutes,
      '/password/forgot/resend_code',
      mockRequest
    ).then(response => {
      assert.equal(
        mockMailer.sendRecoveryEmail.callCount,
        1,
        'mailer.sendRecoveryEmail was called once'
      );
      assert.equal(mockMailer.sendRecoveryEmail.args[0][2].uid, uid);
      assert.equal(mockMailer.sendRecoveryEmail.args[0][2].deviceId, 'wibble');

      assert.equal(mockRequest.validateMetricsContext.callCount, 0);
      assert.equal(
        mockLog.flowEvent.callCount,
        2,
        'log.flowEvent was called twice'
      );
      assert.equal(
        mockLog.flowEvent.args[0][0].event,
        'password.forgot.resend_code.start',
        'password.forgot.resend_code.start event was logged'
      );
      assert.equal(
        mockLog.flowEvent.args[1][0].event,
        'password.forgot.resend_code.completed',
        'password.forgot.resend_code.completed event was logged'
      );
    });
  });

  it('/forgot/verify_code', () => {
    const mockCustoms = mocks.mockCustoms();
    const uid = uuid.v4('binary').toString('hex');
    const accountResetToken = {
      data: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex'),
      uid,
    };
    const passwordForgotTokenId = crypto.randomBytes(16).toString('hex');
    const mockDB = mocks.mockDB({
      accountResetToken: accountResetToken,
      email: TEST_EMAIL,
      passCode: 'abcdef',
      passwordForgotTokenId,
      uid,
    });
    const mockMailer = mocks.mockMailer();
    const mockMetricsContext = mocks.mockMetricsContext();
    const mockLog = log('ERROR', 'test', {
      stdout: {
        on: sinon.spy(),
        write: sinon.spy(),
      },
      stderr: {
        on: sinon.spy(),
        write: sinon.spy(),
      },
    });
    mockLog.flowEvent = sinon.spy(() => {
      return P.resolve();
    });
    const passwordRoutes = makeRoutes({
      customs: mockCustoms,
      db: mockDB,
      mailer: mockMailer,
      metricsContext: mockMetricsContext,
    });

    const mockRequest = mocks.mockRequest({
      log: mockLog,
      credentials: {
        email: TEST_EMAIL,
        id: passwordForgotTokenId,
        passCode: Buffer.from('abcdef', 'hex'),
        ttl: function() {
          return 17;
        },
        uid,
      },
      metricsContext: mockMetricsContext,
      payload: {
        code: 'abcdef',
        metricsContext: {
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - 1,
        },
      },
      query: {},
    });
    return runRoute(
      passwordRoutes,
      '/password/forgot/verify_code',
      mockRequest
    ).then(response => {
      assert.deepEqual(
        Object.keys(response),
        ['accountResetToken'],
        'an accountResetToken was returned'
      );
      assert.equal(
        response.accountResetToken,
        accountResetToken.data.toString('hex'),
        'correct accountResetToken was returned'
      );

      assert.equal(
        mockCustoms.check.callCount,
        1,
        'customs.check was called once'
      );

      assert.equal(
        mockDB.forgotPasswordVerified.callCount,
        1,
        'db.passwordForgotVerified was called once'
      );
      let args = mockDB.forgotPasswordVerified.args[0];
      assert.equal(
        args.length,
        1,
        'db.passwordForgotVerified was passed one argument'
      );
      assert.deepEqual(
        args[0].uid,
        uid,
        'db.forgotPasswordVerified was passed the correct token'
      );

      assert.equal(mockRequest.validateMetricsContext.callCount, 0);
      assert.equal(
        mockLog.flowEvent.callCount,
        2,
        'log.flowEvent was called twice'
      );
      assert.equal(
        mockLog.flowEvent.args[0][0].event,
        'password.forgot.verify_code.start',
        'password.forgot.verify_code.start event was logged'
      );
      assert.equal(
        mockLog.flowEvent.args[1][0].event,
        'password.forgot.verify_code.completed',
        'password.forgot.verify_code.completed event was logged'
      );

      assert.equal(mockMetricsContext.propagate.callCount, 1);
      args = mockMetricsContext.propagate.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0].id, passwordForgotTokenId);
      assert.equal(args[0].uid, uid);
      assert.equal(args[1].id, accountResetToken.id);
      assert.equal(args[1].uid, uid);

      assert.equal(mockMailer.sendPasswordResetEmail.callCount, 1);
      assert.equal(mockMailer.sendPasswordResetEmail.args[0][2].uid, uid);
      assert.equal(
        mockMailer.sendPasswordResetEmail.args[0][2].deviceId,
        'wibble'
      );
    });
  });

  describe('/change/finish', () => {
    it('smoke', () => {
      const uid = uuid.v4('binary').toString('hex');
      const devices = [
        { uid: uid, id: crypto.randomBytes(16) },
        { uid: uid, id: crypto.randomBytes(16) },
      ];
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        devices,
      });
      const mockPush = mocks.mockPush();
      const mockMailer = mocks.mockMailer();
      const mockLog = mocks.mockLog();
      const mockRequest = mocks.mockRequest({
        credentials: {
          uid: uid,
        },
        devices,
        payload: {
          authPW: crypto.randomBytes(32).toString('hex'),
          wrapKb: crypto.randomBytes(32).toString('hex'),
          sessionToken: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        log: mockLog,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '57',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
      });
      const passwordRoutes = makeRoutes({
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
      });

      return runRoute(
        passwordRoutes,
        '/password/change/finish',
        mockRequest
      ).then(response => {
        assert.equal(mockDB.deletePasswordChangeToken.callCount, 1);
        assert.equal(mockDB.resetAccount.callCount, 1);

        assert.equal(
          mockPush.notifyPasswordChanged.callCount,
          1,
          'sent a push notification of the change'
        );
        assert.deepEqual(
          mockPush.notifyPasswordChanged.firstCall.args[0],
          uid,
          'notified the correct uid'
        );
        assert.deepEqual(
          mockPush.notifyPasswordChanged.firstCall.args[1],
          [devices[1]],
          'notified only the second device'
        );

        assert.equal(mockDB.account.callCount, 1);
        assert.equal(mockMailer.sendPasswordChangedEmail.callCount, 1);
        let args = mockMailer.sendPasswordChangedEmail.args[0];
        assert.lengthOf(args, 3);
        assert.equal(args[1].email, TEST_EMAIL);
        assert.equal(args[2].location.city, 'Mountain View');
        assert.equal(args[2].location.country, 'United States');
        assert.equal(args[2].timeZone, 'America/Los_Angeles');
        assert.equal(args[2].uid, uid);

        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
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
            event: 'account.changedPassword',
            region: 'California',
            service: undefined,
            uid: uid.toString('hex'),
            userAgent: 'test user-agent',
          },
          'argument was event data'
        );

        assert.equal(
          mockDB.createSessionToken.callCount,
          1,
          'db.createSessionToken was called once'
        );
        args = mockDB.createSessionToken.args[0];
        assert.equal(
          args.length,
          1,
          'db.createSessionToken was passed one argument'
        );
        assert.equal(
          args[0].uaBrowser,
          'Firefox',
          'db.createSessionToken was passed correct browser'
        );
        assert.equal(
          args[0].uaBrowserVersion,
          '57',
          'db.createSessionToken was passed correct browser version'
        );
        assert.equal(
          args[0].uaOS,
          'Mac OS X',
          'db.createSessionToken was passed correct os'
        );
        assert.equal(
          args[0].uaOSVersion,
          '10.11',
          'db.createSessionToken was passed correct os version'
        );
        assert.equal(
          args[0].uaDeviceType,
          null,
          'db.createSessionToken was passed correct device type'
        );
        assert.equal(
          args[0].uaFormFactor,
          null,
          'db.createSessionToken was passed correct form factor'
        );
      });
    });

    it('succeeds even if notification blocked', () => {
      const uid = uuid.v4('binary').toString('hex');
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid: uid,
      });
      const mockPush = mocks.mockPush();
      const mockMailer = {
        sendPasswordChangedEmail: sinon.spy(() => {
          return P.reject(error.emailBouncedHard());
        }),
      };
      const mockLog = mocks.mockLog();
      const mockRequest = mocks.mockRequest({
        credentials: {
          uid: uid,
        },
        payload: {
          authPW: crypto.randomBytes(32).toString('hex'),
          wrapKb: crypto.randomBytes(32).toString('hex'),
          sessionToken: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        log: mockLog,
      });
      const passwordRoutes = makeRoutes({
        config: {
          domain: 'wibble',
          smtp: {},
        },
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
      });

      return runRoute(
        passwordRoutes,
        '/password/change/finish',
        mockRequest
      ).then(response => {
        assert.equal(mockDB.deletePasswordChangeToken.callCount, 1);
        assert.equal(mockDB.resetAccount.callCount, 1);

        assert.equal(mockPush.notifyPasswordChanged.callCount, 1);
        assert.deepEqual(mockPush.notifyPasswordChanged.firstCall.args[0], uid);

        const notifyArgs = mockLog.notifyAttachedServices.args[0];
        assert.equal(
          notifyArgs.length,
          3,
          'log.notifyAttachedServices was passed three arguments'
        );
        assert.equal(
          notifyArgs[0],
          'passwordChange',
          'first argument was event name'
        );
        assert.equal(
          notifyArgs[1],
          mockRequest,
          'second argument was request object'
        );
        assert.equal(
          notifyArgs[2].uid,
          uid,
          'third argument was event data with a uid'
        );

        assert.equal(mockDB.account.callCount, 1);
        assert.equal(mockMailer.sendPasswordChangedEmail.callCount, 1);

        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        const args = mockLog.activityEvent.args[0];
        assert.equal(
          args.length,
          1,
          'log.activityEvent was passed one argument'
        );
        assert.deepEqual(
          args[0],
          {
            country: 'United States',
            event: 'account.changedPassword',
            region: 'California',
            service: undefined,
            uid: uid.toString('hex'),
            userAgent: 'test user-agent',
          },
          'argument was event data'
        );
      });
    });
  });
});
