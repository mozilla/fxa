/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

import proxyquire from 'proxyquire';
import sinon from 'sinon';
const assert = { ...sinon.assert, ...require('chai').assert };
import Ajv from 'ajv';
const ajv = new Ajv();
import fs from 'fs';
import path from 'path';
const match = sinon.match;

import mocks from '../mocks';
const mockUid = 'deadbeef';

const TTL = '42';
const MS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

const pushModulePath = `${ROOT_DIR}/lib/push`;

const PUSH_PAYLOADS_SCHEMA_PATH = `${ROOT_DIR}/lib/pushpayloads.schema.json`;
let PUSH_PAYLOADS_SCHEMA_MATCHER = null;
match.validPushPayload = (fields) => {
  if (!PUSH_PAYLOADS_SCHEMA_MATCHER) {
    const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
    const schema = JSON.parse(fs.readFileSync(schemaPath));
    PUSH_PAYLOADS_SCHEMA_MATCHER = match((value) => {
      return ajv.validate(schema, value);
    }, 'matches payload schema');
  }
  return match(fields).and(PUSH_PAYLOADS_SCHEMA_MATCHER);
};

describe('push', () => {
  let mockDb,
    mockLog,
    mockConfig,
    mockStatsD,
    mockDevices,
    mockSendNotification;

  function loadMockedPushModule() {
    const mocks = {
      'web-push': {
        sendNotification: mockSendNotification,
      },
    };
    return proxyquire(pushModulePath, mocks)(
      mockLog,
      mockDb,
      mockConfig,
      mockStatsD
    );
  }

  beforeEach(() => {
    mockDb = mocks.mockDB();
    mockLog = mocks.mockLog();
    mockConfig = {};
    mockDevices = [
      {
        id: '0f7aa00356e5416e82b3bef7bc409eef',
        isCurrentDevice: true,
        // will show in statsd as  < 1 day
        lastAccessTime: Date.now(),
        name: 'My Phone',
        type: 'mobile',
        availableCommands: {},
        pushCallback:
          'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: 'w3b14Zjc-Afj2SDOLOyong==',
        pushEndpointExpired: false,
      },
      {
        id: '3a45e6d0dae543qqdKyqjuvAiEupsnOd',
        isCurrentDevice: false,
        // 2 days ago, will show in statsd as < 1 weeks
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 2,
        name: 'My Desktop',
        uaOS: 'Windows',
        uaOSVersion: '10',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '65.4',
        type: null,
        availableCommands: {},
        pushCallback:
          'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: 'w3b14Zjc-Afj2SDOLOyong==',
        pushEndpointExpired: false,
      },
      {
        id: '50973923bc3e4507a0aa4e285513194a',
        isCurrentDevice: false,
        lastAccessTime: Date.now(),
        name: 'My Ipad',
        type: null,
        availableCommands: {},
        uaOS: 'iOS',
        pushCallback:
          'https://updates.push.services.mozilla.com/update/50973923bc3e4507a0aa4e285513194a',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: 'w3b14Zjc-Afj2SDOLOyong==',
        pushEndpointExpired: false,
      },
    ];
    mockStatsD = {
      increment: sinon.spy(),
    };
    mockSendNotification = sinon.spy(async () => {});
  });

  it('sendPush does not reject on empty device array', async () => {
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, [], 'accountVerify');
    assert.callCount(mockSendNotification, 0);
    assert.callCount(mockStatsD.increment, 0);
  });

  it('sendPush logs metrics about successful sends', async () => {
    mockDevices.push(
      {
        id: '11173923bc3e4507a0aa4e285513194a',
        isCurrentDevice: false,
        // 2 weeks ago, will show in statsd as < 1 month
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 7 * 2,
        name: 'My Desktop',
        uaOS: 'Windows',
        uaOSVersion: '10',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '65.4',
        type: null,
        availableCommands: {},
        pushCallback:
          'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: 'w3b14Zjc-Afj2SDOLOyong==',
        pushEndpointExpired: false,
      },
      {
        id: '22273923bc3e4507a0aa4e285513194a',
        isCurrentDevice: false,
        // 2 months ago, will show in statsd as < 1 year
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 30 * 2,
        name: 'My Desktop',
        uaOS: 'Windows',
        uaOSVersion: '10',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '65.4',
        type: null,
        availableCommands: {},
        pushCallback:
          'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: 'w3b14Zjc-Afj2SDOLOyong==',
        pushEndpointExpired: false,
      },
      {
        id: '33373923bc3e4507a0aa4e285513194a',
        isCurrentDevice: false,
        // Over 1 year ago, will show in statsd as > 1 year
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 370,
        name: 'My Desktop',
        uaOS: 'Windows',
        uaOSVersion: '10',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '65.4',
        type: null,
        availableCommands: {},
        pushCallback:
          'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: 'w3b14Zjc-Afj2SDOLOyong==',
        pushEndpointExpired: false,
      }
    );

    const push = loadMockedPushModule();
    const sendErrors = await push.sendPush(
      mockUid,
      mockDevices,
      'accountVerify'
    );
    assert.deepEqual(sendErrors, {});
    assert.callCount(mockSendNotification, 5);

    assert.callCount(mockStatsD.increment, 10);
    assert.calledWithExactly(
      mockStatsD.increment.getCall(0),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(1),
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(2),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 week',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(3),
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 week',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(4),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 month',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(5),
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 month',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(6),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 year',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(7),
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 year',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(8),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '> 1 year',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(9),
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '> 1 year',
      }
    );
  });

  it('sendPush logs metrics about failed sends', async () => {
    let shouldFail = false;
    mockSendNotification = sinon.spy(async () => {
      try {
        if (shouldFail) {
          throw new Error('intermittent failure');
        }
      } finally {
        shouldFail = !shouldFail;
      }
    });
    const push = loadMockedPushModule();
    const sendErrors = await push.sendPush(
      mockUid,
      mockDevices,
      'accountVerify'
    );
    sinon.assert.match(sendErrors, match.has(mockDevices[1].id, match.any));
    assert.callCount(mockSendNotification, 2);

    assert.callCount(mockStatsD.increment, 4);
    assert.calledWithExactly(
      mockStatsD.increment.getCall(0),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(1),
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(2),
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 week',
      }
    );
    assert.calledWithExactly(
      mockStatsD.increment.getCall(3),
      'push.send.failure',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: 'unknown',
        lastSeen: '< 1 week',
      }
    );
  });

  it('sendPush sends notifications with a TTL of 0', async () => {
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, mockDevices, 'accountVerify');
    assert.callCount(mockSendNotification, 2);
    for (const call of mockSendNotification.getCalls()) {
      assert.calledWithMatch(call, match.any, null, {
        TTL: '0',
      });
    }
  });

  it('sendPush sends notifications with user-defined TTL', async () => {
    const push = loadMockedPushModule();
    const options = { TTL: TTL };
    await push.sendPush(mockUid, mockDevices, 'accountVerify', options);
    assert.callCount(mockSendNotification, 2);
    for (const call of mockSendNotification.getCalls()) {
      assert.calledWithMatch(call, match.any, null, { TTL });
    }
  });

  it('sendPush sends data', async () => {
    const push = loadMockedPushModule();
    const data = { foo: 'bar' };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'accountVerify', options);
    assert.callCount(mockSendNotification, 2);
    for (const call of mockSendNotification.getCalls()) {
      assert.calledWithMatch(
        call,
        {
          keys: {
            p256dh: match.defined,
            auth: match.defined,
          },
        },
        Buffer.from(JSON.stringify(data))
      );
    }
  });

  it("sendPush doesn't push to ios devices if it is triggered with an unsupported command", async () => {
    const push = loadMockedPushModule();
    const data = Buffer.from(
      JSON.stringify({ command: 'fxaccounts:non_existent_command' })
    );
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    assert.callCount(mockSendNotification, 2);
    assert.calledWithMatch(mockSendNotification.getCall(0), {
      endpoint: mockDevices[0].pushCallback,
    });
    assert.calledWithMatch(mockSendNotification.getCall(1), {
      endpoint: mockDevices[1].pushCallback,
    });
  });

  it('sendPush pushes to all ios devices if it is triggered with a "commands received" command', async () => {
    const push = loadMockedPushModule();
    const data = {
      command: 'fxaccounts:command_received',
      data: { foo: 'bar' },
    };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    assert.callCount(mockSendNotification, 3);
    assert.calledWithMatch(mockSendNotification.getCall(0), {
      endpoint: mockDevices[0].pushCallback,
    });
    assert.calledWithMatch(mockSendNotification.getCall(1), {
      endpoint: mockDevices[1].pushCallback,
    });
    assert.calledWithMatch(mockSendNotification.getCall(2), {
      endpoint: mockDevices[2].pushCallback,
    });
  });

  it('sendPush does not push to ios devices if triggered with a "collection changed" command', async () => {
    const push = loadMockedPushModule();
    const data = {
      command: 'sync:collection_changed',
      data: { collection: 'clients', reason: 'firstsync' },
    };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    assert.callCount(mockSendNotification, 2);
    assert.calledWithMatch(mockSendNotification.getCall(0), {
      endpoint: mockDevices[0].pushCallback,
    });
    assert.calledWithMatch(mockSendNotification.getCall(1), {
      endpoint: mockDevices[1].pushCallback,
    });
  });

  it('sendPush pushes to ios devices if it is triggered with a "device connected" command', async () => {
    const push = loadMockedPushModule();
    const data = { command: 'fxaccounts:device_connected' };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    assert.callCount(mockSendNotification, 3);
    assert.calledWithMatch(mockSendNotification.getCall(0), {
      endpoint: mockDevices[0].pushCallback,
    });
    assert.calledWithMatch(mockSendNotification.getCall(1), {
      endpoint: mockDevices[1].pushCallback,
    });
    assert.calledWithMatch(mockSendNotification.getCall(2), {
      endpoint: mockDevices[2].pushCallback,
    });
  });

  it('push fails if data is present but both keys are not present', async () => {
    const push = loadMockedPushModule();
    const devices = [
      {
        id: 'foo',
        name: 'My Phone',
        pushCallback:
          'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
        pushAuthKey: 'bogus',
        pushEndpointExpired: false,
      },
    ];
    const options = { data: Buffer.from('foobar') };
    await push.sendPush(mockUid, devices, 'deviceConnected', options);
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'deviceConnected',
      errCode: 'noKeys',
    });
  });

  it('push catches devices with no push callback', async () => {
    const push = loadMockedPushModule();
    const devices = [
      {
        id: 'foo',
        name: 'My Phone',
      },
    ];
    await push.sendPush(mockUid, devices, 'accountVerify');
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'accountVerify',
      errCode: 'noCallback',
    });
  });

  it('push catches devices with expired callback', async () => {
    const push = loadMockedPushModule();
    const devices = [
      {
        id: 'foo',
        name: 'My Phone',
        pushCallback:
          'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
        pushEndpointExpired: true,
      },
    ];
    await push.sendPush(mockUid, devices, 'accountVerify');
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'accountVerify',
      errCode: 'expiredCallback',
    });
  });

  it('push reports errors when web-push fails', async () => {
    mockSendNotification = sinon.spy(async () => {
      throw new Error('Failed with a nasty error');
    });
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, [mockDevices[0]], 'accountVerify');
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'accountVerify',
      errCode: 'unknown',
      err: match.has('message', 'Failed with a nasty error'),
    });
  });

  it('push logs a warning when asked to send to more than 200 devices', async () => {
    const push = loadMockedPushModule();
    const devices = [];
    for (let i = 0; i < 200; i++) {
      devices.push(mockDevices[0]);
    }
    await push.sendPush(mockUid, devices, 'accountVerify');
    assert.callCount(mockLog.warn, 0);

    devices.push(mockDevices[0]);
    await push.sendPush(mockUid, devices, 'accountVerify');
    assert.callCount(mockLog.warn, 1);
    assert.calledWithMatch(mockLog.warn, 'push.sendPush.tooManyDevices', {
      uid: mockUid,
    });
  });

  it('push resets device push data when push server responds with a 400 level error', async () => {
    mockSendNotification = sinon.spy(async () => {
      const err = new Error('Failed');
      err.statusCode = 410;
      throw err;
    });
    const push = loadMockedPushModule();
    // Careful, the argument gets modified in-place.
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    await push.sendPush(mockUid, [device], 'accountVerify');
    assert.callCount(mockSendNotification, 1);
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'accountVerify',
      errCode: 'resetCallback',
    });
    assert.callCount(mockDb.updateDevice, 1);
    assert.calledWithMatch(mockDb.updateDevice, mockUid, {
      id: mockDevices[0].id,
      sessionTokenId: match.falsy,
    });
  });

  it('push resets device push data when a failure is caused by bad encryption keys', async () => {
    mockSendNotification = sinon.spy(async () => {
      throw new Error('Failed');
    });
    const push = loadMockedPushModule();
    // Careful, the argument gets modified in-place.
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    device.pushPublicKey = `E${device.pushPublicKey.substring(1)}`; // make the key invalid
    await push.sendPush(mockUid, [device], 'accountVerify');
    assert.callCount(mockSendNotification, 1);
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'accountVerify',
      errCode: 'resetCallback',
    });
    assert.callCount(mockDb.updateDevice, 1);
    assert.calledWithMatch(mockDb.updateDevice, mockUid, {
      id: mockDevices[0].id,
      sessionTokenId: match.falsy,
    });
  });

  it('push does not reset device push data after an unexpected failure', async () => {
    mockSendNotification = sinon.spy(async () => {
      throw new Error('Failed unexpectedly');
    });
    const push = loadMockedPushModule();
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    await push.sendPush(mockUid, [device], 'accountVerify');
    assert.callCount(mockSendNotification, 1);
    assert.callCount(mockLog.debug, 1);
    assert.calledWithMatch(mockLog.debug, 'push.send.failure', {
      reason: 'accountVerify',
      errCode: 'unknown',
    });
    assert.callCount(mockLog.error, 1);
    assert.calledWithMatch(mockLog.error, 'push.sendPush.unexpectedError', {
      err: match.has('message', 'Failed unexpectedly'),
    });
    assert.callCount(mockDb.updateDevice, 0);
  });

  it('notifyCommandReceived calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    await push.notifyCommandReceived(
      mockUid,
      mockDevices[0],
      'commandName',
      'sendingDevice',
      12,
      'http://fetch.url',
      42
    );
    assert.calledOnceWithExactly(
      push.sendPush,
      mockUid,
      [mockDevices[0]],
      'commandReceived',
      {
        data: match.validPushPayload({
          version: 1,
          command: 'fxaccounts:command_received',
          data: {
            command: 'commandName',
            index: 12,
            sender: 'sendingDevice',
            url: 'http://fetch.url',
          },
        }),
        TTL: 42,
      }
    );
  });

  it('notifyCommandReceived re-throws errors', async () => {
    mockSendNotification = sinon.spy(async () => {
      throw new Error('Failed with a nasty error');
    });
    const push = loadMockedPushModule();
    try {
      await push.notifyCommandReceived(
        mockUid,
        mockDevices[0],
        'commandName',
        'sendingDevice',
        12,
        'http://fetch.url',
        42
      );
      assert.fail('should have thrown');
    } catch (err) {
      sinon.assert.match(
        err,
        match.has('message', 'Failed with a nasty error')
      );
    }
  });

  it('notifyDeviceConnected calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    const deviceName = 'My phone';
    await push.notifyDeviceConnected(mockUid, mockDevices, deviceName);
    assert.calledOnce(push.sendPush);
    assert.calledWithMatch(
      push.sendPush,
      mockUid,
      mockDevices,
      'deviceConnected',
      {
        data: match.validPushPayload({
          version: 1,
          command: 'fxaccounts:device_connected',
          data: {
            deviceName: deviceName,
          },
        }),
        TTL: match.undefined,
      }
    );
  });

  it('notifyDeviceDisconnected calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    const idToDisconnect = mockDevices[0].id;
    await push.notifyDeviceDisconnected(mockUid, mockDevices, idToDisconnect);
    assert.calledOnce(push.sendPush);
    assert.calledWithMatch(
      push.sendPush,
      mockUid,
      mockDevices,
      'deviceDisconnected',
      {
        data: match.validPushPayload({
          version: 1,
          command: 'fxaccounts:device_disconnected',
          data: {
            id: idToDisconnect,
          },
        }),
        TTL: match.number,
      }
    );
  });

  it('notifyPasswordChanged calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    await push.notifyPasswordChanged(mockUid, mockDevices);
    assert.calledOnce(push.sendPush);
    assert.calledWithMatch(
      push.sendPush,
      mockUid,
      mockDevices,
      'passwordChange',
      {
        data: match.validPushPayload({
          version: 1,
          command: 'fxaccounts:password_changed',
          data: match.undefined,
        }),
        TTL: match.number,
      }
    );
  });

  it('notifyPasswordReset calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    await push.notifyPasswordReset(mockUid, mockDevices);
    assert.calledOnce(push.sendPush);
    assert.calledWithMatch(
      push.sendPush,
      mockUid,
      mockDevices,
      'passwordReset',
      {
        data: match.validPushPayload({
          version: 1,
          command: 'fxaccounts:password_reset',
          data: match.undefined,
        }),
        TTL: match.number,
      }
    );
  });

  it('notifyAccountUpdated calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    await push.notifyAccountUpdated(mockUid, mockDevices, 'deviceConnected');
    assert.calledOnce(push.sendPush);
    assert.calledWithExactly(
      push.sendPush,
      mockUid,
      mockDevices,
      'deviceConnected'
    );
  });

  it('notifyAccountDestroyed calls sendPush', async () => {
    const push = loadMockedPushModule();
    sinon.spy(push, 'sendPush');
    await push.notifyAccountDestroyed(mockUid, mockDevices);
    assert.calledOnce(push.sendPush);
    assert.calledWithMatch(
      push.sendPush,
      mockUid,
      mockDevices,
      'accountDestroyed',
      {
        data: match.validPushPayload({
          version: 1,
          command: 'fxaccounts:account_destroyed',
          data: {
            uid: mockUid,
          },
        }),
        TTL: match.number,
      }
    );
  });

  it('sendPush includes VAPID identification if it is configured', async () => {
    mockConfig = {
      publicUrl: 'https://example.com',
      vapidKeysFile: path.join(__dirname, '../config/mock-vapid-keys.json'),
    };
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, mockDevices, 'accountVerify');
    assert.callCount(mockSendNotification, 2);
    for (const call of mockSendNotification.getCalls()) {
      assert.calledWithMatch(call, match.any, null, {
        vapidDetails: {
          subject: mockConfig.publicUrl,
          privateKey: 'private',
          publicKey: 'public',
        },
      });
    }
  });

  it('sendPush errors out cleanly if given an unknown reason argument', async () => {
    const push = loadMockedPushModule();
    try {
      await push.sendPush(mockUid, mockDevices, 'anUnknownReasonString');
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err, 'Unknown push reason: anUnknownReasonString');
    }
    assert.notCalled(mockSendNotification);
  });
});
