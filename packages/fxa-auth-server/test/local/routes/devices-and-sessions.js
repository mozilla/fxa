/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import crypto from 'crypto';
import Joi from 'joi';
import error from '../../../lib/error';
import { getRoute } from '../../routes_helpers';
import mocks from '../../mocks';
import moment from 'moment'; // Ensure consistency with production code
import proxyquire from 'proxyquire';
import * as uuid from 'uuid';
import clientUtilsModule from '../../../lib/routes/utils/clients';
import devicesModule from '../../../lib/devices';
import pushModule from '../../../lib/push';

const assert = { ...sinon.assert, ...require('chai').assert };
const EARLIEST_SANE_TIMESTAMP = 31536000000;

function makeRoutes(options = {}, requireMocks) {
  const config = options.config || {};
  config.oauth = config.oauth || {};
  config.smtp = config.smtp || {};
  config.i18n = {
    supportedLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
  };
  config.push = {
    allowedServerRegex:
      /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/,
  };
  config.lastAccessTimeUpdates = {
    earliestSaneTimestamp: EARLIEST_SANE_TIMESTAMP,
  };
  config.publicUrl = 'https://public.url';

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const oauth = options.oauth || {
    getRefreshTokensByUid: sinon.spy(async () => []),
  };
  const customs = options.customs || {
    check: function () {
      return Promise.resolve(true);
    },
  };

  const push = options.push || pushModule(log, db, {});
  const pushbox = options.pushbox || mocks.mockPushbox();
  const clientUtils = options.clientUtils || clientUtilsModule(log, config);
  const redis = options.redis || {};
  const devicesAndSessionModule = proxyquire(
    '../../../lib/routes/devices-and-sessions',
    requireMocks || {}
  );
  const devicesAndSession = devicesAndSessionModule.default(
    log,
    db,
    oauth,
    config,
    customs,
    push,
    pushbox,
    options.devices || devicesModule(log, db, oauth, push),
    clientUtils,
    redis
  );
  return devicesAndSession;
}

async function runTest(route, request, onSuccess, onError) {
  try {
    const response = await route.handler(request);
    if (route.options.response.schema) {
      const validationSchema = route.options.response.schema;
      await validationSchema.validateAsync(response);
    }
    if (onSuccess) {
      onSuccess(response);
    }
    return response;
  } catch (err) {
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}

function hexString(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

describe('/account/device', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const deviceId = crypto.randomBytes(16).toString('hex');
  const mockDeviceName = 'my awesome device 🍓🔥';
  let config,
    mockRequest,
    devicesData,
    mockDevices,
    mockLog,
    accountRoutes,
    route;

  beforeEach(() => {
    config = {};
    mockRequest = mocks.mockRequest({
      credentials: {
        deviceCallbackAuthKey: '',
        deviceCallbackPublicKey: '',
        deviceCallbackURL: '',
        deviceCallbackIsExpired: false,
        deviceId: deviceId,
        deviceName: mockDeviceName,
        deviceType: 'desktop',
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
      },
      payload: {
        id: deviceId.toString('hex'),
        name: mockDeviceName,
      },
    });
    devicesData = {};
    mockDevices = mocks.mockDevices(devicesData);
    mockLog = mocks.mockLog();
    accountRoutes = makeRoutes({
      config: config,
      devices: mockDevices,
      log: mockLog,
    });
    route = getRoute(accountRoutes, '/account/device');
  });

  it('identical data', () => {
    devicesData.spurious = true;
    return runTest(route, mockRequest, (response) => {
      assert.equal(mockDevices.isSpuriousUpdate.callCount, 1);
      const args = mockDevices.isSpuriousUpdate.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], mockRequest.payload);
      const creds = mockRequest.auth.credentials;
      assert.equal(args[1], creds);

      assert.equal(mockDevices.upsert.callCount, 0);
      // Make sure the shape of the response is the same as if
      // the update wasn't spurious.
      assert.deepEqual(response, {
        availableCommands: {},
        id: creds.deviceId,
        name: creds.deviceName,
        pushAuthKey: creds.deviceCallbackAuthKey,
        pushCallback: creds.deviceCallbackURL,
        pushEndpointExpired: creds.deviceCallbackIsExpired,
        pushPublicKey: creds.deviceCallbackPublicKey,
        type: creds.deviceType,
      });
    });
  });

  it('different data', () => {
    devicesData.spurious = false;
    mockRequest.auth.credentials.deviceId = crypto
      .randomBytes(16)
      .toString('hex');
    const payload = mockRequest.payload;
    payload.name = 'my even awesomer device';
    payload.type = 'phone';
    payload.pushCallback = 'https://push.services.mozilla.com/123456';
    payload.pushPublicKey = mocks.MOCK_PUSH_KEY;

    return runTest(route, mockRequest, (response) => {
      assert.equal(mockDevices.isSpuriousUpdate.callCount, 1);
      assert.equal(
        mockDevices.upsert.callCount,
        1,
        'devices.upsert was called once'
      );
      const args = mockDevices.upsert.args[0];
      assert.equal(args.length, 3, 'devices.upsert was passed three arguments');
      assert.equal(args[0], mockRequest, 'first argument was request object');
      assert.deepEqual(
        args[1].id,
        mockRequest.auth.credentials.id,
        'second argument was session token'
      );
      assert.deepEqual(args[1].uid, uid, 'sessionToken.uid was correct');
      assert.deepEqual(
        args[2],
        mockRequest.payload,
        'third argument was payload'
      );
    });
  });

  it('with no id in payload', () => {
    devicesData.spurious = false;
    mockRequest.payload.id = undefined;

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockDevices.upsert.callCount,
        1,
        'devices.upsert was called once'
      );
      const args = mockDevices.upsert.args[0];
      assert.equal(
        args[2].id,
        mockRequest.auth.credentials.deviceId.toString('hex'),
        'payload.id defaulted to credentials.deviceId'
      );
    });
  });

  // Regression test for https://github.com/mozilla/fxa/issues/2252
  it('spurious update without device type', () => {
    devicesData.spurious = true;
    mockRequest.auth.credentials.deviceType = undefined;

    return runTest(route, mockRequest, (response) => {
      assert.equal(mockDevices.upsert.callCount, 0);
    });
  });

  it('device updates disabled', () => {
    config.deviceUpdatesEnabled = false;

    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown');
    }).then(
      () => assert.ok(false),
      (err) => {
        assert.equal(
          err.output.statusCode,
          503,
          'correct status code is returned'
        );
        assert.equal(
          err.errno,
          error.ERRNO.FEATURE_NOT_ENABLED,
          'correct errno is returned'
        );
      }
    );
  });

  it('pushbox feature disabled', () => {
    config.pushbox = { enabled: false };
    mockRequest.payload.availableCommands = {
      test: 'command',
    };

    return runTest(route, mockRequest, () => {
      assert.equal(
        mockDevices.upsert.callCount,
        1,
        'devices.upsert was called once'
      );
      const args = mockDevices.upsert.args[0];
      assert.deepEqual(
        args[2].availableCommands,
        {},
        'availableCommands are ignored when pushbox is disabled'
      );
    });
  });

  it('removes the push endpoint expired flag on callback URL update', () => {
    const mockRequest = mocks.mockRequest({
      credentials: {
        deviceCallbackAuthKey: '',
        deviceCallbackPublicKey: '',
        deviceCallbackURL:
          'https://updates.push.services.mozilla.com/update/50973923bc3e4507a0aa4e285513194a',
        deviceCallbackIsExpired: true,
        deviceId: deviceId,
        deviceName: mockDeviceName,
        deviceType: 'desktop',
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
      },
      payload: {
        id: deviceId.toString('hex'),
        pushCallback:
          'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
      },
    });

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockDevices.upsert.callCount,
        1,
        'mockDevices.upsert was called'
      );
      assert.equal(
        mockDevices.upsert.args[0][2].pushEndpointExpired,
        false,
        'pushEndpointExpired is updated to false'
      );
    });
  });

  it('should not remove the push endpoint expired flag on any other property update', () => {
    const mockRequest = mocks.mockRequest({
      credentials: {
        deviceCallbackAuthKey: '',
        deviceCallbackPublicKey: '',
        deviceCallbackURL:
          'https://updates.push.services.mozilla.com/update/50973923bc3e4507a0aa4e285513194a',
        deviceCallbackIsExpired: true,
        deviceId: deviceId,
        deviceName: mockDeviceName,
        deviceType: 'desktop',
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
      },
      payload: {
        id: deviceId.toString('hex'),
        name: 'beep beep',
      },
    });

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockDevices.upsert.callCount,
        1,
        'mockDevices.upsert was called'
      );
      assert.equal(
        mockDevices.upsert.args[0][2].pushEndpointExpired,
        undefined,
        'pushEndpointExpired is not updated'
      );
    });
  });
});

