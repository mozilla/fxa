/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

const uuid = require('uuid');

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

function makeRoutes(options: any = {}) {
  const config = options.config || {};
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: function () {
      return Promise.resolve(true);
    },
  };

  return require('./unblock-codes')(
    log,
    db,
    options.mailer || {},
    config.signinUnblock || {},
    customs
  );
}

function runTest(route: any, request: any, assertions?: (res: any) => void) {
  return route.handler(request).then((res: any) => {
    if (assertions) assertions(res);
    return res;
  });
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
  const mockFxaMailer = mocks.mockFxaMailer();
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
    mockFxaMailer.sendUnblockCodeEmail.resetHistory();
  });

  it('signin unblock enabled', () => {
    return runTest(route, mockRequest, (response) => {
      expect(response).not.toBeInstanceOf(Error);
      expect(response).toEqual({});

      expect(mockDb.accountRecord.callCount).toBe(1);
      expect(mockDb.accountRecord.args[0][0]).toBe(email);

      expect(mockDb.createUnblockCode.callCount).toBe(1);
      const dbArgs = mockDb.createUnblockCode.args[0];
      expect(dbArgs).toHaveLength(1);
      expect(dbArgs[0]).toBe(uid);

      expect(mockFxaMailer.sendUnblockCodeEmail.callCount).toBe(1);
      const args = mockFxaMailer.sendUnblockCodeEmail.args[0];
      expect(args).toHaveLength(1);

      expect(mockLog.flowEvent.callCount).toBe(1);
      expect(mockLog.flowEvent.args[0][0].event).toBe(
        'account.login.sentUnblockCode'
      );
      mockLog.flowEvent.resetHistory();
    });
  });

  it('uses normalized email address for feature flag', () => {
    mockRequest.payload.email = 'UNBLOCK@example.com';

    return runTest(route, mockRequest, (response) => {
      expect(response).not.toBeInstanceOf(Error);
      expect(response).toEqual({});

      expect(mockDb.accountRecord.callCount).toBe(1);
      expect(mockDb.accountRecord.args[0][0]).toBe(mockRequest.payload.email);
      expect(mockDb.createUnblockCode.callCount).toBe(1);
      expect(mockFxaMailer.sendUnblockCodeEmail.callCount).toBe(1);
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
      expect(response).not.toBeInstanceOf(Error);
      expect(response).toEqual({});

      expect(mockDb.consumeUnblockCode.callCount).toBe(1);
      const args = mockDb.consumeUnblockCode.args[0];
      expect(args).toHaveLength(2);
      expect(args[0].toString('hex')).toBe(uid);
      expect(args[1]).toBe(unblockCode);
    });
  });
});
