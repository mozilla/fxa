/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Ajv = require('ajv');
const ajv = new Ajv();
const fs = require('fs');
const path = require('path');

const mocks = require('../test/mocks');
const mockUid = 'deadbeef';

const TTL = '42';
const MS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

const PUSH_PAYLOADS_SCHEMA_PATH = './pushpayloads.schema.json';
let pushPayloadsSchema: any = null;

function getPushPayloadsSchema() {
  if (!pushPayloadsSchema) {
    const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
    pushPayloadsSchema = JSON.parse(fs.readFileSync(schemaPath));
  }
  return pushPayloadsSchema;
}

function isValidPushPayload(
  value: unknown,
  fields: Record<string, unknown>
): boolean {
  const schema = getPushPayloadsSchema();
  if (!ajv.validate(schema, value)) {
    return false;
  }
  // Check that the value contains all the expected fields
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  for (const [key, expected] of Object.entries(fields)) {
    if (JSON.stringify((value as any)[key]) !== JSON.stringify(expected)) {
      return false;
    }
  }
  return true;
}

interface MockDevice {
  id: string;
  isCurrentDevice: boolean;
  lastAccessTime: number;
  name: string;
  type: string | null;
  availableCommands: Record<string, string>;
  pushCallback: string;
  pushPublicKey: string;
  pushAuthKey: string;
  pushEndpointExpired: boolean;
  uaOS?: string;
  uaOSVersion?: string;
  uaBrowser?: string;
  uaBrowserVersion?: string;
}

const WINDOWS_DESKTOP_PUSH_DEFAULTS = {
  isCurrentDevice: false,
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
} as const;