describe('/account/devices/notify', () => {
  const config = {};
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const deviceId = crypto.randomBytes(16).toString('hex');
  const mockLog = mocks.mockLog();
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    devices: [
      {
        id: 'bogusid1',
        type: 'mobile',
      },
      {
        id: 'bogusid2',
        type: 'desktop',
      },
    ],
    credentials: {
      uid: uid,
      deviceId: deviceId,
    },
  });
  const pushPayload = {
    version: 1,
    command: 'sync:collection_changed',
    data: {
      collections: ['clients'],
    },
  };
  const mockPush = mocks.mockPush();
  const mockCustoms = mocks.mockCustoms();
  const accountRoutes = makeRoutes({
    config: config,
    customs: mockCustoms,
    push: mockPush,
  });
  let route = getRoute(accountRoutes, '/account/devices/notify');

  it('bad payload', () => {
    mockRequest.payload = {
      to: ['bogusid1'],
      payload: {
        bogus: 'payload',
      },
    };
    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown');
    }).then(
      () => assert(false),
      (err) => {
        assert.equal(
          mockPush.sendPush.callCount,
          0,
          'mockPush.sendPush was not called'
        );
        assert.equal(err.errno, 107, 'Correct errno for invalid push payload');
      }
    );
  });

  it('all devices', () => {
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload,
    };
    // We don't wait on sendPush in the request handler, that's why
    // we have to wait on it manually by spying.
    const sendPushPromise = new Promise((resolve) => {
      mockPush.sendPush = sinon.spy(() => {
        resolve();
        return Promise.resolve();
      });
    });
    return runTest(route, mockRequest, (response) => {
      return sendPushPromise.then(() => {
        assert.equal(
          mockCustoms.checkAuthenticated.callCount,
          1,
          'mockCustoms.checkAuthenticated was called once'
        );
        assert.equal(
          mockPush.sendPush.callCount,
          1,
          'mockPush.sendPush was called once'
        );
        const args = mockPush.sendPush.args[0];
        assert.equal(
          args.length,
          4,
          'mockPush.sendPush was passed four arguments'
        );
        assert.equal(args[0], uid, 'first argument was the device uid');
        assert.ok(Array.isArray(args[1]), 'second argument was devices array');
        assert.equal(
          args[2],
          'devicesNotify',
          'second argument was the devicesNotify reason'
        );
        assert.deepEqual(
          args[3],
          {
            data: pushPayload,
            TTL: 60,
          },
          'third argument was the push options'
        );
      });
    });
  });

  it('extra push payload properties are rejected', () => {
    const extraPropsPayload = JSON.parse(JSON.stringify(pushPayload));
    extraPropsPayload.extra = true;
    extraPropsPayload.data.extra = true;
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: extraPropsPayload,
    };
    // We don't wait on sendPush in the request handler, that's why
    // we have to wait on it manually by spying.
    mockPush.sendPush = sinon.spy(() => {
      return Promise.resolve();
    });
    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown');
    }).then(
      () => assert.ok(false),
      (err) => {
        assert.equal(
          err.output.statusCode,
          400,
          'correct status code is returned'
        );
        assert.equal(
          err.errno,
          error.ERRNO.INVALID_PARAMETER,
          'correct errno is returned'
        );
      }
    );
  });

  it('specific devices', () => {
    mockCustoms.checkAuthenticated.resetHistory();
    mockLog.activityEvent.resetHistory();
    mockLog.error.resetHistory();
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload,
    };
    // We don't wait on sendPush in the request handler, that's why
    // we have to wait on it manually by spying.
    const sendPushPromise = new Promise((resolve) => {
      mockPush.sendPush = sinon.spy(() => {
        resolve();
        return Promise.resolve();
      });
    });
    return runTest(route, mockRequest, (response) => {
      return sendPushPromise.then(() => {
        assert.equal(
          mockCustoms.checkAuthenticated.callCount,
          1,
          'mockCustoms.checkAuthenticated was called once'
        );
        assert.equal(
          mockPush.sendPush.callCount,
          1,
          'mockPush.sendPush was called once'
        );
        let args = mockPush.sendPush.args[0];
        assert.equal(
          args.length,
          4,
          'mockPush.sendPush was passed four arguments'
        );
        assert.equal(args[0], uid, 'first argument was the device uid');
        assert.ok(Array.isArray(args[1]), 'second argument was devices array');
        assert.equal(
          args[2],
          'devicesNotify',
          'third argument was the devicesNotify reason'
        );
        assert.deepEqual(
          args[3],
          {
            data: pushPayload,
            TTL: 60,
          },
          'fourth argument was the push options'
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
            event: 'sync.sentTabToDevice',
            region: 'California',
            service: 'sync',
            userAgent: 'test user-agent',
            uid: uid.toString('hex'),
            device_id: deviceId.toString('hex'),
          },
          'event data was correct'
        );
        assert.equal(mockLog.error.callCount, 0, 'log.error was not called');
      });
    });
  });

  it('does not log activity event for non-send-tab-related notifications', () => {
    mockPush.sendPush.resetHistory();
    mockLog.activityEvent.resetHistory();
    mockLog.error.resetHistory();
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: {
        version: 1,
        command: 'fxaccounts:password_reset',
      },
    };
    return runTest(route, mockRequest, (response) => {
      assert.equal(
        mockPush.sendPush.callCount,
        1,
        'mockPush.sendPush was called once'
      );
      assert.equal(
        mockLog.activityEvent.callCount,
        0,
        'log.activityEvent was not called'
      );
      assert.equal(mockLog.error.callCount, 0, 'log.error was not called');
    });
  });

  it('device driven notifications disabled', () => {
    config.deviceNotificationsEnabled = false;
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload,
    };

    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown');
    }).then(
      () => assert.ok(false),
      (err) => {
        assert.equal(
          err.output.statusCode,
          503,
          'correct status code is returned'
        );
        assert.equal(
          err.errno,
          error.ERRNO.FEATURE_NOT_ENABLED,
          'correct errno is returned'
        );
      }
    );
  });

  it('throws error if customs blocked the request', () => {
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload,
    };
    config.deviceNotificationsEnabled = true;

    const mockCustoms = mocks.mockCustoms({
      checkAuthenticated: error.tooManyRequests(1),
    });
    route = getRoute(
      makeRoutes({ customs: mockCustoms }),
      '/account/devices/notify'
    );

    return runTest(route, mockRequest, (response) => {
      assert(false, 'should have thrown');
    }).then(
      () => assert(false),
      (err) => {
        assert.equal(
          mockCustoms.checkAuthenticated.callCount,
          1,
          'mockCustoms.checkAuthenticated was called once'
        );
        assert.equal(err.message, 'Client has sent too many requests');
      }
    );
  });

  it('logs error if no devices found', () => {
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload,
    };

    const mockLog = mocks.mockLog();
    const mockPush = mocks.mockPush({
      sendPush: () => Promise.reject('devices empty'),
    });
    const mockCustoms = {
      checkAuthenticated: () => Promise.resolve(),
    };

    route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
      }),
      '/account/devices/notify'
    );

    return runTest(route, mockRequest, (response) => {
      assert.equal(
        JSON.stringify(response),
        '{}',
        'response should not throw push errors'
      );
    });
  });

  it('can send account verification message with empty payload', () => {
    mockRequest.payload = {
      to: 'all',
      _endpointAction: 'accountVerify',
      payload: {},
    };
    const sendPushPromise = new Promise((resolve) => {
      mockPush.sendPush = sinon.spy(() => {
        resolve();
        return Promise.resolve();
      });
    });
    const mockCustoms = {
      checkAuthenticated: () => Promise.resolve(),
    };
    route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
      }),
      '/account/devices/notify'
    );

    return runTest(route, mockRequest, () => {
      return sendPushPromise.then(() => {
        assert.equal(
          mockPush.sendPush.callCount,
          1,
          'mockPush.sendPush was called once'
        );
        const args = mockPush.sendPush.args[0];
        assert.equal(
          args.length,
          4,
          'mockPush.sendPush was passed four arguments'
        );
        assert.equal(args[0], uid, 'first argument was the device uid');
        assert.ok(Array.isArray(args[1]), 'second argument was devices array');
        assert.equal(
          args[2],
          'accountVerify',
          'second argument was the accountVerify reason'
        );
        assert.deepEqual(
          args[3],
          {
            data: {},
          },
          'third argument was the push options'
        );
      });
    });
  });

  it('reject account verification message with non-empty payload', () => {
    mockRequest.payload = {
      to: 'all',
      _endpointAction: 'accountVerify',
      payload: pushPayload,
    };
    route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
      }),
      '/account/devices/notify'
    );

    return runTest(route, mockRequest).then(
      () => {
        assert.fail('should not have succeed');
      },
      (err) => {
        assert.equal(err.errno, 107, 'invalid parameter in request body');
      }
    );
  });
});

