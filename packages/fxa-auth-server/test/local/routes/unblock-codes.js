/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import { getRoute } from '../../routes_helpers';
import mocks from '../../mocks';
import proxyquire from 'proxyquire';
import * as uuid from 'uuid';

function makeRoutes(options = {}, requireMocks) {
  const config = options.config || {};
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: function () {
      return Promise.resolve(true);
    },
  };

  const unblockCodesModule = proxyquire(
    '../../../lib/routes/unblock-codes',
    requireMocks || {}
  );
  return unblockCodesModule.default(
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
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
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
    mockMailer.sendUnblockCodeEmail.resetHistory();
  });

  it('signin unblock enabled', () => {
    return runTest(route, mockRequest, (response) => {
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

      assert.equal(mockMailer.sendUnblockCodeEmail.callCount, 1);
      const args = mockMailer.sendUnblockCodeEmail.args[0];
      assert.equal(args.length, 3);

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

    return runTest(route, mockRequest, (response) => {
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
      assert.equal(mockMailer.sendUnblockCodeEmail.callCount, 1);
    });
  });
});

describe('/account/login/reject_unblock_code', () => {
  it('should consume the unblock code', () => {
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
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

    return runTest(route, mockRequest, (response) => {
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
