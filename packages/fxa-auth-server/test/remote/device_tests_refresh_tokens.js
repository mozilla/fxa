/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
const buf = require('buf').hex;
const testUtils = require('../lib/util');
const oauthServerModule = require('../../fxa-oauth-server/lib/server');
const encrypt = require('../../fxa-oauth-server/lib/encrypt');
const log = { trace() {}, info() {}, error() {} };

const lastAccessTimeUpdates = {
  enabled: true,
  sampleRate: 1,
  earliestSaneTimestamp: config.lastAccessTimeUpdates.earliestSaneTimestamp,
};
const Token = require('../../lib/tokens')(log, {
  lastAccessTimeUpdates: lastAccessTimeUpdates,
  tokenLifetimes: {
    sessionTokenWithoutDevice: 2419200000,
  },
});

const PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const NON_PUBLIC_CLIENT_ID = 'dcdb5ae7add825d2';
const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';
const UNKNOWN_REFRESH_TOKEN =
  'B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78';

describe('remote device with refresh tokens', function() {
  this.timeout(15000);
  let client;
  let db;
  let email;
  let oauthServer;
  let oauthServerDb;
  let password;
  let refreshToken;
  let server;

  before(() => {
    config.lastAccessTimeUpdates = lastAccessTimeUpdates;
    const DB = require('../../lib/db')(config, log, Token);

    testUtils.disableLogs();
    return oauthServerModule
      .create()
      .then(s => {
        oauthServer = s;
        oauthServerDb = require('../../fxa-oauth-server/lib/db');

        return oauthServer.start();
      })
      .then(() => {
        return TestServer.start(config, false, { oauthServer })
          .then(s => {
            server = s;
            return DB.connect(config[config.db.backend]);
          })
          .then(x => {
            db = x;
          });
      });
  });

  after(async () => {
    await TestServer.stop(server);
    await oauthServer.stop();
    testUtils.restoreStdoutWrite();
  });

  beforeEach(() => {
    email = server.uniqueEmail();
    password = 'test password';
    return Client.create(config.publicUrl, email, password).then(c => {
      client = c;
    });
  });

  it('device registration with unknown refresh token', async () => {
    const deviceInfo = {
      name: 'test device 🍓🔥在𝌆',
      type: 'mobile',
      availableCommands: { foo: 'bar' },
      pushCallback: '',
      pushPublicKey: '',
      pushAuthKey: '',
    };

    try {
      await client.updateDeviceWithRefreshToken(
        UNKNOWN_REFRESH_TOKEN,
        deviceInfo
      );
      assert.fail();
    } catch (err) {
      assert.strictEqual(err.code, 401);
      assert.strictEqual(err.errno, 110);
    }
  });

  it('devicesWithRefreshToken fails with unknown refresh token', async () => {
    try {
      await client.devicesWithRefreshToken(UNKNOWN_REFRESH_TOKEN);
      assert.fail();
    } catch (err) {
      assert.strictEqual(err.code, 401);
      assert.strictEqual(err.errno, 110);
    }
  });

  it('destroyDeviceWithRefreshToken fails with unknown refresh token', async () => {
    try {
      await client.destroyDeviceWithRefreshToken(UNKNOWN_REFRESH_TOKEN, '1');
      assert.fail();
    } catch (err) {
      assert.strictEqual(err.code, 401);
      assert.strictEqual(err.errno, 110);
    }
  });

  it('deviceCommandsWithRefreshToken fails with unknown refresh token', async () => {
    try {
      await client.deviceCommandsWithRefreshToken(UNKNOWN_REFRESH_TOKEN, 0, 50);
      assert.fail();
    } catch (err) {
      assert.strictEqual(err.code, 401);
      assert.strictEqual(err.errno, 110);
    }
  });

  it('devicesInvokeCommandWithRefreshToken fails with unknown refresh token', async () => {
    try {
      await client.devicesInvokeCommandWithRefreshToken(
        UNKNOWN_REFRESH_TOKEN,
        'target',
        'command',
        {},
        5
      );
      assert.fail();
    } catch (err) {
      assert.strictEqual(err.code, 401);
      assert.strictEqual(err.errno, 110);
    }
  });

  it('devicesNotifyWithRefreshToken fails with unknown refresh token', async () => {
    try {
      await client.devicesNotifyWithRefreshToken(UNKNOWN_REFRESH_TOKEN, '123');
      assert.fail();
    } catch (err) {
      assert.strictEqual(err.code, 401);
      assert.strictEqual(err.errno, 110);
    }
  });

  it('device registration after account creation', () => {
    return oauthServerDb
      .generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      })
      .then(refresh => {
        refreshToken = refresh.token.toString('hex');
        const deviceInfo = {
          name: 'test device 🍓🔥在𝌆',
          type: 'mobile',
          availableCommands: { foo: 'bar' },
          pushCallback: '',
          pushPublicKey: '',
          pushAuthKey: '',
        };

        return client
          .devicesWithRefreshToken(refreshToken)
          .then(devices => {
            assert.equal(devices.length, 0, 'devices returned no items');
            return client.updateDeviceWithRefreshToken(
              refreshToken,
              deviceInfo
            );
          })
          .then(device => {
            assert.ok(device.id, 'device.id was set');
            assert.ok(device.createdAt > 0, 'device.createdAt was set');
            assert.equal(
              device.name,
              deviceInfo.name,
              'device.name is correct'
            );
            assert.equal(
              device.type,
              deviceInfo.type,
              'device.type is correct'
            );
            assert.deepEqual(
              device.availableCommands,
              deviceInfo.availableCommands,
              'device.availableCommands is correct'
            );
            assert.equal(
              device.pushCallback,
              deviceInfo.pushCallback,
              'device.pushCallback is correct'
            );
            assert.equal(
              device.pushPublicKey,
              deviceInfo.pushPublicKey,
              'device.pushPublicKey is correct'
            );
            assert.equal(
              device.pushAuthKey,
              deviceInfo.pushAuthKey,
              'device.pushAuthKey is correct'
            );
            assert.equal(
              device.pushEndpointExpired,
              false,
              'device.pushEndpointExpired is correct'
            );

            return client.devicesWithRefreshToken(refreshToken);
          })
          .then(devices => {
            assert.equal(devices.length, 1, 'devices returned one item');
            assert.equal(
              devices[0].name,
              deviceInfo.name,
              'devices returned correct name'
            );
            assert.equal(
              devices[0].type,
              deviceInfo.type,
              'devices returned correct type'
            );
            assert.deepEqual(
              devices[0].availableCommands,
              deviceInfo.availableCommands,
              'devices returned correct availableCommands'
            );
            assert.equal(
              devices[0].pushCallback,
              deviceInfo.pushCallback,
              'devices returned empty pushCallback'
            );
            assert.equal(
              devices[0].pushPublicKey,
              deviceInfo.pushPublicKey,
              'devices returned correct pushPublicKey'
            );
            assert.equal(
              devices[0].pushAuthKey,
              deviceInfo.pushAuthKey,
              'devices returned correct pushAuthKey'
            );
            assert.equal(
              devices[0].pushEndpointExpired,
              '',
              'devices returned correct pushEndpointExpired'
            );
            return client.destroyDeviceWithRefreshToken(
              refreshToken,
              devices[0].id
            );
          });
      });
  });

  it('device registration without optional parameters', () => {
    let deviceId;

    return oauthServerDb
      .generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      })
      .then(refresh => {
        refreshToken = refresh.token.toString('hex');
        const deviceInfo = {
          name: 'test device',
          type: 'mobile',
        };

        return client
          .devicesWithRefreshToken(refreshToken)
          .then(devices => {
            assert.equal(devices.length, 0, 'devices returned no items');
            return client.updateDeviceWithRefreshToken(
              refreshToken,
              deviceInfo
            );
          })
          .then(device => {
            assert.ok(device.id, 'device.id was set');
            assert.ok(device.createdAt > 0, 'device.createdAt was set');
            assert.equal(
              device.name,
              deviceInfo.name,
              'device.name is correct'
            );
            assert.equal(
              device.type,
              deviceInfo.type,
              'device.type is correct'
            );
            assert.equal(
              device.pushCallback,
              undefined,
              'device.pushCallback is empty'
            );
            assert.equal(
              device.pushPublicKey,
              undefined,
              'device.pushPublicKey is empty'
            );
            assert.equal(
              device.pushAuthKey,
              undefined,
              'device.pushAuthKey is empty'
            );
            assert.equal(
              device.pushEndpointExpired,
              false,
              'device.pushEndpointExpired is false'
            );

            return client.devicesWithRefreshToken(refreshToken);
          })
          .then(devices => {
            deviceId = devices[0].id;

            assert.equal(devices.length, 1, 'devices returned one item');
            assert.equal(
              devices[0].name,
              deviceInfo.name,
              'devices returned correct name'
            );
            assert.equal(
              devices[0].type,
              deviceInfo.type,
              'devices returned correct type'
            );
            assert.equal(
              devices[0].pushCallback,
              undefined,
              'pushCallback is empty'
            );
            assert.equal(
              devices[0].pushPublicKey,
              undefined,
              'pushPublicKey is empty'
            );
            assert.equal(
              devices[0].pushAuthKey,
              undefined,
              'pushAuthKey is empty'
            );
            assert.equal(
              devices[0].pushEndpointExpired,
              false,
              'devices returned false pushEndpointExpired'
            );

            return oauthServerDb.getRefreshToken(encrypt.hash(refreshToken));
          })
          .then(tokenObj => {
            assert.ok(tokenObj, 'refreshToken should exist');

            return client.destroyDeviceWithRefreshToken(refreshToken, deviceId);
          })
          .then(() => {
            // deleting the device also deletes the associated refreshToken
            return oauthServerDb.getRefreshToken(encrypt.hash(refreshToken));
          })
          .then(tokenObj => {
            assert.notOk(tokenObj, 'refreshToken should be gone');
          });
      });
  });

  it('device registration using oauth client name', () => {
    let refreshToken2;

    return oauthServerDb
      .generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      })
      .then(refresh => {
        refreshToken = refresh.token.toString('hex');

        return oauthServerDb.generateRefreshToken({
          clientId: buf(PUBLIC_CLIENT_ID),
          userId: buf(client.uid),
          email: client.email,
          scope: 'profile https://identity.mozilla.com/apps/oldsync',
        });
      })
      .then(refresh => {
        refreshToken2 = refresh.token.toString('hex');

        return client.devicesWithRefreshToken(refreshToken);
      })
      .then(devices => {
        assert.equal(devices.length, 0);
        return client.updateDeviceWithRefreshToken(refreshToken, {});
      })
      .then(device => {
        assert.ok(device.id, 'device.id was set');
        assert.ok(device.createdAt > 0, 'device.createdAt was set');
        assert.equal(device.name, OAUTH_CLIENT_NAME, 'device.name is correct');
        assert.equal(device.type, 'mobile', 'device.type is correct');
        assert.equal(
          device.pushCallback,
          undefined,
          'device.pushCallback is empty'
        );
        assert.equal(
          device.pushPublicKey,
          undefined,
          'device.pushPublicKey is empty'
        );
        assert.equal(
          device.pushAuthKey,
          undefined,
          'device.pushAuthKey is empty'
        );
        assert.equal(
          device.pushEndpointExpired,
          false,
          'device.pushEndpointExpired is false'
        );

        return client.devicesWithRefreshToken(refreshToken2);
      })
      .then(devices => {
        assert.equal(devices.length, 1);
        assert.equal(
          devices[0].name,
          OAUTH_CLIENT_NAME,
          'device.name is correct'
        );
        assert.equal(devices[0].type, 'mobile', 'device.type is correct');
      });
  });

  it('device registration without required name parameter', () => {
    return oauthServerDb
      .generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      })
      .then(refresh => {
        refreshToken = refresh.token.toString('hex');
        return client.updateDeviceWithRefreshToken(refreshToken, {
          type: 'mobile',
        });
      })
      .then(device => {
        assert.ok(device.id, 'device.id was set');
        assert.ok(device.createdAt > 0, 'device.createdAt was set');
        assert.equal(device.name, OAUTH_CLIENT_NAME, 'device.name is correct');
        assert.equal(device.type, 'mobile', 'device.type is correct');
      });
  });

  it('sets isCurrentDevice correctly', async () => {
    const generateTokenInfo = {
      clientId: buf(PUBLIC_CLIENT_ID),
      userId: buf(client.uid),
      email: client.email,
      scope: 'profile https://identity.mozilla.com/apps/oldsync',
    };
    const refreshToken = await oauthServerDb.generateRefreshToken(
      generateTokenInfo
    );
    const refreshToken2 = await oauthServerDb.generateRefreshToken(
      generateTokenInfo
    );
    const deviceInfo = { name: 'first device' };
    const deviceInfo2 = { name: 'second device' };
    await client.updateDeviceWithRefreshToken(
      refreshToken.token.toString('hex'),
      deviceInfo
    );
    await client.updateDeviceWithRefreshToken(
      refreshToken2.token.toString('hex'),
      deviceInfo2
    );

    const devices = await client.devicesWithRefreshToken(
      refreshToken.token.toString('hex')
    );
    assert.equal(devices.length, 2);
    if (devices[0].name === deviceInfo.name) {
      // database results are unordered, swap them if necessary
      const swap = {};
      Object.keys(devices[0]).forEach(key => {
        swap[key] = devices[0][key];
        devices[0][key] = devices[1][key];
        devices[1][key] = swap[key];
      });
    }
    assert.equal(devices[0].isCurrentDevice, false);
    assert.equal(devices[0].name, deviceInfo2.name);
    assert.equal(devices[1].isCurrentDevice, true);
    assert.equal(devices[1].name, deviceInfo.name);
  });

  it('does not allow non-public clients', () => {
    return oauthServerDb
      .generateRefreshToken({
        clientId: buf(NON_PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      })
      .then(refresh => {
        refreshToken = refresh.token.toString('hex');
        return client.updateDeviceWithRefreshToken(refreshToken, {
          type: 'mobile',
        });
      })
      .then(
        () => assert.fail('must fail'),
        err => {
          assert.equal(err.message, 'Not a public client');
          assert.equal(err.errno, 166, 'Uses the auth-server errno');
        }
      );
  });

  it('throws conflicting device errors', () => {
    const conflictingDeviceInfo = {
      id: crypto.randomBytes(16).toString('hex'),
      name: 'Device',
    };

    return oauthServerDb
      .generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      })
      .then(refresh => {
        refreshToken = refresh.token.toString('hex');
        conflictingDeviceInfo.refreshTokenId = refreshToken;

        return db.createDevice(client.uid, conflictingDeviceInfo);
      })
      .then(() => {
        conflictingDeviceInfo.id = crypto.randomBytes(16).toString('hex');
        return db.createDevice(client.uid, conflictingDeviceInfo);
      })
      .then(
        () => assert.fail('must fail'),
        err => {
          assert.equal(
            err.message,
            'Session already registered by another device'
          );
        }
      );
  });
});