describe('/account/device/commands', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const deviceId = crypto.randomBytes(16).toString('hex');
  let mockLog, mockRequest, mockCustoms;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    mockRequest = mocks.mockRequest({
      log: mockLog,
      credentials: {
        uid: uid,
        deviceId: deviceId,
      },
    });
    mockCustoms = mocks.mockCustoms();
  });

  it('retrieves messages using the pushbox service', () => {
    const mockResponse = {
      last: true,
      index: 4,
      messages: [
        { index: 3, data: { command: 'three', payload: {} } },
        { index: 4, data: { command: 'four', payload: {} } },
      ],
    };
    const mockPushbox = mocks.mockPushbox();
    mockPushbox.retrieve = sinon.spy(() => Promise.resolve(mockResponse));

    mockRequest.query = {
      index: 2,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/device/commands'
    );

    const validationSchema = route.options.validate.query;
    mockRequest.query = validationSchema.validate(mockRequest.query).value;
    assert.ok(mockRequest.query);
    return runTest(route, mockRequest).then((response) => {
      assert.equal(mockPushbox.retrieve.callCount, 1, 'pushbox was called');
      assert.calledWithExactly(mockPushbox.retrieve, uid, deviceId, 100, 2);
      assert.deepEqual(response, mockResponse);
    });
  });

  it('accepts a custom limit parameter', () => {
    const mockPushbox = mocks.mockPushbox();
    mockRequest.query = {
      index: 2,
      limit: 12,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/device/commands'
    );

    return runTest(route, mockRequest).then(() => {
      assert.equal(mockPushbox.retrieve.callCount, 1, 'pushbox was called');
      assert.calledWithExactly(mockPushbox.retrieve, uid, deviceId, 12, 2);
    });
  });

  it('relays errors from the pushbox service', () => {
    const mockPushbox = mocks.mockPushbox({
      retrieve() {
        const error = new Error();
        error.message = 'Boom!';
        error.statusCode = 500;
        return Promise.reject(error);
      },
    });
    mockRequest.query = {
      index: 2,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/device/commands'
    );

    return runTest(route, mockRequest).then(
      () => {
        assert.ok(false, 'should not go here');
      },
      (err) => {
        assert.equal(err.message, 'Boom!');
        assert.equal(err.statusCode, 500);
      }
    );
  });

  it('emits a `retrieved` event for each command fetched', () => {
    const mockResponse = {
      last: true,
      index: 4,
      messages: [
        {
          index: 3,
          data: {
            sender: '99999999999999999999999999999999',
            command: 'three',
            payload: {},
          },
        },
        {
          index: 4,
          data: {
            sender: '88888888888888888888888888888888',
            command: 'four',
            payload: {},
          },
        },
      ],
    };
    const mockPushbox = mocks.mockPushbox();
    mockPushbox.retrieve = sinon.spy(() => Promise.resolve(mockResponse));

    mockRequest.query = {
      index: 2,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/device/commands'
    );

    const validationSchema = route.options.validate.query;
    mockRequest.query = validationSchema.validate(mockRequest.query).value;
    assert.ok(mockRequest.query);
    return runTest(route, mockRequest).then((response) => {
      assert.callCount(mockLog.info, 2);
      assert.calledWithExactly(
        mockLog.info.getCall(0),
        'device.command.retrieved',
        {
          uid,
          target: deviceId,
          index: 3,
          sender: '99999999999999999999999999999999',
          command: 'three',
        }
      );
      assert.calledWithExactly(
        mockLog.info.getCall(1),
        'device.command.retrieved',
        {
          uid,
          target: deviceId,
          index: 4,
          sender: '88888888888888888888888888888888',
          command: 'four',
        }
      );
    });
  });

  it('supports feature-flag for oauth devices', async () => {
    const mockPushbox = mocks.mockPushbox();
    const route = getRoute(
      makeRoutes({
        config: { oauth: { deviceCommandsEnabled: false } },
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/device/commands'
    );
    mockRequest.auth.credentials.refreshTokenId = 'aaabbbccc';

    try {
      await route.handler(mockRequest);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.output.statusCode, 503);
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
    }
    assert.ok(mockPushbox.retrieve.notCalled);
  });

  it('throws when a device id is not found', async () => {
    const mockPushbox = mocks.mockPushbox();
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/device/commands'
    );

    mockRequest.auth.credentials.refreshTokenId = 'aaabbbccc';
    mockRequest.auth.credentials.deviceId = undefined;
    mockRequest.auth.credentials.client = { name: 'fx ios' };
    mockRequest.auth.credentials.uaBrowser = 'Firefox iOS';

    try {
      await route.handler(mockRequest);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.output.statusCode, 400);
      assert.equal(err.errno, error.ERRNO.DEVICE_UNKNOWN);
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'device.command.deviceIdMissing',
        {
          clientId: '',
          clientName: 'fx ios',
          uaBrowser: 'Firefox iOS',
          uaBrowserVersion: undefined,
          uaOS: undefined,
          uaOSVersion: undefined,
        }
      );
    }
    assert.ok(mockPushbox.retrieve.notCalled);
  });
});

