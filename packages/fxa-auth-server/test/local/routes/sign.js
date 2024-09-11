/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import crypto from 'crypto';
import * as uuid from 'uuid';
import { getRoute } from '../../routes_helpers';
import mocks from '../../mocks';
import error from '../../../lib/error';

describe('/certificate/sign', () => {
  let db, deviceId, mockDevices, mockLog, sessionToken, mockRequest;

  beforeEach(() => {
    db = mocks.mockDB();
    deviceId = crypto.randomBytes(16).toString('hex');
    mockDevices = mocks.mockDevices({
      deviceId: deviceId,
    });
    mockLog = mocks.mockLog();
    const Token = require('../../../lib/tokens/token')(mockLog);
    const SessionToken = require('../../../lib/tokens/session_token')(
      mockLog,
      Token,
      {
        tokenLifetimes: {
          sessionTokenWithoutDevice: 2419200000,
        },
      }
    );
    return SessionToken.create({
      uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
      email: 'foo@example.com',
      emailVerified: true,
      locale: 'en',
      uaBrowser: 'should be overridden by the request data',
      uaBrowserVersion: '42',
      uaOS: 'foo',
      uaOSVersion: 'bar',
      uaDeviceType: 'baz',
      uaFormFactor: 'qux',
    }).then((result) => {
      assert.equal(
        result.lastAccessTime,
        undefined,
        'lastAccessTime is not set'
      );
      sessionToken = result;
      mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:55.0) Gecko/20100101 Firefox/55.0',
        },
        uaBrowser: 'Firefox',
        uaBrowserVersion: '55',
        uaOS: 'Windows',
        uaOSVersion: '10',
        log: mockLog,
        payload: {
          duration: 0,
          publicKey: {
            algorithm: 'RS',
            n: 'bar',
            e: 'baz',
          },
        },
        query: {},
      });
    });
  });

  it('without service', () => {
    return runTest(
      {
        db,
        devices: mockDevices,
        log: mockLog,
      },
      mockRequest,
      () => {
        assert.equal(
          db.touchSessionToken.callCount,
          1,
          'db.touchSessionToken was called once'
        );
        let args = db.touchSessionToken.args[0];
        assert.equal(
          args.length,
          2,
          'db.touchSessionToken was passed two arguments'
        );
        assert.equal(
          args[0].uid,
          sessionToken.uid,
          'first argument uid property was correct'
        );
        assert.equal(
          args[0].email,
          sessionToken.email,
          'first argument email property was correct'
        );
        assert.equal(
          args[0].uaBrowser,
          'Firefox',
          'first argument uaBrowser property was correct'
        );
        assert.equal(
          args[0].uaBrowserVersion,
          '55',
          'first argument uaBrowserVersion property was correct'
        );
        assert.equal(
          args[0].uaOS,
          'Windows',
          'first argument uaOS property was correct'
        );
        assert.equal(
          args[0].uaOSVersion,
          '10',
          'first argument uaOSVersion property was correct'
        );
        assert.equal(
          args[0].uaDeviceType,
          null,
          'first argument uaDeviceType property was null'
        );
        assert.equal(
          args[0].uaFormFactor,
          null,
          'first argument uaFormFactor property was null'
        );
        assert.ok(args[0].lastAccessTime, 'lastAccessTime is set');
        assert.ok(
          args[0].lastAccessTime > args[0].createdAt,
          'lastAccessTime is updated'
        );
        assert.equal(
          args[1],
          mockRequest.app.geo,
          'second argument was geo data'
        );

        assert.equal(
          mockDevices.upsert.callCount,
          1,
          'devices.upsert was called once'
        );
        args = mockDevices.upsert.args[0];
        assert.equal(args.length, 3, 'devices.upsert was passed one argument');
        assert.equal(args[0], mockRequest, 'first argument was request object');
        assert.equal(
          args[1],
          mockRequest.auth.credentials,
          'second argument was sessionToken'
        );
        assert.deepEqual(
          args[2],
          {
            uaBrowser: 'Firefox',
            uaBrowserVersion: '55',
            uaOS: 'Windows',
            uaOSVersion: '10',
          },
          'third argument was UA info'
        );

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
            device_id: deviceId.toString('hex'),
            event: 'account.signed',
            region: 'California',
            service: 'sync',
            uid: mockRequest.auth.credentials.uid.toString('hex'),
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:55.0) Gecko/20100101 Firefox/55.0',
          },
          'argument was event data'
        );
      }
    );
  });

  it('with service=sync', () => {
    mockRequest.query.service = 'sync';

    return runTest(
      {
        devices: mockDevices,
        log: mockLog,
      },
      mockRequest,
      () => {
        assert.equal(
          mockDevices.upsert.callCount,
          1,
          'devices.upsert was called once'
        );
        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        const args = mockLog.activityEvent.args[0];
        assert.equal(args[0].service, 'sync', 'service=sync was logged');
      }
    );
  });

  it('with service=foo', () => {
    mockRequest.query.service = 'foo';

    return runTest(
      {
        devices: mockDevices,
        log: mockLog,
      },
      mockRequest,
      () => {
        assert.equal(
          mockDevices.upsert.callCount,
          1,
          'devices.upsert was called'
        );
        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        const args = mockLog.activityEvent.args[0];
        assert.equal(args[0].service, 'foo', 'service=foo was logged');
      }
    );
  });

  it('with deviceId', () => {
    mockRequest.query.service = 'sync';
    mockRequest.auth.credentials.deviceId = crypto
      .randomBytes(16)
      .toString('hex');

    return runTest(
      {
        devices: mockDevices,
        log: mockLog,
      },
      mockRequest,
      () => {
        assert.equal(
          mockDevices.upsert.callCount,
          0,
          'devices.upsert was not called'
        );
        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        assert.equal(
          mockLog.activityEvent.args[0][0].device_id,
          mockRequest.auth.credentials.deviceId.toString('hex'),
          'device_id was correct'
        );
      }
    );
  });

  it('with concurrent registration of a device record', () => {
    mockRequest.query.service = 'sync';
    const conflictingDeviceId = crypto.randomBytes(16).toString('hex');
    mockDevices = mocks.mockDevices(
      {},
      {
        upsert: error.deviceSessionConflict(conflictingDeviceId),
      }
    );

    return runTest(
      {
        devices: mockDevices,
        log: mockLog,
      },
      mockRequest,
      () => {
        assert.equal(
          mockDevices.upsert.callCount,
          1,
          'devices.upsert was called once'
        );
        assert.equal(
          mockLog.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        assert.equal(
          mockLog.activityEvent.args[0][0].device_id,
          conflictingDeviceId,
          'device_id was correct'
        );
      }
    );
  });

  it('with session that requires verification', () => {
    mockRequest.query.service = 'foo';
    mockRequest.auth.credentials.mustVerify = true;
    mockRequest.auth.credentials.tokenVerified = false;

    return runTest(
      {
        log: mockLog,
      },
      mockRequest,
      (r) => {
        assert.fail('should have errored');
      },
      (e) => {
        assert.equal(e.errno, 138, 'failed due to unverified session');
      }
    );
  });

  it('with unverified session that does not require verification', () => {
    mockRequest.auth.credentials.mustVerify = false;
    mockRequest.auth.credentials.tokenVerified = false;

    return runTest(
      {
        devices: mockDevices,
        log: mockLog,
      },
      mockRequest,
      (res) => {
        assert.ok(res);
      }
    );
  });

  describe('disable certification sign endpoint', () => {
    it('with rollout 0 (0%)', async () => {
      return runTest(
        {
          devices: mockDevices,
          log: mockLog,
          config: {
            certificateSignDisableRolloutRate: 0,
          },
        },
        mockRequest,
        (res) => {
          assert.equal(
            mockDevices.upsert.callCount,
            1,
            'devices.upsert was called once'
          );
          assert.equal(
            mockLog.activityEvent.callCount,
            1,
            'log.activityEvent was called once'
          );
        },
        (e) => {
          assert.fail('should have succeeded');
        }
      );
    });

    it('with rollout 1 (100%)', async () => {
      return runTest(
        {
          devices: mockDevices,
          log: mockLog,
          config: {
            certificateSignDisableRolloutRate: 1,
          },
        },
        mockRequest,
        (res) => {
          assert.fail('should have failed succeeded');
        },
        (err) => {
          assert.equal(err.output.statusCode, 404);
          assert.equal(err.errno, 116);
        }
      );
    });
  });

  function runTest(options, request, onSuccess, onError) {
    return new Promise((resolve, reject) => {
      try {
        const response = getRoute(
          makeRoutes(options),
          '/certificate/sign'
        ).handler(request);
        if (response instanceof Error) {
          reject(response);
        } else {
          resolve(response);
        }
      } catch (e) {
        reject(e);
      }
    })
      .then(onSuccess)
      .catch(onError);
  }

  function makeRoutes(options = {}) {
    const log = options.log || mocks.mockLog();

    return require('../../../lib/routes/sign')(
      log,
      options.signer || {
        sign: function () {
          return Promise.resolve({});
        },
      },
      options.db || {
        touchSessionToken: function () {},
        updateLocale: function () {},
      },
      options.domain || 'wibble',
      options.devices,
      options.config || {}
    );
  }
});
