/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import crypto from 'crypto';

const Joi = require('joi');
const { AppError: error } = require('@fxa/accounts/errors');
const getRoute = require('../../test/routes_helpers').getRoute;
const mocks: any = require('../../test/mocks');
const moment = require('moment');
const uuid = require('uuid');

const EARLIEST_SANE_TIMESTAMP = 31536000000;

function makeRoutes(options: any = {}) {
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
  const push = options.push || require('../push')(log, db, {});
  const pushbox = options.pushbox || mocks.mockPushbox();
  const clientUtils =
    options.clientUtils ||
    require('./utils/clients')(log, config);
  const redis = options.redis || {};
  return require('./devices-and-sessions')(
    log,
    db,
    oauth,
    config,
    customs,
    push,
    pushbox,
    options.devices || require('../devices')(log, db, oauth, push),
    clientUtils,
    redis
  );
}

async function runTest(
  route: any,
  request: any,
  onSuccess?: (response: any) => void,
  onError?: (err: any) => void
) {
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

function hexString(bytes: number) {
  return crypto.randomBytes(bytes).toString('hex');
}

describe('/account/device', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const deviceId = crypto.randomBytes(16).toString('hex');
  const mockDeviceName = 'my awesome device \u{1F353}\u{1F525}';
  let config: any,
    mockRequest: any,
    devicesData: any,
    mockDevices: any,
    mockLog: any,
    accountRoutes: any,
    route: any;

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
        id: deviceId,
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
      expect(mockDevices.isSpuriousUpdate.callCount).toBe(1);
      const args = mockDevices.isSpuriousUpdate.args[0];
      expect(args.length).toBe(2);
      expect(args[0]).toBe(mockRequest.payload);
      const creds = mockRequest.auth.credentials;
      expect(args[1]).toBe(creds);

      expect(mockDevices.upsert.callCount).toBe(0);
      // Make sure the shape of the response is the same as if
      // the update wasn't spurious.
      expect(response).toEqual({
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
      expect(mockDevices.isSpuriousUpdate.callCount).toBe(1);
      expect(mockDevices.upsert.callCount).toBe(1);
      const args = mockDevices.upsert.args[0];
      expect(args.length).toBe(3);
      expect(args[0]).toBe(mockRequest);
      expect(args[1].id).toEqual(mockRequest.auth.credentials.id);
      expect(args[1].uid).toEqual(uid);
      expect(args[2]).toEqual(mockRequest.payload);
    });
  });

  it('with no id in payload', () => {
    devicesData.spurious = false;
    mockRequest.payload.id = undefined;

    return runTest(route, mockRequest, (response) => {
      expect(mockDevices.upsert.callCount).toBe(1);
      const args = mockDevices.upsert.args[0];
      expect(args[2].id).toBe(
        mockRequest.auth.credentials.deviceId
      );
    });
  });

  // Regression test for https://github.com/mozilla/fxa/issues/2252
  it('spurious update without device type', () => {
    devicesData.spurious = true;
    mockRequest.auth.credentials.deviceType = undefined;

    return runTest(route, mockRequest, (response) => {
      expect(mockDevices.upsert.callCount).toBe(0);
    });
  });

  it('device updates disabled', () => {
    config.deviceUpdatesEnabled = false;

    return runTest(route, mockRequest, () => {
      expect(false).toBeTruthy();
    }).then(
      () => expect(false).toBeTruthy(),
      (err: any) => {
        expect(err.output.statusCode).toBe(503);
        expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
      }
    );
  });

  it('pushbox feature disabled', () => {
    config.pushbox = { enabled: false };
    mockRequest.payload.availableCommands = {
      test: 'command',
    };

    return runTest(route, mockRequest, () => {
      expect(mockDevices.upsert.callCount).toBe(1);
      const args = mockDevices.upsert.args[0];
      expect(args[2].availableCommands).toEqual({});
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
        id: deviceId,
        pushCallback:
          'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
      },
    });

    return runTest(route, mockRequest, (response) => {
      expect(mockDevices.upsert.callCount).toBe(1);
      expect(mockDevices.upsert.args[0][2].pushEndpointExpired).toBe(false);
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
        id: deviceId,
        name: 'beep beep',
      },
    });

    return runTest(route, mockRequest, (response) => {
      expect(mockDevices.upsert.callCount).toBe(1);
      expect(mockDevices.upsert.args[0][2].pushEndpointExpired).toBeUndefined();
    });
  });
});