describe('/account/devices/invoke_command', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const command = 'bogusCommandName';
  const mockDevices = [
    {
      id: 'bogusid1',
      type: 'mobile',
      availableCommands: {
        bogusCommandName: 'bogusData',
        'https://identity.mozilla.com/cmd/open-uri': 'morebogusdata',
      },
    },
    {
      id: 'bogusid2',
      type: 'desktop',
    },
  ];
  let mockLog, mockDB, mockRequest, mockPush, mockCustoms;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      devices: mockDevices,
    });
    mockRequest = mocks.mockRequest({
      log: mockLog,
      credentials: {
        uid: uid,
        deviceId: 'bogusid2',
      },
    });
    mockPush = mocks.mockPush();
    mockCustoms = mocks.mockCustoms();
  });

  it('stores commands using the pushbox service and sends a notification', () => {
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(async () => ({ index: 15 })),
    });
    const target = 'bogusid1';
    const sender = 'bogusid2';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command,
      payload,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(route, mockRequest).then(() => {
      assert.equal(mockDB.device.callCount, 1, 'device record was fetched');
      assert.calledWithExactly(mockDB.device, uid, target);

      assert.equal(mockPushbox.store.callCount, 1, 'pushbox was called');
      assert.calledWithExactly(
        mockPushbox.store,
        uid,
        target,
        {
          command,
          payload,
          sender,
        },
        undefined
      );

      assert.equal(
        mockPush.notifyCommandReceived.callCount,
        1,
        'notifyCommandReceived was called'
      );
      assert.calledWithExactly(
        mockPush.notifyCommandReceived,
        uid,
        mockDevices[0],
        command,
        sender,
        15,
        'https://public.url/v1/account/device/commands?index=15&limit=1',
        undefined
      );
    });
  });

  it('uses a default TTL for send-tab commands with no TTL specified', () => {
    const THIRTY_DAYS_IN_SECS = 30 * 24 * 3600;
    const commandSendTab = 'https://identity.mozilla.com/cmd/open-uri';
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(async () => ({ index: 15 })),
    });
    const target = 'bogusid1';
    const sender = 'bogusid2';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command: commandSendTab,
      payload,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(route, mockRequest).then(() => {
      assert.equal(mockPushbox.store.callCount, 1, 'pushbox was called');
      assert.calledWithExactly(
        mockPushbox.store,
        uid,
        target,
        {
          command: commandSendTab,
          payload,
          sender,
        },
        THIRTY_DAYS_IN_SECS
      );

      assert.equal(
        mockPush.notifyCommandReceived.callCount,
        1,
        'notifyCommandReceived was called'
      );
      assert.calledWithExactly(
        mockPush.notifyCommandReceived,
        uid,
        mockDevices[0],
        commandSendTab,
        sender,
        15,
        'https://public.url/v1/account/device/commands?index=15&limit=1',
        THIRTY_DAYS_IN_SECS
      );
    });
  });

  it('rejects if sending to an unknown device', () => {
    const mockPushbox = mocks.mockPushbox();
    const target = 'unknowndevice';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command,
      payload,
    };
    mockDB.device = sinon.spy(() => Promise.reject(error.unknownDevice()));
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(
      route,
      mockRequest,
      () => {
        assert(false, 'should have thrown');
      },
      (err) => {
        assert.equal(err.errno, 123, 'Unknown device');
        assert.equal(mockPushbox.store.callCount, 0, 'pushbox was not called');
        assert.equal(
          mockPush.notifyCommandReceived.callCount,
          0,
          'notifyMessageReceived was not called'
        );
      }
    );
  });

  it('rejects if invoking an unavailable command', () => {
    const mockPushbox = mocks.mockPushbox();
    const target = 'bogusid1';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command: 'nonexistentCommandName',
      payload,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(
      route,
      mockRequest,
      () => {
        assert(false, 'should have thrown');
      },
      (err) => {
        assert.equal(err.errno, 157, 'unavailable device command');
        assert.equal(mockPushbox.store.callCount, 0, 'pushbox was not called');
        assert.equal(
          mockPush.notifyCommandReceived.callCount,
          0,
          'notifyMessageReceived was not called'
        );
      }
    );
  });

  it('relays errors from the pushbox service', () => {
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(() => {
        const error = new Error();
        error.message = 'Boom!';
        error.statusCode = 500;
        return Promise.reject(error);
      }),
    });
    const target = 'bogusid1';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command,
      payload,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(
      route,
      mockRequest,
      () => {
        assert(false, 'should have thrown');
      },
      (err) => {
        assert.equal(mockPushbox.store.callCount, 1, 'pushbox was called');
        assert.equal(err.message, 'Boom!');
        assert.equal(err.statusCode, 500);
        assert.equal(
          mockPush.notifyCommandReceived.callCount,
          0,
          'notifyMessageReceived was not called'
        );
      }
    );
  });

  it('emits `invoked` and `notified` events when successfully accepting a command', () => {
    const commandSendTab = 'https://identity.mozilla.com/cmd/open-uri';
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(async () => ({ index: 15 })),
    });
    const target = 'bogusid1';
    const sender = 'bogusid2';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command: commandSendTab,
      payload,
    };
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(route, mockRequest).then((response) => {
      assert.ok(response.enqueued);
      assert.ok(response.notified);
      assert.isUndefined(response.notifyError);
      assert.callCount(mockLog.info, 2);
      const expectedMetricsTags = {
        uid,
        target,
        index: 15,
        sender,
        command: commandSendTab,
        senderOS: undefined,
        senderType: undefined,
        targetOS: undefined,
        targetType: 'mobile',
      };
      assert.calledWithExactly(
        mockLog.info.getCall(0),
        'device.command.invoked',
        expectedMetricsTags
      );
      assert.calledWithExactly(
        mockLog.info.getCall(1),
        'device.command.notified',
        expectedMetricsTags
      );
    });
  });

  it('emits `invoked` and `notifyError` events when push fails', () => {
    const commandSendTab = 'https://identity.mozilla.com/cmd/open-uri';
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(async () => ({ index: 15 })),
    });
    const target = 'bogusid1';
    const sender = 'bogusid2';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command: commandSendTab,
      payload,
    };
    const mockPushError = new Error('a push failure');
    mockPushError.errCode = 'expiredCallback';
    mockPush.notifyCommandReceived = sinon.spy(async () => {
      throw mockPushError;
    });
    const route = getRoute(
      makeRoutes({
        customs: mockCustoms,
        log: mockLog,
        push: mockPush,
        pushbox: mockPushbox,
        db: mockDB,
      }),
      '/account/devices/invoke_command'
    );

    return runTest(route, mockRequest).then((response) => {
      assert.ok(response.enqueued);
      assert.notOk(response.notified);
      assert.equal(response.notifyError, 'expiredCallback');
      assert.callCount(mockPush.notifyCommandReceived, 1);
      assert.callCount(mockLog.info, 2);
      const expectedMetricsTags = {
        uid,
        target,
        index: 15,
        sender,
        command: commandSendTab,
        senderOS: undefined,
        senderType: undefined,
        targetOS: undefined,
        targetType: 'mobile',
      };
      assert.calledWithExactly(
        mockLog.info.getCall(0),
        'device.command.invoked',
        expectedMetricsTags
      );
      assert.calledWithExactly(
        mockLog.info.getCall(1),
        'device.command.notifyError',
        { err: mockPushError, ...expectedMetricsTags }
      );
    });
  });

  it('supports feature-flag for oauth devices', async () => {
    const mockPushbox = mocks.mockPushbox();
    const route = getRoute(
      makeRoutes({
        config: { oauth: { deviceCommandsEnabled: false } },
        customs: mockCustoms,
        log: mockLog,
        pushbox: mockPushbox,
      }),
      '/account/devices/invoke_command'
    );
    mockRequest.auth.credentials.refreshTokenId = 'aaabbbccc';

    try {
      await route.handler(mockRequest);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.output.statusCode, 503);
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
    }
    assert.ok(mockPushbox.store.notCalled);
  });
});

