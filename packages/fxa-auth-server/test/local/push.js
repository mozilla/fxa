/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const ajv = require('ajv')();
const fs = require('fs');
const path = require('path');

const P = require(`${ROOT_DIR}/lib/promise`);
const mocks = require('../mocks');
const mockLog = mocks.mockLog;
const mockUid = 'deadbeef';
const mockConfig = {};

const PUSH_PAYLOADS_SCHEMA_PATH = `${ROOT_DIR}/docs/pushpayloads.schema.json`;
const TTL = '42';
const pushModulePath = `${ROOT_DIR}/lib/push`;

describe('push', () => {
  let mockDb, mockDevices;

  beforeEach(() => {
    mockDb = mocks.mockDB();
    mockDevices = [
      {
        id: '0f7aa00356e5416e82b3bef7bc409eef',
        isCurrentDevice: true,
        lastAccessTime: 1449235471335,
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
        lastAccessTime: 1417699471335,
        name: 'My Desktop',
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
        lastAccessTime: 1402149471335,
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
  });

  it('sendPush does not reject on empty device array', () => {
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.success') {
          assert.fail('must not call push.success');
        }
      },
    });
    const push = require(pushModulePath)(thisMockLog, mockDb, mockConfig);

    return push.sendPush(mockUid, [], 'accountVerify');
  });

  it('sendPush sends notifications with a TTL of 0', () => {
    let successCalled = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.success') {
          // notification sent
          successCalled++;
        }
      },
    });

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          assert.equal(options.TTL, '0', 'sends the proper ttl header');
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    return push.sendPush(mockUid, mockDevices, 'accountVerify').then(() => {
      assert.equal(successCalled, 2);
    });
  });

  it('sendPush sends notifications with user-defined TTL', () => {
    let successCalled = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.success') {
          // notification sent
          successCalled++;
        }
      },
    });

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          assert.equal(options.TTL, TTL, 'sends the proper ttl header');
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    const options = { TTL: TTL };
    return push
      .sendPush(mockUid, mockDevices, 'accountVerify', options)
      .then(() => {
        assert.equal(successCalled, 2);
      });
  });

  it('sendPush sends data', () => {
    let count = 0;
    const data = { foo: 'bar' };
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          count++;
          assert.ok(sub.keys.p256dh);
          assert.ok(sub.keys.auth);
          assert.deepEqual(payload, Buffer.from(JSON.stringify(data)));
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    const options = { data: data };
    return push
      .sendPush(mockUid, mockDevices, 'accountVerify', options)
      .then(() => {
        assert.equal(count, 2);
      });
  });

  it("sendPush doesn't push to ios devices if it is triggered with an unsupported command", () => {
    const data = Buffer.from(
      JSON.stringify({ command: 'fxaccounts:non_existent_command' })
    );
    const endPoints = [];
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          endPoints.push(sub.endpoint);
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    const options = { data: data };
    return push
      .sendPush(mockUid, mockDevices, 'devicesNotify', options)
      .then(() => {
        assert.equal(endPoints.length, 2);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
      });
  });

  it('sendPush pushes to all ios devices if it is triggered with a "commands received" command', () => {
    const data = {
      command: 'fxaccounts:command_received',
      data: { foo: 'bar' },
    };
    const endPoints = [];
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          endPoints.push(sub.endpoint);
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    const options = { data: data };
    return push
      .sendPush(mockUid, mockDevices, 'devicesNotify', options)
      .then(() => {
        assert.equal(endPoints.length, 3);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        assert.equal(endPoints[2], mockDevices[2].pushCallback);
      });
  });

  it('sendPush pushes to all ios devices if it is triggered with a "collection changed" command', () => {
    const data = {
      command: 'sync:collection_changed',
      data: { collection: 'clients' },
    };
    const endPoints = [];
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          endPoints.push(sub.endpoint);
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    const options = { data: data };
    return push
      .sendPush(mockUid, mockDevices, 'devicesNotify', options)
      .then(() => {
        assert.equal(endPoints.length, 3);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        assert.equal(endPoints[2], mockDevices[2].pushCallback);
      });
  });

  it('sendPush does not push to ios devices if "collection changed" reason is "firstsync"', () => {
    const data = {
      command: 'sync:collection_changed',
      data: { collection: 'clients', reason: 'firstsync' },
    };
    const endPoints = [];
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          endPoints.push(sub.endpoint);
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    const options = { data: data };
    return push
      .sendPush(mockUid, mockDevices, 'devicesNotify', options)
      .then(() => {
        assert.equal(endPoints.length, 2);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
      });
  });

  it('sendPush pushes to ios >=10.0 devices if it is triggered with a "device connected" command', () => {
    const data = { command: 'fxaccounts:device_connected' };
    let endPoints = [];
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          endPoints.push(sub.endpoint);
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    const options = { data: data };
    return push
      .sendPush(mockUid, mockDevices, 'devicesNotify', options)
      .then(() => {
        assert.equal(endPoints.length, 2);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        // iOS not notified due to unknown browser version
      })
      .then(() => {
        endPoints = [];
        mockDevices[2].uaBrowserVersion = '8.2';
        return push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
      })
      .then(() => {
        assert.equal(endPoints.length, 2);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        // iOS not notified due to unsupported browser version
      })
      .then(() => {
        endPoints = [];
        mockDevices[2].uaBrowserVersion = '10.0';
        return push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
      })
      .then(() => {
        assert.equal(endPoints.length, 3);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        assert.equal(endPoints[2], mockDevices[2].pushCallback);
      })
      .then(() => {
        endPoints = [];
        mockDevices[2].uaBrowserVersion = '10.1';
        return push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
      })
      .then(() => {
        assert.equal(endPoints.length, 3);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        assert.equal(endPoints[2], mockDevices[2].pushCallback);
      })
      .then(() => {
        endPoints = [];
        mockDevices[2].uaBrowserVersion = '11.2';
        return push.sendPush(mockUid, mockDevices, 'devicesNotify', options);
      })
      .then(() => {
        assert.equal(endPoints.length, 3);
        assert.equal(endPoints[0], mockDevices[0].pushCallback);
        assert.equal(endPoints[1], mockDevices[1].pushCallback);
        assert.equal(endPoints[2], mockDevices[2].pushCallback);
      })
      .finally(() => {
        delete mockDevices[2].uaBrowserVersion;
      });
  });

  it('push fails if data is present but both keys are not present', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.data_but_no_keys') {
          // data detected but device had no keys
          count++;
        }
      },
    });

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

    const push = require(pushModulePath)(thisMockLog, mockDb, mockConfig);
    const options = { data: Buffer.from('foobar') };
    return push
      .sendPush(mockUid, devices, 'accountVerify', options)
      .then(() => {
        assert.equal(count, 1);
      });
  });

  it('push catches devices with no push callback', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.no_push_callback') {
          // device had no push callback
          count++;
        }
      },
    });

    const devices = [
      {
        id: 'foo',
        name: 'My Phone',
      },
    ];

    const push = require(pushModulePath)(thisMockLog, mockDb, mockConfig);
    return push.sendPush(mockUid, devices, 'accountVerify').then(() => {
      assert.equal(count, 1);
    });
  });

  it('push reports errors when web-push fails', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.failed') {
          // web-push failed
          count++;
        }
      },
    });

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.reject(new Error('Failed'));
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    return push
      .sendPush(mockUid, [mockDevices[0]], 'accountVerify')
      .then(() => {
        assert.equal(count, 1);
      });
  });

  it('push logs an error when asked to send to more than 200 devices', () => {
    const thisMockLog = mockLog({
      error: sinon.spy(),
    });

    const devices = [];
    for (let i = 0; i < 200; i++) {
      devices.push(mockDevices[0]);
    }

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          assert.equal(options.TTL, '0', 'sends the proper ttl header');
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );

    return push
      .sendPush(mockUid, devices, 'accountVerify')
      .then(() => {
        assert.equal(
          thisMockLog.error.callCount,
          0,
          'log.error was not called'
        );
        devices.push(mockDevices[0]);
        return push.sendPush(mockUid, devices, 'accountVerify');
      })
      .then(() => {
        assert.equal(thisMockLog.error.callCount, 1, 'log.error was called');
        const args = thisMockLog.error.getCall(0).args;
        assert.equal(args[0], 'push.sendPush');
        assert.equal(
          args[1].err.message,
          'Too many devices connected to account'
        );
      });
  });

  it('push resets device push data when push server responds with a 400 level error', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.reset_settings') {
          // web-push failed
          assert.equal(
            mockDb.updateDevice.callCount,
            1,
            'db.updateDevice was called once'
          );
          const args = mockDb.updateDevice.args[0];
          assert.equal(
            args.length,
            2,
            'db.updateDevice was passed two arguments'
          );
          assert.equal(args[1].sessionTokenId, null, 'sessionTokenId was null');
          count++;
        }
      },
    });

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          const err = new Error('Failed');
          err.statusCode = 410;
          return P.reject(err);
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    // Careful, the argument gets modified in-place.
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    return push.sendPush(mockUid, [device], 'accountVerify').then(() => {
      assert.equal(count, 1);
    });
  });

  it('push resets device push data when a failure is caused by bad encryption keys', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.reset_settings') {
          // web-push failed
          assert.equal(
            mockDb.updateDevice.callCount,
            1,
            'db.updateDevice was called once'
          );
          const args = mockDb.updateDevice.args[0];
          assert.equal(
            args.length,
            2,
            'db.updateDevice was passed two arguments'
          );
          assert.equal(
            args[1].sessionTokenId,
            null,
            'sessionTokenId argument was null'
          );
          count++;
        }
      },
    });

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          const err = new Error('Failed');
          return P.reject(err);
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    // Careful, the argument gets modified in-place.
    const device = JSON.parse(JSON.stringify(mockDevices[0]));
    device.pushPublicKey = `E${device.pushPublicKey.substring(1)}`; // make the key invalid
    return push.sendPush(mockUid, [device], 'accountVerify').then(() => {
      assert.equal(count, 1);
    });
  });

  it('push does not reset device push data after an unexpected failure', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.failed') {
          // web-push failed
          assert.equal(
            mockDb.updateDevice.callCount,
            0,
            'db.updateDevice was not called'
          );
          count++;
        }
      },
    });

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          const err = new Error('Failed');
          return P.reject(err);
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    return push
      .sendPush(mockUid, [mockDevices[0]], 'accountVerify')
      .then(() => {
        assert.equal(count, 1);
      });
  });

  it('notifyCommandReceived calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.spy(push, 'sendPush');
    return push
      .notifyCommandReceived(
        mockUid,
        mockDevices[0],
        'commandName',
        'sendingDevice',
        12,
        'http://fetch.url',
        42
      )
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called');
        assert.calledWithExactly(
          push.sendPush,
          mockUid,
          [mockDevices[0]],
          'commandReceived',
          {
            data: {
              version: 1,
              command: 'fxaccounts:command_received',
              data: {
                command: 'commandName',
                index: 12,
                sender: 'sendingDevice',
                url: 'http://fetch.url',
              },
            },
            TTL: 42,
          }
        );
        const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
        const schema = JSON.parse(fs.readFileSync(schemaPath));
        assert.ok(ajv.validate(schema, push.sendPush.getCall(0).args[3].data));
        push.sendPush.restore();
      });
  });

  it('notifyDeviceConnected calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.spy(push, 'sendPush');
    const deviceName = 'My phone';
    const expectedData = {
      version: 1,
      command: 'fxaccounts:device_connected',
      data: {
        deviceName: deviceName,
      },
    };
    return push
      .notifyDeviceConnected(mockUid, mockDevices, deviceName)
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called');
        assert.equal(push.sendPush.getCall(0).args[0], mockUid);
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices);
        assert.equal(push.sendPush.getCall(0).args[2], 'deviceConnected');
        const options = push.sendPush.getCall(0).args[3];
        assert.deepEqual(options.data, expectedData);
        const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
        const schema = JSON.parse(fs.readFileSync(schemaPath));
        assert.ok(ajv.validate(schema, options.data));
        push.sendPush.restore();
      });
  });

  it('notifyDeviceDisconnected calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.spy(push, 'sendPush');
    const idToDisconnect = mockDevices[0].id;
    const expectedData = {
      version: 1,
      command: 'fxaccounts:device_disconnected',
      data: {
        id: idToDisconnect,
      },
    };
    return push
      .notifyDeviceDisconnected(mockUid, mockDevices, idToDisconnect)
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called');
        assert.equal(push.sendPush.getCall(0).args[0], mockUid);
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices);
        assert.equal(push.sendPush.getCall(0).args[2], 'deviceDisconnected');
        const options = push.sendPush.getCall(0).args[3];
        assert.deepEqual(options.data, expectedData);
        const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
        const schema = JSON.parse(fs.readFileSync(schemaPath));
        assert.ok(ajv.validate(schema, options.data));
        assert.ok(options.TTL, 'TTL should be set');
        push.sendPush.restore();
      });
  });

  it('notifyPasswordChanged calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.spy(push, 'sendPush');
    const expectedData = {
      version: 1,
      command: 'fxaccounts:password_changed',
    };
    return push
      .notifyPasswordChanged(mockUid, mockDevices)
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called');
        assert.equal(push.sendPush.getCall(0).args[0], mockUid);
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices);
        assert.equal(push.sendPush.getCall(0).args[2], 'passwordChange');
        const options = push.sendPush.getCall(0).args[3];
        assert.deepEqual(options.data, expectedData);
        const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
        const schema = JSON.parse(fs.readFileSync(schemaPath));
        assert.ok(ajv.validate(schema, options.data));
        push.sendPush.restore();
      });
  });

  it('notifyPasswordReset calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.spy(push, 'sendPush');
    const expectedData = {
      version: 1,
      command: 'fxaccounts:password_reset',
    };
    return push
      .notifyPasswordReset(mockUid, mockDevices)
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called');
        assert.equal(push.sendPush.getCall(0).args[0], mockUid);
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices);
        assert.equal(push.sendPush.getCall(0).args[2], 'passwordReset');
        const options = push.sendPush.getCall(0).args[3];
        assert.deepEqual(options.data, expectedData);
        const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
        const schema = JSON.parse(fs.readFileSync(schemaPath));
        assert.ok(ajv.validate(schema, options.data));
        push.sendPush.restore();
      });
  });

  it('notifyAccountUpdated calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.stub(push, 'sendPush').callsFake(() => P.resolve());

    return push
      .notifyAccountUpdated(mockUid, mockDevices, 'deviceConnected')
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'push was called');
        assert.equal(push.sendPush.getCall(0).args[0], mockUid);
        assert.deepEqual(push.sendPush.getCall(0).args[1], mockDevices);
        assert.equal(push.sendPush.getCall(0).args[2], 'deviceConnected');
        push.sendPush.restore();
      });
  });

  it('notifyAccountDestroyed calls sendPush', () => {
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          return P.resolve();
        },
      },
    };
    const push = proxyquire(pushModulePath, mocks)(
      mockLog(),
      mockDb,
      mockConfig
    );
    sinon.spy(push, 'sendPush');
    const expectedData = {
      version: 1,
      command: 'fxaccounts:account_destroyed',
      data: {
        uid: mockUid,
      },
    };
    return push
      .notifyAccountDestroyed(mockUid, mockDevices)
      .catch(err => {
        assert.fail('must not throw');
        throw err;
      })
      .then(() => {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called');
        assert.equal(push.sendPush.getCall(0).args[0], mockUid);
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices);
        assert.equal(push.sendPush.getCall(0).args[2], 'accountDestroyed');
        const options = push.sendPush.getCall(0).args[3];
        assert.deepEqual(options.data, expectedData);
        const schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH);
        const schema = JSON.parse(fs.readFileSync(schemaPath));
        assert.ok(ajv.validate(schema, options.data));
        push.sendPush.restore();
      });
  });

  it('sendPush includes VAPID identification if it is configured', () => {
    let count = 0;
    const thisMockLog = mockLog({
      info: function(op, log) {
        if (log.name === 'push.account_verify.success') {
          count++;
        }
      },
    });

    const mockConfig = {
      publicUrl: 'https://example.com',
      vapidKeysFile: path.join(__dirname, '../config/mock-vapid-keys.json'),
    };

    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          assert.ok(options.vapidDetails, 'sends the VAPID params object');
          assert.equal(
            options.vapidDetails.subject,
            mockConfig.publicUrl,
            'sends the correct VAPID subject'
          );
          assert.equal(
            options.vapidDetails.privateKey,
            'private',
            'sends the correct VAPID privkey'
          );
          assert.equal(
            options.vapidDetails.publicKey,
            'public',
            'sends the correct VAPID pubkey'
          );
          return P.resolve();
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    return push.sendPush(mockUid, mockDevices, 'accountVerify').then(() => {
      assert.equal(count, 2);
    });
  });

  it('sendPush errors out cleanly if given an unknown reason argument', () => {
    const thisMockLog = mockLog();
    const mockConfig = {};
    const mocks = {
      'web-push': {
        sendNotification: function(sub, payload, options) {
          assert.fail('should not have called sendNotification');
          return P.reject('Should not have called sendNotification');
        },
      },
    };

    const push = proxyquire(pushModulePath, mocks)(
      thisMockLog,
      mockDb,
      mockConfig
    );
    return push.sendPush(mockUid, mockDevices, 'anUnknownReasonString').then(
      () => {
        assert(false, 'calling sendPush should have failed');
      },
      err => {
        assert.equal(err, 'Unknown push reason: anUnknownReasonString');
      }
    );
  });
});