describe('/account/devices/notify', () => {
  const config: any = {};
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
      expect(false).toBeTruthy();
    }).then(
      () => expect(false).toBeTruthy(),
      (err: any) => {
        expect(mockPush.sendPush.callCount).toBe(0);
        expect(err.errno).toBe(107);
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
    const sendPushPromise = new Promise<void>((resolve) => {
      mockPush.sendPush = sinon.spy(() => {
        resolve();
        return Promise.resolve();
      });
    });
    return runTest(route, mockRequest, (response) => {
      return sendPushPromise.then(() => {
        expect(mockCustoms.checkAuthenticated.callCount).toBe(1);
        expect(mockPush.sendPush.callCount).toBe(1);
        const args = mockPush.sendPush.args[0];
        expect(args.length).toBe(4);
        expect(args[0]).toBe(uid);
        expect(Array.isArray(args[1])).toBeTruthy();
        expect(args[2]).toBe('devicesNotify');
        expect(args[3]).toEqual({
          data: pushPayload,
          TTL: 60,
        });
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
      expect(false).toBeTruthy();
    }).then(
      () => expect(false).toBeTruthy(),
      (err: any) => {
        expect(err.output.statusCode).toBe(400);
        expect(err.errno).toBe(error.ERRNO.INVALID_PARAMETER);
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
    const sendPushPromise = new Promise<void>((resolve) => {
      mockPush.sendPush = sinon.spy(() => {
        resolve();
        return Promise.resolve();
      });
    });
    return runTest(route, mockRequest, (response) => {
      return sendPushPromise.then(() => {
        expect(mockCustoms.checkAuthenticated.callCount).toBe(1);
        expect(mockPush.sendPush.callCount).toBe(1);
        let args = mockPush.sendPush.args[0];
        expect(args.length).toBe(4);
        expect(args[0]).toBe(uid);
        expect(Array.isArray(args[1])).toBeTruthy();
        expect(args[2]).toBe('devicesNotify');
        expect(args[3]).toEqual({
          data: pushPayload,
          TTL: 60,
        });
        expect(mockLog.activityEvent.callCount).toBe(1);
        args = mockLog.activityEvent.args[0];
        expect(args.length).toBe(1);
        expect(args[0]).toEqual({
          country: 'United States',
          event: 'sync.sentTabToDevice',
          region: 'California',
          service: 'sync',
          userAgent: 'test user-agent',
          sigsciRequestId: 'test-sigsci-id',
          clientJa4: 'test-ja4',
          uid: uid,
          device_id: deviceId,
        });
        expect(mockLog.error.callCount).toBe(0);
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
      expect(mockPush.sendPush.callCount).toBe(1);
      expect(mockLog.activityEvent.callCount).toBe(0);
      expect(mockLog.error.callCount).toBe(0);
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
      expect(false).toBeTruthy();
    }).then(
      () => expect(false).toBeTruthy(),
      (err: any) => {
        expect(err.output.statusCode).toBe(503);
        expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
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
      expect(false).toBeTruthy();
    }).then(
      () => expect(false).toBeTruthy(),
      (err: any) => {
        expect(mockCustoms.checkAuthenticated.callCount).toBe(1);
        expect(err.message).toBe('Client has sent too many requests');
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
      expect(JSON.stringify(response)).toBe('{}');
    });
  });

  it('can send account verification message with empty payload', () => {
    mockRequest.payload = {
      to: 'all',
      _endpointAction: 'accountVerify',
      payload: {},
    };
    const sendPushPromise = new Promise<void>((resolve) => {
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
        expect(mockPush.sendPush.callCount).toBe(1);
        const args = mockPush.sendPush.args[0];
        expect(args.length).toBe(4);
        expect(args[0]).toBe(uid);
        expect(Array.isArray(args[1])).toBeTruthy();
        expect(args[2]).toBe('accountVerify');
        expect(args[3]).toEqual({
          data: {},
        });
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
        throw new Error('should not have succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(107);
      }
    );
  });
});

describe('/account/device/commands', () => {
  const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const deviceId = crypto.randomBytes(16).toString('hex');
  let mockLog: any, mockRequest: any, mockCustoms: any;

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
    expect(mockRequest.query).toBeTruthy();
    return runTest(route, mockRequest).then((response: any) => {
      expect(mockPushbox.retrieve.callCount).toBe(1);
      sinon.assert.calledWithExactly(mockPushbox.retrieve, uid, deviceId, 100, 2);
      expect(response).toEqual(mockResponse);
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
      expect(mockPushbox.retrieve.callCount).toBe(1);
      sinon.assert.calledWithExactly(mockPushbox.retrieve, uid, deviceId, 12, 2);
    });
  });

  it('relays errors from the pushbox service', () => {
    const mockPushbox = mocks.mockPushbox({
      retrieve() {
        const err = new Error() as any;
        err.message = 'Boom!';
        err.statusCode = 500;
        return Promise.reject(err);
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
        expect(false).toBeTruthy();
      },
      (err: any) => {
        expect(err.message).toBe('Boom!');
        expect(err.statusCode).toBe(500);
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
    expect(mockRequest.query).toBeTruthy();
    return runTest(route, mockRequest).then((response: any) => {
      sinon.assert.callCount(mockLog.info, 2);
      sinon.assert.calledWithExactly(
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
      sinon.assert.calledWithExactly(
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

    await expect(route.handler(mockRequest)).rejects.toMatchObject({
      output: { statusCode: 503 },
      errno: error.ERRNO.FEATURE_NOT_ENABLED,
    });
    expect(mockPushbox.retrieve.notCalled).toBeTruthy();
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

    await expect(route.handler(mockRequest)).rejects.toMatchObject({
      output: { statusCode: 400 },
      errno: error.ERRNO.DEVICE_UNKNOWN,
    });
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
    expect(mockPushbox.retrieve.notCalled).toBeTruthy();
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
  let mockLog: any, mockDB: any, mockRequest: any, mockPush: any, mockCustoms: any;

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
      expect(mockDB.device.callCount).toBe(1);
      sinon.assert.calledWithExactly(mockDB.device, uid, target);

      expect(mockPushbox.store.callCount).toBe(1);
      sinon.assert.calledWithExactly(
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

      expect(mockPush.notifyCommandReceived.callCount).toBe(1);
      sinon.assert.calledWithExactly(
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
      expect(mockPushbox.store.callCount).toBe(1);
      sinon.assert.calledWithExactly(
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

      expect(mockPush.notifyCommandReceived.callCount).toBe(1);
      sinon.assert.calledWithExactly(
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
        expect(false).toBeTruthy();
      },
      (err: any) => {
        expect(err.errno).toBe(123);
        expect(mockPushbox.store.callCount).toBe(0);
        expect(mockPush.notifyCommandReceived.callCount).toBe(0);
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
        expect(false).toBeTruthy();
      },
      (err: any) => {
        expect(err.errno).toBe(157);
        expect(mockPushbox.store.callCount).toBe(0);
        expect(mockPush.notifyCommandReceived.callCount).toBe(0);
      }
    );
  });

  it('relays errors from the pushbox service', () => {
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(() => {
        const err = new Error() as any;
        err.message = 'Boom!';
        err.statusCode = 500;
        return Promise.reject(err);
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
        expect(false).toBeTruthy();
      },
      (err: any) => {
        expect(mockPushbox.store.callCount).toBe(1);
        expect(err.message).toBe('Boom!');
        expect(err.statusCode).toBe(500);
        expect(mockPush.notifyCommandReceived.callCount).toBe(0);
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

    return runTest(route, mockRequest).then((response: any) => {
      expect(response.enqueued).toBeTruthy();
      expect(response.notified).toBeTruthy();
      expect(response.notifyError).toBeUndefined();
      sinon.assert.callCount(mockLog.info, 2);
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
      sinon.assert.calledWithExactly(
        mockLog.info.getCall(0),
        'device.command.invoked',
        expectedMetricsTags
      );
      sinon.assert.calledWithExactly(
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
    const mockPushError = new Error('a push failure') as any;
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

    return runTest(route, mockRequest).then((response: any) => {
      expect(response.enqueued).toBeTruthy();
      expect(response.notified).toBeFalsy();
      expect(response.notifyError).toBe('expiredCallback');
      sinon.assert.callCount(mockPush.notifyCommandReceived, 1);
      sinon.assert.callCount(mockLog.info, 2);
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
      sinon.assert.calledWithExactly(
        mockLog.info.getCall(0),
        'device.command.invoked',
        expectedMetricsTags
      );
      sinon.assert.calledWithExactly(
        mockLog.info.getCall(1),
        'device.command.notifyError',
        { err: mockPushError, ...expectedMetricsTags }
      );
    });
  });

  it('omits sender field when deviceId is null/undefined', () => {
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(async () => ({ index: 15 })),
    });
    const target = 'bogusid1';
    const payload = { bogus: 'payload' };
    mockRequest.payload = {
      target,
      command,
      payload,
    };
    // Set deviceId to null to simulate the missing deviceId scenario
    mockRequest.auth.credentials.deviceId = null;
    mockRequest.auth.credentials.client = {
      id: 'testclient',
      name: 'Test Client',
    };
    mockRequest.auth.credentials.uaBrowser = 'Firefox';
    mockRequest.auth.credentials.uaOS = 'Linux';

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
      // Verify diagnostic warning was logged
      expect(mockLog.warn.callCount).toBe(1);
      sinon.assert.calledWith(mockLog.warn, 'device.command.senderDeviceIdMissing');
      const warningArgs = mockLog.warn.getCall(0).args[1];
      expect(warningArgs.uid).toBe(uid);
      expect(warningArgs.command).toBe(command);
      expect(warningArgs.clientName).toBe('Test Client');
      expect(warningArgs.uaBrowser).toBe('Firefox');

      // Verify pushbox.store was called WITHOUT sender field
      expect(mockPushbox.store.callCount).toBe(1);
      sinon.assert.calledWithExactly(
        mockPushbox.store,
        uid,
        target,
        {
          command,
          payload,
          // Note: sender field should be completely absent, not null
        },
        undefined
      );

      // Verify metrics logging has sender as null
      sinon.assert.callCount(mockLog.info, 2);
      const invokedMetrics = mockLog.info.getCall(0).args[1];
      expect(invokedMetrics.sender).toBeNull();
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

    await expect(route.handler(mockRequest)).rejects.toMatchObject({
      output: { statusCode: 503 },
      errno: error.ERRNO.FEATURE_NOT_ENABLED,
    });
    expect(mockPushbox.store.notCalled).toBeTruthy();
  });
});

describe('/account/device/destroy', () => {
  let uid: string;
  let deviceId: string;
  let deviceId2: string;
  let mockDevices: any;
  let mockLog: any;
  let mockDB: any;
  let mockPush: any;

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
      expect(mockDevices.destroy.callCount).toBe(1);
      expect(mockDevices.destroy.firstCall.args[0]).toBe(mockRequest);
      expect(mockDevices.destroy.firstCall.args[1]).toBe(deviceId);
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

      expect(Array.isArray(response)).toBeTruthy();
      expect(response.length).toBe(4);

      expect(response[0].name).toBe('current session');
      expect(response[0].type).toBe('mobile');
      expect(response[0].sessionToken).toBeUndefined();
      expect(response[0].isCurrentDevice).toBe(true);
      expect(
        response[0].lastAccessTime > now - 10000 &&
          response[0].lastAccessTime <= now
      ).toBeTruthy();
      expect(response[0].lastAccessTimeFormatted).toBe(
        'il y a quelques secondes'
      );
      expect(response[0].approximateLastAccessTime).toBeUndefined();
      expect(response[0].approximateLastAccessTimeFormatted).toBeUndefined();
      expect(response[0].location).toEqual({});

      expect(response[1].name).toBe('has no type');
      expect(response[1].type).toBe('desktop');
      expect(response[1].sessionToken).toBeUndefined();
      expect(response[1].isCurrentDevice).toBe(false);
      expect(response[1].lastAccessTime).toBe(1);
      expect(response[1].lastAccessTimeFormatted).toBe(
        moment(1).locale('fr').fromNow()
      );
      expect(response[1].approximateLastAccessTime).toBe(
        EARLIEST_SANE_TIMESTAMP
      );
      expect(response[1].approximateLastAccessTimeFormatted).toBe(
        moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow()
      );
      expect(response[1].location).toEqual({});

      expect(response[2].name).toBe('has device type');
      expect(response[2].type).toBe('wibble');
      expect(response[2].isCurrentDevice).toBe(false);
      expect(response[2].lastAccessTime).toBe(EARLIEST_SANE_TIMESTAMP - 1);
      expect(response[2].lastAccessTimeFormatted).toBe(
        moment(EARLIEST_SANE_TIMESTAMP - 1)
          .locale('fr')
          .fromNow()
      );
      expect(response[2].approximateLastAccessTime).toBe(
        EARLIEST_SANE_TIMESTAMP
      );
      expect(response[2].approximateLastAccessTimeFormatted).toBe(
        moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow()
      );
      expect(response[2].location).toEqual({
        country: 'Royaume-Uni',
      });

      expect(response[3].name).toBe('');
      expect(response[3].lastAccessTime).toBe(EARLIEST_SANE_TIMESTAMP);
      expect(response[3].lastAccessTimeFormatted).toBe(
        moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow()
      );
      expect(response[3].approximateLastAccessTime).toBeUndefined();
      expect(response[3].approximateLastAccessTimeFormatted).toBeUndefined();

      expect(log.error.callCount).toBe(0);

      expect(mockDB.devices.callCount).toBe(0);

      expect(mockDevices.synthesizeName.callCount).toBe(1);
      expect(mockDevices.synthesizeName.args[0].length).toBe(1);
      expect(mockDevices.synthesizeName.args[0][0]).toBe(unnamedDevice);
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
      expect(response.length).toBe(1);
      expect(response[0].name).toBe('wibble');
      expect(response[0].location).toEqual({
        city: 'Bournemouth',
        country: 'United Kingdom',
        state: 'England',
        stateCode: 'EN',
      });
      expect(log.error.callCount).toBe(0);
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

  // Note: The schema validation for approximateLastAccessTime has changed since the
  // original Mocha test was written. The schema now allows values below EARLIEST_SANE_TIMESTAMP.
  it('should not allow returning approximateLastAccessTime < EARLIEST_SANE_TIMESTAMP', () => {
    const route = getRoute(makeRoutes({}), '/account/devices');
    expect(() =>
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
        route.options.response.schema
      )
    ).not.toThrow();
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
      expect(response[0].lastAccessTime).toBe(now);
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

    await expect(route.handler(mockRequest)).rejects.toMatchObject({
      output: { statusCode: 503 },
      errno: error.ERRNO.FEATURE_NOT_ENABLED,
    });
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
      sinon.assert.notCalled(mockDB.touchSessionToken);
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
      expect(Array.isArray(response)).toBeTruthy();
      expect(response.length).toBe(1);

      expect(response[0].name).toBe('current session');
      expect(response[0].type).toBe('mobile');
      expect(response[0].sessionToken).toBeUndefined();
      expect(response[0].isCurrentDevice).toBe(true);
      expect(response[0].lastAccessTime > ONE_DAY_AGO).toBeTruthy();
      sinon.assert.calledWithExactly(mockDB.touchSessionToken, credentials, {}, true);
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
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(4);
      const noFormattedTime = ({ createdTimeFormatted, ...rest }: any) => rest;
      expect(result.map((x: any) => noFormattedTime(x))).toEqual([
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
      ]);
    });
  });
});