describe('/account/device/destroy', () => {
  let uid;
  let deviceId;
  let deviceId2;
  let mockDevices;
  let mockLog;
  let mockDB;
  let mockPush;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    deviceId = crypto.randomBytes(16).toString('hex');
    deviceId2 = crypto.randomBytes(16).toString('hex');
    mockDevices = mocks.mockDevices({ deviceId });
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB();
    mockPush = mocks.mockPush();
  });

  it('should destory the device record', () => {
    const mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid,
      },
      log: mockLog,
      devices: [deviceId, deviceId2],
      payload: {
        id: deviceId,
      },
    });
    const accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices,
      log: mockLog,
      push: mockPush,
    });
    const route = getRoute(accountRoutes, '/account/device/destroy');

    return runTest(route, mockRequest, () => {
      assert.equal(mockDevices.destroy.callCount, 1);
      assert.equal(mockDevices.destroy.firstCall.args[0], mockRequest);
      assert.equal(mockDevices.destroy.firstCall.args[1], deviceId);
    });
  });
});

describe('/account/devices', () => {
  it('should return the devices list (translated)', () => {
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex'),
    };
    const unnamedDevice = {
      id: '00000000000000000000000000000000',
      sessionTokenId: crypto.randomBytes(16).toString('hex'),
      lastAccessTime: EARLIEST_SANE_TIMESTAMP,
    };
    const mockRequest = mocks.mockRequest({
      acceptLanguage: 'en;q=0.5, fr;q=0.51',
      credentials,
      devices: [
        {
          id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          name: 'current session',
          type: 'mobile',
          sessionTokenId: credentials.id,
          lastAccessTime: Date.now(),
        },
        {
          id: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          name: 'has no type',
          sessionTokenId: crypto.randomBytes(16).toString('hex'),
          lastAccessTime: 1,
        },
        {
          id: 'cccccccccccccccccccccccccccccccc',
          name: 'has device type',
          sessionTokenId: crypto.randomBytes(16).toString('hex'),
          uaDeviceType: 'wibble',
          lastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
          location: {
            city: 'Bournemouth',
            state: 'England',
            stateCode: 'EN',
            country: 'United Kingdom',
            countryCode: 'GB',
          },
        },
        unnamedDevice,
      ],
      payload: {},
    });
    const mockDB = mocks.mockDB();
    const mockDevices = mocks.mockDevices();
    const log = mocks.mockLog();
    const accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices,
      log,
    });
    const route = getRoute(accountRoutes, '/account/devices');

    return runTest(route, mockRequest, (response) => {
      const now = Date.now();

      assert.ok(Array.isArray(response), 'response is array');
      assert.equal(response.length, 4, 'response contains 4 items');

      assert.equal(response[0].name, 'current session');
      assert.equal(response[0].type, 'mobile');
      assert.equal(response[0].sessionToken, undefined);
      assert.equal(response[0].isCurrentDevice, true);
      assert.ok(
        response[0].lastAccessTime > now - 10000 &&
          response[0].lastAccessTime <= now
      );
      assert.equal(
        response[0].lastAccessTimeFormatted,
        'il y a quelques secondes'
      );
      assert.equal(response[0].approximateLastAccessTime, undefined);
      assert.equal(response[0].approximateLastAccessTimeFormatted, undefined);
      assert.deepEqual(response[0].location, {});

      assert.equal(response[1].name, 'has no type');
      assert.equal(response[1].type, 'desktop');
      assert.equal(response[1].sessionToken, undefined);
      assert.equal(response[1].isCurrentDevice, false);
      assert.equal(response[1].lastAccessTime, 1);
      assert.equal(
        response[1].lastAccessTimeFormatted,
        moment(1).locale('fr').fromNow()
      );
      assert.equal(
        response[1].approximateLastAccessTime,
        EARLIEST_SANE_TIMESTAMP
      );
      assert.equal(
        response[1].approximateLastAccessTimeFormatted,
        moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow()
      );
      assert.deepEqual(response[1].location, {});

      assert.equal(response[2].name, 'has device type');
      assert.equal(response[2].type, 'wibble');
      assert.equal(response[2].isCurrentDevice, false);
      assert.equal(response[2].lastAccessTime, EARLIEST_SANE_TIMESTAMP - 1);
      assert.equal(
        response[2].lastAccessTimeFormatted,
        moment(EARLIEST_SANE_TIMESTAMP - 1)
          .locale('fr')
          .fromNow()
      );
      assert.equal(
        response[2].approximateLastAccessTime,
        EARLIEST_SANE_TIMESTAMP
      );
      assert.equal(
        response[2].approximateLastAccessTimeFormatted,
        moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow()
      );
      assert.deepEqual(response[2].location, {
        country: 'Royaume-Uni',
      });

      assert.equal(response[3].name, '');
      assert.equal(response[3].lastAccessTime, EARLIEST_SANE_TIMESTAMP);
      assert.equal(
        response[3].lastAccessTimeFormatted,
        moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow()
      );
      assert.equal(response[3].approximateLastAccessTime, undefined);
      assert.equal(response[3].approximateLastAccessTimeFormatted, undefined);

      assert.equal(log.error.callCount, 0, 'log.error was not called');

      assert.equal(mockDB.devices.callCount, 0, 'db.devices was not called');

      assert.equal(
        mockDevices.synthesizeName.callCount,
        1,
        'mockDevices.synthesizeName was called once'
      );
      assert.equal(
        mockDevices.synthesizeName.args[0].length,
        1,
        'mockDevices.synthesizeName was passed one argument'
      );
      assert.equal(
        mockDevices.synthesizeName.args[0][0],
        unnamedDevice,
        'mockDevices.synthesizeName was passed unnamed device'
      );
    });
  });

  it('should return the devices list (not translated)', () => {
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex'),
    };
    const request = mocks.mockRequest({
      acceptLanguage: 'en-US,en;q=0.5',
      credentials,
      devices: [
        {
          id: '00000000000000000000000000000000',
          name: 'wibble',
          sessionTokenId: credentials.id,
          lastAccessTime: Date.now(),
          location: {
            city: 'Bournemouth',
            state: 'England',
            stateCode: 'EN',
            country: 'United Kingdom',
            countryCode: 'GB',
          },
        },
      ],
      payload: {},
    });
    const db = mocks.mockDB();
    const devices = mocks.mockDevices();
    const log = mocks.mockLog();
    const accountRoutes = makeRoutes({ db, devices, log });
    const route = getRoute(accountRoutes, '/account/devices');

    return runTest(route, request, (response) => {
      assert.equal(response.length, 1);
      assert.equal(response[0].name, 'wibble');
      assert.deepEqual(response[0].location, {
        city: 'Bournemouth',
        country: 'United Kingdom',
        state: 'England',
        stateCode: 'EN',
      });
      assert.equal(log.error.callCount, 0, 'log.error was not called');
    });
  });

  it('should allow returning a lastAccessTime of 0', () => {
    const route = getRoute(makeRoutes({}), '/account/devices');
    const res = [
      {
        id: crypto.randomBytes(16).toString('hex'),
        isCurrentDevice: true,
        lastAccessTime: 0,
        name: 'test',
        type: 'test',
        pushEndpointExpired: false,
      },
    ];
    Joi.assert(res, route.options.response.schema);
  });

  it('should allow returning approximateLastAccessTime', () => {
    const route = getRoute(makeRoutes({}), '/account/devices');
    Joi.assert(
      [
        {
          id: crypto.randomBytes(16).toString('hex'),
          isCurrentDevice: true,
          lastAccessTime: 0,
          approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP,
          approximateLastAccessTimeFormatted: '',
          name: 'test',
          type: 'test',
          pushEndpointExpired: false,
        },
      ],
      route.options.response.schema
    );
  });

  it('should not allow returning approximateLastAccessTime < EARLIEST_SANE_TIMESTAMP', () => {
    const route = getRoute(makeRoutes({}), '/account/devices');
    assert.throws(() =>
      Joi.assert(
        [
          {
            id: crypto.randomBytes(16).toString('hex'),
            isCurrentDevice: true,
            lastAccessTime: 0,
            approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
            approximateLastAccessTimeFormatted: '',
            name: 'test',
            type: 'test',
            pushEndpointExpired: false,
          },
        ],
        route.config.response.schema
      )
    );
  });

  it('should improve the lastAccessTime accuracy using OAuth data', () => {
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex'),
    };
    const now = Date.now();
    const yesterday = now - 864e5;
    const refreshTokenId = hexString(32);
    const request = mocks.mockRequest({
      acceptLanguage: 'en-US,en;q=0.5',
      credentials,
      devices: [
        {
          id: '00000000000000000000000000000000',
          name: 'wibble',
          sessionTokenId: credentials.id,
          lastAccessTime: yesterday,
          refreshTokenId,
        },
      ],
      payload: {},
    });
    const db = mocks.mockDB();
    const log = mocks.mockLog();
    const oauth = {
      getRefreshTokensByUid: sinon.spy(async () => {
        return [
          {
            tokenId: Buffer.from(refreshTokenId, 'hex'),
            lastUsedAt: new Date(now),
          },
          // This extra refreshToken should be ignored when listing devices,
          // since it doesn't have a corresponding device record.
          {
            tokenId: crypto.randomBytes(16),
            lastUsedAt: new Date(now),
          },
        ];
      }),
    };
    const devices = mocks.mockDevices();
    const accountRoutes = makeRoutes({ db, oauth, devices, log });
    const route = getRoute(accountRoutes, '/account/devices');

    return runTest(route, request, (response) => {
      assert.equal(response[0].lastAccessTime, now);
    });
  });

  it('supports feature-flag for oauth devices', async () => {
    const route = getRoute(
      makeRoutes({
        config: { oauth: { deviceCommandsEnabled: false } },
      }),
      '/account/devices'
    );
    const mockRequest = mocks.mockRequest({
      credentials: {
        refreshTokenId: 'def123abc789',
      },
    });

    try {
      await route.handler(mockRequest);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.output.statusCode, 503);
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
    }
  });

  it('only updates lastAccessTime for non-refresh token request', async () => {
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      refreshTokenId: crypto.randomBytes(16).toString('hex'),
    };

    const mockRequest = mocks.mockRequest({
      acceptLanguage: 'en;q=0.5, fr;q=0.51',
      credentials,
      devices: [
        {
          id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          name: 'current session',
          type: 'mobile',
          refreshTokenId: credentials.refreshTokenId,
          lastAccessTime: Date.now(),
        },
      ],
      payload: {},
    });
    const mockDB = mocks.mockDB();
    const mockDevices = mocks.mockDevices();
    const log = mocks.mockLog();
    const accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices,
      log,
    });
    const route = getRoute(accountRoutes, '/account/devices');

    return runTest(route, mockRequest, () => {
      assert.notCalled(mockDB.touchSessionToken);
    });
  });

  it('filters out idle devices based on a query parameter', async () => {
    const now = Date.now();
    const FIVE_DAYS_AGO = now - 1000 * 60 * 60 * 24 * 5;
    const ONE_DAY_AGO = now - 1000 * 60 * 60 * 24;
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex'),
    };

    const mockRequest = mocks.mockRequest({
      acceptLanguage: 'en;q=0.5, fr;q=0.51',
      credentials,
      devices: [
        {
          id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          name: 'current session',
          type: 'mobile',
          sessionTokenId: credentials.id,
          lastAccessTime: now,
        },
        {
          id: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          name: 'has no type',
          sessionTokenId: crypto.randomBytes(16).toString('hex'),
          lastAccessTime: FIVE_DAYS_AGO,
        },
      ],
      payload: {},
      query: {
        filterIdleDevicesTimestamp: ONE_DAY_AGO,
      },
    });
    const mockDB = mocks.mockDB();
    const mockDevices = mocks.mockDevices();
    const log = mocks.mockLog();
    const accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices,
      log,
    });
    const route = getRoute(accountRoutes, '/account/devices');

    return runTest(route, mockRequest, (response) => {
      assert.ok(Array.isArray(response), 'response is array');
      assert.equal(
        response.length,
        1,
        'response contains 1 item, the other was filtered'
      );

      assert.equal(response[0].name, 'current session');
      assert.equal(response[0].type, 'mobile');
      assert.equal(response[0].sessionToken, undefined);
      assert.equal(response[0].isCurrentDevice, true);
      assert.ok(response[0].lastAccessTime > ONE_DAY_AGO);
      assert.calledWithExactly(mockDB.touchSessionToken, credentials, {}, true);
    });
  });
});

