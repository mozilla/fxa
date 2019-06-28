/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const P = require('../../../lib/promise');
const proxyquire = require('proxyquire');
const uuid = require('uuid');

function makeRoutes(options = {}, requireMocks) {
  const config = options.config || {};
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: function() {
      return P.resolve(true);
    },
  };

  return proxyquire('../../../lib/routes/unblock-codes', requireMocks || {})(
    log,
    db,
    options.mailer || {},
    config.signinUnblock || {},
    customs
  );
}

function runTest(route, request, assertions) {
  return route.handler(request).then(assertions);
}

describe('/account/login/send_unblock_code', () => {
  const uid = uuid.v4('binary').toString('hex');
  const email = 'unblock@example.com';
  const mockLog = mocks.mockLog();
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    payload: {
      email: email,
      metricsContext: {
        flowBeginTime: Date.now(),
        flowId:
          'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
      },
    },
  });
  const mockMailer = mocks.mockMailer();
  const mockDb = mocks.mockDB({
    uid: uid,
    email: email,
  });
  const config = {
    signinUnblock: {},
  };
  const accountRoutes = makeRoutes({
    config: config,
    db: mockDb,
    log: mockLog,
    mailer: mockMailer,
  });
  const route = getRoute(accountRoutes, '/account/login/send_unblock_code');

  afterEach(() => {
    mockDb.accountRecord.resetHistory();
    mockDb.createUnblockCode.resetHistory();
    mockMailer.sendUnblockCode.resetHistory();
  });

  it('signin unblock enabled', () => {
    return runTest(route, mockRequest, response => {
      assert.ok(!(response instanceof Error), response.stack);
      assert.deepEqual(response, {}, 'response has no keys');

      assert.equal(
        mockDb.accountRecord.callCount,
        1,
        'db.accountRecord called'
      );
      assert.equal(mockDb.accountRecord.args[0][0], email);

      assert.equal(
        mockDb.createUnblockCode.callCount,
        1,
        'db.createUnblockCode called'
      );
      const dbArgs = mockDb.createUnblockCode.args[0];
      assert.equal(dbArgs.length, 1);
      assert.equal(dbArgs[0], uid);

      assert.equal(
        mockMailer.sendUnblockCode.callCount,
        1,
        'called mailer.sendUnblockCode'
      );
      const args = mockMailer.sendUnblockCode.args[0];
      assert.equal(args.length, 3, 'mailer.sendUnblockCode called with 3 args');

      assert.equal(
        mockLog.flowEvent.callCount,
        1,
        'log.flowEvent was called once'
      );
      assert.equal(
        mockLog.flowEvent.args[0][0].event,
        'account.login.sentUnblockCode',
        'event was account.login.sentUnblockCode'
      );
      mockLog.flowEvent.resetHistory();
    });
  });

  it('uses normalized email address for feature flag', () => {
    mockRequest.payload.email = 'UNBLOCK@example.com';

    return runTest(route, mockRequest, response => {
      assert.ok(!(response instanceof Error), response.stack);
      assert.deepEqual(response, {}, 'response has no keys');

      assert.equal(
        mockDb.accountRecord.callCount,
        1,
        'db.accountRecord called'
      );
      assert.equal(mockDb.accountRecord.args[0][0], mockRequest.payload.email);
      assert.equal(
        mockDb.createUnblockCode.callCount,
        1,
        'db.createUnblockCode called'
      );
      assert.equal(
        mockMailer.sendUnblockCode.callCount,
        1,
        'called mailer.sendUnblockCode'
      );
    });
  });
});

describe('/account/login/reject_unblock_code', () => {
  it('should consume the unblock code', () => {
    const uid = uuid.v4('binary').toString('hex');
    const unblockCode = 'A1B2C3D4';
    const mockRequest = mocks.mockRequest({
      payload: {
        uid: uid,
        unblockCode: unblockCode,
      },
    });
    const mockDb = mocks.mockDB();
    const accountRoutes = makeRoutes({
      db: mockDb,
    });
    const route = getRoute(accountRoutes, '/account/login/reject_unblock_code');

    return runTest(route, mockRequest, response => {
      assert.ok(!(response instanceof Error), response.stack);
      assert.deepEqual(response, {}, 'response has no keys');

      assert.equal(
        mockDb.consumeUnblockCode.callCount,
        1,
        'consumeUnblockCode is called'
      );
      const args = mockDb.consumeUnblockCode.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0].toString('hex'), uid);
      assert.equal(args[1], unblockCode);
    });
  });
});
