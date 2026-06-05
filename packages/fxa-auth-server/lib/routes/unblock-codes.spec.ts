/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import { AuthLogger } from '../types';
import {
  installMockFxaMailer,
  uninstallMockFxaMailer,
} from '../../test/fixtures/fxa-mailer';

const uuid = require('uuid');

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

// FxaMailer is resolved from the TypeDI Container at route-factory construction
// time, so it must be installed before makeRoutes() runs (see the describe-scope
// install below). Tear it down once for the whole file to keep cross-file isolation.
afterAll(() => {
  uninstallMockFxaMailer();
});

function makeRoutes(options: any = {}) {
  const config = options.config || {};
  const log = options.log || createMock<AuthLogger>();
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
  const mockLog = createMock<AuthLogger>();
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
  // Mock the modern FxaMailer (the legacy `mailer` else-branch is not exercised:
  // canSend defaults to true, so makeRoutes leaves `mailer` as the default stub).
  const mockFxaMailer = installMockFxaMailer();
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
  });
  const route = getRoute(accountRoutes, '/account/login/send_unblock_code');

  afterEach(() => {
    mockDb.accountRecord.mockClear();
    mockDb.createUnblockCode.mockClear();
    mockFxaMailer.sendUnblockCodeEmail.mockClear();
  });

  it('signin unblock enabled', () => {
    return runTest(route, mockRequest, (response) => {
      expect(response).not.toBeInstanceOf(Error);
      expect(response).toEqual({});

      expect(mockDb.accountRecord).toHaveBeenCalledTimes(1);
      expect(mockDb.accountRecord).toHaveBeenNthCalledWith(1, email);

      expect(mockDb.createUnblockCode).toHaveBeenCalledTimes(1);
      expect(mockDb.createUnblockCode).toHaveBeenNthCalledWith(1, uid);

      expect(mockFxaMailer.sendUnblockCodeEmail).toHaveBeenCalledTimes(1);

      expect(mockLog.flowEvent).toHaveBeenCalledTimes(1);
      expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ event: 'account.login.sentUnblockCode' })
      );
      mockLog.flowEvent.mockClear();
    });
  });

  it('uses normalized email address for feature flag', () => {
    mockRequest.payload.email = 'UNBLOCK@example.com';

    return runTest(route, mockRequest, (response) => {
      expect(response).not.toBeInstanceOf(Error);
      expect(response).toEqual({});

      expect(mockDb.accountRecord).toHaveBeenCalledTimes(1);
      expect(mockDb.accountRecord).toHaveBeenNthCalledWith(
        1,
        mockRequest.payload.email
      );
      expect(mockDb.createUnblockCode).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendUnblockCodeEmail).toHaveBeenCalledTimes(1);
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

      expect(mockDb.consumeUnblockCode).toHaveBeenCalledTimes(1);
      const args = mockDb.consumeUnblockCode.mock.calls[0];
      expect(args).toHaveLength(2);
      expect(args[0].toString('hex')).toBe(uid);
      expect(args[1]).toBe(unblockCode);
    });
  });
});