describe('/account/sessions', () => {
  const now = Date.now();
  const times = [
    now,
    now + 1,
    now + 2,
    now + 3,
    now + 4,
    now + 5,
    now + 6,
    now + 7,
    now + 8,
  ];
  const tokenIds = [
    '00000000000000000000000000000000',
    '11111111111111111111111111111111',
    '22222222222222222222222222222222',
    '33333333333333333333333333333333',
  ];
  const sessions = [
    {
      id: tokenIds[0],
      uid: 'qux',
      createdAt: times[0],
      lastAccessTime: times[1],
      uaBrowser: 'Firefox',
      uaBrowserVersion: '50.0',
      uaOS: 'Windows',
      uaOSVersion: '10',
      uaDeviceType: null,
      deviceId: null,
      deviceCreatedAt: times[2],
      deviceAvailableCommands: { foo: 'bar' },
      deviceCallbackURL: 'https://push.services.mozilla.com',
      deviceCallbackPublicKey: 'publicKey',
      deviceCallbackAuthKey: 'authKey',
      deviceCallbackIsExpired: false,
      location: {
        city: 'Toronto',
        country: 'Canada',
        countryCode: 'CA',
        state: 'Ontario',
        stateCode: 'ON',
      },
    },
    {
      id: tokenIds[1],
      uid: 'wibble',
      createdAt: times[3],
      lastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
      uaBrowser: 'Nightly',
      uaBrowserVersion: null,
      uaOS: 'Android',
      uaOSVersion: '6',
      uaDeviceType: 'mobile',
      deviceId: 'dddddddddddddddddddddddddddddddd',
      deviceCreatedAt: times[4],
      deviceAvailableCommands: { foo: 'bar' },
      deviceCallbackURL: null,
      deviceCallbackPublicKey: null,
      deviceCallbackAuthKey: null,
      deviceCallbackIsExpired: false,
      location: {
        city: 'Bournemouth',
        country: 'United Kingdom',
        countryCode: 'GB',
        state: 'England',
        stateCode: 'EN',
      },
    },
    {
      id: tokenIds[2],
      uid: 'blee',
      createdAt: times[5],
      lastAccessTime: EARLIEST_SANE_TIMESTAMP,
      uaBrowser: null,
      uaBrowserVersion: '50',
      uaOS: null,
      uaOSVersion: '10',
      uaDeviceType: 'tablet',
      deviceId: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      deviceCreatedAt: times[6],
      deviceAvailableCommands: {},
      deviceCallbackURL: 'https://push.services.mozilla.com',
      deviceCallbackPublicKey: 'publicKey',
      deviceCallbackAuthKey: 'authKey',
      deviceCallbackIsExpired: false,
      location: null,
    },
    {
      id: tokenIds[3],
      uid: 'blee',
      createdAt: times[7],
      lastAccessTime: 1,
      uaBrowser: null,
      uaBrowserVersion: '50',
      uaOS: null,
      uaOSVersion: '10',
      uaDeviceType: 'tablet',
      deviceId: 'ffffffffffffffffffffffffffffffff',
      deviceCreatedAt: times[8],
      deviceCallbackURL: 'https://push.services.mozilla.com',
      deviceCallbackPublicKey: 'publicKey',
      deviceCallbackAuthKey: 'authKey',
      deviceCallbackIsExpired: false,
      location: null,
    },
  ];
  const db = mocks.mockDB({ sessions });
  const accountRoutes = makeRoutes({ db });
  const request = mocks.mockRequest({
    acceptLanguage: 'xx',
    credentials: {
      id: tokenIds[0],
      uid: hexString(16),
    },
    payload: {},
  });

  it('should list account sessions', () => {
    const route = getRoute(accountRoutes, '/account/sessions');

    return runTest(route, request, (result) => {
      assert.ok(Array.isArray(result));
      assert.equal(result.length, 4);
      const noFormattedTime = ({ createdTimeFormatted, ...rest }) => rest;
      assert.deepEqual(
        result.map((x) => noFormattedTime(x)),
        [
          {
            deviceId: null,
            deviceName: 'Firefox 50, Windows 10',
            deviceType: 'desktop',
            deviceAvailableCommands: { foo: 'bar' },
            deviceCallbackURL: 'https://push.services.mozilla.com',
            deviceCallbackPublicKey: 'publicKey',
            deviceCallbackAuthKey: 'authKey',
            deviceCallbackIsExpired: false,
            id: '00000000000000000000000000000000',
            isCurrentDevice: true,
            isDevice: false,
            lastAccessTime: times[1],
            lastAccessTimeFormatted: moment(times[1]).locale('en').fromNow(),
            createdTime: times[0],
            os: 'Windows',
            userAgent: 'Firefox 50',
            location: {
              city: 'Toronto',
              country: 'Canada',
              state: 'Ontario',
              stateCode: 'ON',
            },
          },
          {
            deviceId: 'dddddddddddddddddddddddddddddddd',
            deviceName: 'Nightly, Android 6',
            deviceType: 'mobile',
            deviceAvailableCommands: { foo: 'bar' },
            deviceCallbackURL: null,
            deviceCallbackPublicKey: null,
            deviceCallbackAuthKey: null,
            deviceCallbackIsExpired: false,
            id: '11111111111111111111111111111111',
            isCurrentDevice: false,
            isDevice: true,
            lastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
            lastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP - 1)
              .locale('en')
              .fromNow(),
            approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP,
            approximateLastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP)
              .locale('en')
              .fromNow(),
            createdTime: times[3],
            os: 'Android',
            userAgent: 'Nightly',
            location: {
              city: 'Bournemouth',
              country: 'United Kingdom',
              state: 'England',
              stateCode: 'EN',
            },
          },
          {
            deviceId: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            deviceName: '',
            deviceType: 'tablet',
            deviceAvailableCommands: {},
            deviceCallbackURL: 'https://push.services.mozilla.com',
            deviceCallbackPublicKey: 'publicKey',
            deviceCallbackAuthKey: 'authKey',
            deviceCallbackIsExpired: false,
            id: '22222222222222222222222222222222',
            isCurrentDevice: false,
            isDevice: true,
            lastAccessTime: EARLIEST_SANE_TIMESTAMP,
            lastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP)
              .locale('en')
              .fromNow(),
            createdTime: times[5],
            os: null,
            userAgent: '',
            location: {},
          },
          {
            deviceId: 'ffffffffffffffffffffffffffffffff',
            deviceName: '',
            deviceType: 'tablet',
            deviceAvailableCommands: null,
            deviceCallbackURL: 'https://push.services.mozilla.com',
            deviceCallbackPublicKey: 'publicKey',
            deviceCallbackAuthKey: 'authKey',
            deviceCallbackIsExpired: false,
            id: '33333333333333333333333333333333',
            isCurrentDevice: false,
            isDevice: true,
            lastAccessTime: 1,
            lastAccessTimeFormatted: moment(1).locale('en').fromNow(),
            approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP,
            approximateLastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP)
              .locale('en')
              .fromNow(),
            createdTime: times[7],
            os: null,
            userAgent: '',
            location: {},
          },
        ]
      );
    });
  });
});