describe('push', () => {
  let mockDb: ReturnType<typeof mocks.mockDB>,
    mockLog: ReturnType<typeof mocks.mockLog>,
    mockConfig: Record<string, unknown>,
    mockStatsD: { increment: jest.Mock },
    mockDevices: MockDevice[],
    mockSendNotification: jest.Mock;

  function loadMockedPushModule() {
    jest.resetModules();
    jest.doMock('web-push', () => ({
      sendNotification: mockSendNotification,
    }));
    return require('./push')(mockLog, mockDb, mockConfig, mockStatsD);
  }

  beforeEach(() => {
    mockDb = mocks.mockDB();
    mockLog = mocks.mockLog();
    mockConfig = {};
    mockDevices = [
      {
        id: '0f7aa00356e5416e82b3bef7bc409eef',
        isCurrentDevice: true,
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
        ...WINDOWS_DESKTOP_PUSH_DEFAULTS,
        id: '3a45e6d0dae543qqdKyqjuvAiEupsnOd',
        // 2 days ago, will show in statsd as < 1 week
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 2,
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
      increment: jest.fn(),
    };
    mockSendNotification = jest.fn(async () => {});
  });

  it('sendPush does not reject on empty device array', async () => {
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, [], 'accountVerify');
    expect(mockSendNotification).toHaveBeenCalledTimes(0);
    expect(mockStatsD.increment).toHaveBeenCalledTimes(0);
  });

  it('sendPush logs metrics about successful sends', async () => {
    mockDevices.push(
      {
        ...WINDOWS_DESKTOP_PUSH_DEFAULTS,
        id: '11173923bc3e4507a0aa4e285513194a',
        // 2 weeks ago, will show in statsd as < 1 month
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 7 * 2,
      },
      {
        ...WINDOWS_DESKTOP_PUSH_DEFAULTS,
        id: '22273923bc3e4507a0aa4e285513194a',
        // 2 months ago, will show in statsd as < 1 year
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 30 * 2,
      },
      {
        ...WINDOWS_DESKTOP_PUSH_DEFAULTS,
        id: '33373923bc3e4507a0aa4e285513194a',
        // Over 1 year ago, will show in statsd as > 1 year
        lastAccessTime: Date.now() - MS_IN_ONE_DAY * 370,
      }
    );

    const push = loadMockedPushModule();
    const sendErrors = await push.sendPush(
      mockUid,
      mockDevices,
      'accountVerify'
    );
    expect(sendErrors).toEqual({});
    expect(mockSendNotification).toHaveBeenCalledTimes(5);

    expect(mockStatsD.increment).toHaveBeenCalledTimes(10);
    expect(mockStatsD.increment.mock.calls[0]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[1]).toEqual([
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[2]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 week',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[3]).toEqual([
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 week',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[4]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 month',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[5]).toEqual([
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 month',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[6]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 year',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[7]).toEqual([
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 year',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[8]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '> 1 year',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[9]).toEqual([
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '> 1 year',
      },
    ]);
  });

  it('sendPush logs metrics about failed sends', async () => {
    let shouldFail = false;
    mockSendNotification = jest.fn(async () => {
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
    expect(sendErrors).toEqual(
      expect.objectContaining({
        [mockDevices[1].id]: expect.anything(),
      })
    );
    expect(mockSendNotification).toHaveBeenCalledTimes(2);

    expect(mockStatsD.increment).toHaveBeenCalledTimes(4);
    expect(mockStatsD.increment.mock.calls[0]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[1]).toEqual([
      'push.send.success',
      {
        reason: 'accountVerify',
        uaOS: undefined,
        errCode: undefined,
        lastSeen: '< 1 day',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[2]).toEqual([
      'push.send.attempt',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: undefined,
        lastSeen: '< 1 week',
      },
    ]);
    expect(mockStatsD.increment.mock.calls[3]).toEqual([
      'push.send.failure',
      {
        reason: 'accountVerify',
        uaOS: 'Windows',
        errCode: 'unknown',
        lastSeen: '< 1 week',
      },
    ]);
  });

  it('sendPush sends notifications with a TTL of 0', async () => {
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, mockDevices, 'accountVerify');
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    for (const call of mockSendNotification.mock.calls) {
      expect(call[1]).toBeNull();
      expect(call[2]).toEqual(expect.objectContaining({ TTL: '0' }));
    }
  });

  it('sendPush sends notifications with user-defined TTL', async () => {
    const push = loadMockedPushModule();
    const options = { TTL: TTL };
    await push.sendPush(mockUid, mockDevices, 'accountVerify', options);
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    for (const call of mockSendNotification.mock.calls) {
      expect(call[2]).toEqual(expect.objectContaining({ TTL }));
    }
  });

  it('sendPush sends data', async () => {
    const push = loadMockedPushModule();
    const data = { foo: 'bar' };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'accountVerify', options);
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    for (const call of mockSendNotification.mock.calls) {
      expect(call[0]).toEqual(
        expect.objectContaining({
          keys: {
            p256dh: expect.anything(),
            auth: expect.anything(),
          },
        })
      );
      expect(call[1]).toEqual(Buffer.from(JSON.stringify(data)));
    }
  });

  it("sendPush doesn't push to ios devices if it is triggered with an unsupported command", async () => {
    const push = loadMockedPushModule();
    const data = Buffer.from(
      JSON.stringify({ command: 'fxaccounts:non_existent_command' })
    );
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    expect(mockSendNotification.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[0].pushCallback,
      })
    );
    expect(mockSendNotification.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[1].pushCallback,
      })
    );
  });

  it('sendPush pushes to all ios devices if it is triggered with a "commands received" command', async () => {
    const push = loadMockedPushModule();
    const data = {
      command: 'fxaccounts:command_received',
      data: { foo: 'bar' },
    };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    expect(mockSendNotification).toHaveBeenCalledTimes(3);
    expect(mockSendNotification.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[0].pushCallback,
      })
    );
    expect(mockSendNotification.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[1].pushCallback,
      })
    );
    expect(mockSendNotification.mock.calls[2][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[2].pushCallback,
      })
    );
  });

  it('sendPush does not push to ios devices if triggered with a "collection changed" command', async () => {
    const push = loadMockedPushModule();
    const data = {
      command: 'sync:collection_changed',
      data: { collection: 'clients', reason: 'firstsync' },
    };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    expect(mockSendNotification.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[0].pushCallback,
      })
    );
    expect(mockSendNotification.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[1].pushCallback,
      })
    );
  });

  it('sendPush pushes to ios devices if it is triggered with a "device connected" command', async () => {
    const push = loadMockedPushModule();
    const data = { command: 'fxaccounts:device_connected' };
    const options = { data: data };
    await push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
    expect(mockSendNotification).toHaveBeenCalledTimes(3);
    expect(mockSendNotification.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[0].pushCallback,
      })
    );
    expect(mockSendNotification.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[1].pushCallback,
      })
    );
    expect(mockSendNotification.mock.calls[2][0]).toEqual(
      expect.objectContaining({
        endpoint: mockDevices[2].pushCallback,
      })
    );
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
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'deviceConnected',
        errCode: 'noKeys',
      })
    );
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
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'accountVerify',
        errCode: 'noCallback',
      })
    );
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
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'accountVerify',
        errCode: 'expiredCallback',
      })
    );
  });

  it('push reports errors when web-push fails', async () => {
    mockSendNotification = jest.fn(async () => {
      throw new Error('Failed with a nasty error');
    });
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, [mockDevices[0]], 'accountVerify');
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'accountVerify',
        errCode: 'unknown',
        err: expect.objectContaining({ message: 'Failed with a nasty error' }),
      })
    );
  });

  it('push logs a warning when asked to send to more than 200 devices', async () => {
    const push = loadMockedPushModule();
    const devices: MockDevice[] = [];
    for (let i = 0; i < 200; i++) {
      devices.push(mockDevices[0]);
    }
    await push.sendPush(mockUid, devices, 'accountVerify');
    expect(mockLog.warn).toHaveBeenCalledTimes(0);

    devices.push(mockDevices[0]);
    await push.sendPush(mockUid, devices, 'accountVerify');
    expect(mockLog.warn).toHaveBeenCalledTimes(1);
    expect(mockLog.warn).toHaveBeenCalledWith(
      'push.sendPush.tooManyDevices',
      expect.objectContaining({
        uid: mockUid,
      })
    );
  });

  it('push resets device push data when push server responds with a 400 level error', async () => {
    mockSendNotification = jest.fn(async () => {
      const err: Error & { statusCode?: number } = new Error('Failed');
      err.statusCode = 410;
      throw err;
    });
    const push = loadMockedPushModule();
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    await push.sendPush(mockUid, [device], 'accountVerify');
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'accountVerify',
        errCode: 'resetCallback',
      })
    );
    expect(mockDb.updateDevice).toHaveBeenCalledTimes(1);
    expect(mockDb.updateDevice).toHaveBeenCalledWith(
      mockUid,
      expect.objectContaining({
        id: mockDevices[0].id,
      })
    );
    // sessionTokenId should be falsy
    const updateDeviceArgs = mockDb.updateDevice.mock.calls[0][1];
    expect(updateDeviceArgs.sessionTokenId).toBeFalsy();
  });

  it('push resets device push data when a failure is caused by bad encryption keys', async () => {
    mockSendNotification = jest.fn(async () => {
      throw new Error('Failed');
    });
    const push = loadMockedPushModule();
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    device.pushPublicKey = `E${device.pushPublicKey.substring(1)}`;
    await push.sendPush(mockUid, [device], 'accountVerify');
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'accountVerify',
        errCode: 'resetCallback',
      })
    );
    expect(mockDb.updateDevice).toHaveBeenCalledTimes(1);
    expect(mockDb.updateDevice).toHaveBeenCalledWith(
      mockUid,
      expect.objectContaining({
        id: mockDevices[0].id,
      })
    );
    // sessionTokenId should be falsy
    const updateDeviceArgs = mockDb.updateDevice.mock.calls[0][1];
    expect(updateDeviceArgs.sessionTokenId).toBeFalsy();
  });

  it('push does not reset device push data after an unexpected failure', async () => {
    mockSendNotification = jest.fn(async () => {
      throw new Error('Failed unexpectedly');
    });
    const push = loadMockedPushModule();
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    await push.sendPush(mockUid, [device], 'accountVerify');
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledTimes(1);
    expect(mockLog.debug).toHaveBeenCalledWith(
      'push.send.failure',
      expect.objectContaining({
        reason: 'accountVerify',
        errCode: 'unknown',
      })
    );
    expect(mockLog.error).toHaveBeenCalledTimes(1);
    expect(mockLog.error).toHaveBeenCalledWith(
      'push.sendPush.unexpectedError',
      expect.objectContaining({
        err: expect.objectContaining({ message: 'Failed unexpectedly' }),
      })
    );
    expect(mockDb.updateDevice).toHaveBeenCalledTimes(0);
  });

  it('notifyCommandReceived calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    await push.notifyCommandReceived(
      mockUid,
      mockDevices[0],
      'commandName',
      'sendingDevice',
      12,
      'http://fetch.url',
      42
    );
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    const sendPushArgs = (push.sendPush as jest.Mock).mock.calls[0];
    expect(sendPushArgs[0]).toBe(mockUid);
    expect(sendPushArgs[1]).toEqual([mockDevices[0]]);
    expect(sendPushArgs[2]).toBe('commandReceived');
    const pushOptions = sendPushArgs[3];
    expect(pushOptions.TTL).toBe(42);
    expect(
      isValidPushPayload(pushOptions.data, {
        version: 1,
        command: 'fxaccounts:command_received',
        data: {
          command: 'commandName',
          index: 12,
          sender: 'sendingDevice',
          url: 'http://fetch.url',
        },
      })
    ).toBe(true);
  });

  it('notifyCommandReceived re-throws errors', async () => {
    mockSendNotification = jest.fn(async () => {
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
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toEqual(
        expect.objectContaining({ message: 'Failed with a nasty error' })
      );
    }
  });

  it('notifyDeviceConnected calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    const deviceName = 'My phone';
    await push.notifyDeviceConnected(mockUid, mockDevices, deviceName);
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    const sendPushArgs = (push.sendPush as jest.Mock).mock.calls[0];
    expect(sendPushArgs[0]).toBe(mockUid);
    expect(sendPushArgs[1]).toBe(mockDevices);
    expect(sendPushArgs[2]).toBe('deviceConnected');
    const pushOptions = sendPushArgs[3];
    expect(pushOptions.TTL).toBeUndefined();
    expect(
      isValidPushPayload(pushOptions.data, {
        version: 1,
        command: 'fxaccounts:device_connected',
        data: {
          deviceName: deviceName,
        },
      })
    ).toBe(true);
  });

  it('notifyDeviceDisconnected calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    const idToDisconnect = mockDevices[0].id;
    await push.notifyDeviceDisconnected(mockUid, mockDevices, idToDisconnect);
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    const sendPushArgs = (push.sendPush as jest.Mock).mock.calls[0];
    expect(sendPushArgs[0]).toBe(mockUid);
    expect(sendPushArgs[1]).toBe(mockDevices);
    expect(sendPushArgs[2]).toBe('deviceDisconnected');
    const pushOptions = sendPushArgs[3];
    expect(typeof pushOptions.TTL).toBe('number');
    expect(
      isValidPushPayload(pushOptions.data, {
        version: 1,
        command: 'fxaccounts:device_disconnected',
        data: {
          id: idToDisconnect,
        },
      })
    ).toBe(true);
  });

  it('notifyPasswordChanged calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    await push.notifyPasswordChanged(mockUid, mockDevices);
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    const sendPushArgs = (push.sendPush as jest.Mock).mock.calls[0];
    expect(sendPushArgs[0]).toBe(mockUid);
    expect(sendPushArgs[1]).toBe(mockDevices);
    expect(sendPushArgs[2]).toBe('passwordChange');
    const pushOptions = sendPushArgs[3];
    expect(typeof pushOptions.TTL).toBe('number');
    expect(
      isValidPushPayload(pushOptions.data, {
        version: 1,
        command: 'fxaccounts:password_changed',
        data: undefined,
      })
    ).toBe(true);
  });

  it('notifyPasswordReset calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    await push.notifyPasswordReset(mockUid, mockDevices);
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    const sendPushArgs = (push.sendPush as jest.Mock).mock.calls[0];
    expect(sendPushArgs[0]).toBe(mockUid);
    expect(sendPushArgs[1]).toBe(mockDevices);
    expect(sendPushArgs[2]).toBe('passwordReset');
    const pushOptions = sendPushArgs[3];
    expect(typeof pushOptions.TTL).toBe('number');
    expect(
      isValidPushPayload(pushOptions.data, {
        version: 1,
        command: 'fxaccounts:password_reset',
        data: undefined,
      })
    ).toBe(true);
  });

  it('notifyAccountUpdated calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    await push.notifyAccountUpdated(mockUid, mockDevices, 'deviceConnected');
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    expect(push.sendPush).toHaveBeenCalledWith(
      mockUid,
      mockDevices,
      'deviceConnected'
    );
  });

  it('notifyAccountDestroyed calls sendPush', async () => {
    const push = loadMockedPushModule();
    jest.spyOn(push, 'sendPush');
    await push.notifyAccountDestroyed(mockUid, mockDevices);
    expect(push.sendPush).toHaveBeenCalledTimes(1);
    const sendPushArgs = (push.sendPush as jest.Mock).mock.calls[0];
    expect(sendPushArgs[0]).toBe(mockUid);
    expect(sendPushArgs[1]).toBe(mockDevices);
    expect(sendPushArgs[2]).toBe('accountDestroyed');
    const pushOptions = sendPushArgs[3];
    expect(typeof pushOptions.TTL).toBe('number');
    expect(
      isValidPushPayload(pushOptions.data, {
        version: 1,
        command: 'fxaccounts:account_destroyed',
        data: {
          uid: mockUid,
        },
      })
    ).toBe(true);
  });

  it('sendPush includes VAPID identification if it is configured', async () => {
    mockConfig = {
      publicUrl: 'https://example.com',
      vapidKeysFile: path.join(
        __dirname,
        '../test/config/mock-vapid-keys.json'
      ),
    };
    const push = loadMockedPushModule();
    await push.sendPush(mockUid, mockDevices, 'accountVerify');
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
    for (const call of mockSendNotification.mock.calls) {
      expect(call[2]).toEqual(
        expect.objectContaining({
          vapidDetails: {
            subject: mockConfig.publicUrl,
            privateKey: 'private',
            publicKey: 'public',
          },
        })
      );
    }
  });

  it('sendPush errors out cleanly if given an unknown reason argument', async () => {
    const push = loadMockedPushModule();
    try {
      await push.sendPush(mockUid, mockDevices, 'anUnknownReasonString');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBe('Unknown push reason: anUnknownReasonString');
    }
    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});
