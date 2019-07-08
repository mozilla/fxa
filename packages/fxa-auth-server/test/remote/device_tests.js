/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
const crypto = require('crypto');
const base64url = require('base64url');
const P = require('../../lib/promise');
const mocks = require('../mocks');

describe('remote device', function() {
  this.timeout(15000);
  let server;
  before(() => {
    config.lastAccessTimeUpdates = {
      enabled: true,
      sampleRate: 1,
      earliestSaneTimestamp: config.lastAccessTimeUpdates.earliestSaneTimestamp,
    };

    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('device registration after account creation', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device 🍓🔥在𝌆',
        type: 'mobile',
        availableCommands: { foo: 'bar' },
        pushCallback: '',
        pushPublicKey: '',
        pushAuthKey: '',
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.ok(device.createdAt > 0, 'device.createdAt was set');
          assert.equal(device.name, deviceInfo.name, 'device.name is correct');
          assert.equal(device.type, deviceInfo.type, 'device.type is correct');
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
        })
        .then(() => {
          return client.devices();
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
            '',
            'devices returned empty pushCallback'
          );
          assert.equal(
            devices[0].pushPublicKey,
            '',
            'devices returned correct pushPublicKey'
          );
          assert.equal(
            devices[0].pushAuthKey,
            '',
            'devices returned correct pushAuthKey'
          );
          assert.equal(
            devices[0].pushEndpointExpired,
            '',
            'devices returned correct pushEndpointExpired'
          );
          return client.destroyDevice(devices[0].id);
        });
    });
  });

  it('device registration without optional parameters', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.ok(device.createdAt > 0, 'device.createdAt was set');
          assert.equal(device.name, deviceInfo.name, 'device.name is correct');
          assert.equal(device.type, deviceInfo.type, 'device.type is correct');
          assert.equal(
            device.pushCallback,
            undefined,
            'device.pushCallback is undefined'
          );
          assert.equal(
            device.pushPublicKey,
            undefined,
            'device.pushPublicKey is undefined'
          );
          assert.equal(
            device.pushAuthKey,
            undefined,
            'device.pushAuthKey is undefined'
          );
          assert.equal(
            device.pushEndpointExpired,
            false,
            'device.pushEndpointExpired is false'
          );
        })
        .then(() => {
          return client.devices();
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
          assert.equal(
            devices[0].pushCallback,
            undefined,
            'devices returned undefined pushCallback'
          );
          assert.equal(
            devices[0].pushPublicKey,
            undefined,
            'devices returned undefined pushPublicKey'
          );
          assert.equal(
            devices[0].pushAuthKey,
            undefined,
            'devices returned undefined pushAuthKey'
          );
          assert.equal(
            devices[0].pushEndpointExpired,
            false,
            'devices returned false pushEndpointExpired'
          );
          return client.destroyDevice(devices[0].id);
        });
    });
  });

  it('device registration with unicode characters in the name', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        // That's a beta, and a CJK character from https://bugzilla.mozilla.org/show_bug.cgi?id=1348298
        name: 'Firefox \u5728 \u03b2 test',
        type: 'desktop',
      };
      return client
        .updateDevice(deviceInfo)
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.ok(device.createdAt > 0, 'device.createdAt was set');
          assert.equal(device.name, deviceInfo.name, 'device.name is correct');
        })
        .then(() => {
          return client.devices();
        })
        .then(devices => {
          assert.equal(devices.length, 1, 'devices returned one item');
          assert.equal(
            devices[0].name,
            deviceInfo.name,
            'devices returned correct name'
          );
        });
    });
  });

  it('device registration without required name parameter', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      return client.updateDevice({ type: 'mobile' }).then(device => {
        assert.ok(device.id, 'device.id was set');
        assert.ok(device.createdAt > 0, 'device.createdAt was set');
        assert.equal(device.name, '', 'device.name is empty');
        assert.equal(device.type, 'mobile', 'device.type is correct');
      });
    });
  });

  it('device registration without required type parameter', () => {
    const email = server.uniqueEmail();
    const deviceName = 'test device';
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      return client.updateDevice({ name: 'test device' }).then(device => {
        assert.ok(device.id, 'device.id was set');
        assert.ok(device.createdAt > 0, 'device.createdAt was set');
        assert.equal(device.name, deviceName, 'device.name is correct');
      });
    });
  });

  it('update device fails with bad callbackUrl', () => {
    const badPushCallback =
      'https://updates.push.services.mozilla.com.different-push-server.technology';
    const email = server.uniqueEmail();
    const password = 'test password';
    const deviceInfo = {
      id: crypto.randomBytes(16).toString('hex'),
      name: 'test device',
      type: 'desktop',
      availableCommands: {},
      pushCallback: badPushCallback,
      pushPublicKey: mocks.MOCK_PUSH_KEY,
      pushAuthKey: base64url(crypto.randomBytes(16)),
    };
    return Client.create(config.publicUrl, email, password).then(client => {
      return client
        .updateDevice(deviceInfo)
        .then(r => {
          assert(false, 'request should have failed');
        })
        .catch(err => {
          assert.equal(err.code, 400, 'err.code was 400');
          assert.equal(err.errno, 107, 'err.errno was 107, invalid parameter');
          assert.equal(
            err.validation.keys[0],
            'pushCallback',
            'bad pushCallback caught in validation'
          );
        });
    });
  });

  it('update device fails with non-normalized callbackUrl', () => {
    const badPushCallback =
      'https://updates.push.services.mozilla.com/invalid/\u010D/char';
    const email = server.uniqueEmail();
    const password = 'test password';
    const deviceInfo = {
      id: crypto.randomBytes(16).toString('hex'),
      name: 'test device',
      type: 'desktop',
      availableCommands: {},
      pushCallback: badPushCallback,
      pushPublicKey: mocks.MOCK_PUSH_KEY,
      pushAuthKey: base64url(crypto.randomBytes(16)),
    };
    return Client.create(config.publicUrl, email, password).then(client => {
      return client
        .updateDevice(deviceInfo)
        .then(r => {
          assert(false, 'request should have failed');
        })
        .catch(err => {
          assert.equal(err.code, 400, 'err.code was 400');
          assert.equal(err.errno, 107, 'err.errno was 107, invalid parameter');
          assert.equal(
            err.validation.keys[0],
            'pushCallback',
            'bad pushCallback caught in validation'
          );
        });
    });
  });

  it('update device works with stage servers', () => {
    const goodPushCallback = 'https://updates-autopush.stage.mozaws.net';
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        availableCommands: {},
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.equal(
            device.pushCallback,
            deviceInfo.pushCallback,
            'device.pushCallback is correct'
          );
        })
        .catch(err => {
          assert.fail(err, 'request should have worked');
        });
    });
  });

  it('update device works with dev servers', () => {
    const goodPushCallback = 'https://updates-autopush.dev.mozaws.net';
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.equal(
            device.pushCallback,
            deviceInfo.pushCallback,
            'device.pushCallback is correct'
          );
        })
        .catch(err => {
          assert.fail(err, 'request should have worked');
        });
    });
  });

  it('update device works with callback urls that :443 as a port', () => {
    const goodPushCallback =
      'https://updates.push.services.mozilla.com:443/wpush/v1/gAAAAABbkq0Eafe6IANS4OV3pmoQ5Z8AhqFSGKtozz5FIvu0CfrTGmcv07CYziPaysTv_9dgisB0yr3UjEIlGEyoprRFX1WU5VA4nG-9tofPdA3FYREPf6xh3JL1qBhTa9mEFS2dSn--';

    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.equal(
            device.pushCallback,
            deviceInfo.pushCallback,
            'device.pushCallback is correct'
          );
        })
        .catch(err => {
          assert.fail(err, 'request should have worked');
        });
    });
  });

  it('update device works with callback urls that :4430 as a port', () => {
    const goodPushCallback = 'https://updates.push.services.mozilla.com:4430';
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.equal(
            device.pushCallback,
            deviceInfo.pushCallback,
            'device.pushCallback is correct'
          );
        })
        .catch(err => {
          assert.fail(err, 'request should have worked');
        });
    });
  });

  it('update device works with callback urls that a custom port', () => {
    const goodPushCallback = 'https://updates.push.services.mozilla.com:10332';
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };
      return client
        .devices()
        .then(devices => {
          assert.equal(devices.length, 0, 'devices returned no items');
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.ok(device.id, 'device.id was set');
          assert.equal(
            device.pushCallback,
            deviceInfo.pushCallback,
            'device.pushCallback is correct'
          );
        })
        .catch(err => {
          assert.fail(err, 'request should have worked');
        });
    });
  });

  it('update device fails with bad dev callbackUrl', () => {
    const badPushCallback = 'https://evil.mozaws.net';
    const email = server.uniqueEmail();
    const password = 'test password';
    const deviceInfo = {
      id: crypto.randomBytes(16).toString('hex'),
      name: 'test device',
      type: 'desktop',
      pushCallback: badPushCallback,
      pushPublicKey: mocks.MOCK_PUSH_KEY,
      pushAuthKey: base64url(crypto.randomBytes(16)),
    };
    return Client.create(config.publicUrl, email, password).then(client => {
      return client
        .updateDevice(deviceInfo)
        .then(r => {
          assert(false, 'request should have failed');
        })
        .catch(err => {
          assert.equal(err.code, 400, 'err.code was 400');
          assert.equal(err.errno, 107, 'err.errno was 107, invalid parameter');
          assert.equal(
            err.validation.keys[0],
            'pushCallback',
            'bad pushCallback caught in validation'
          );
        });
    });
  });

  it('device registration ignores deprecated "capabilities" field', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.create(config.publicUrl, email, password).then(client => {
      const deviceInfo = {
        name: 'a very capable device',
        type: 'desktop',
        capabilities: [],
      };
      return client.updateDevice(deviceInfo).then(device => {
        assert.ok(device.id, 'device.id was set');
        assert.ok(device.createdAt > 0, 'device.createdAt was set');
        assert.equal(device.name, deviceInfo.name, 'device.name is correct');
        assert.ok(!device.capabilities, 'device.capabilities was ignored');
      });
    });
  });

  it('device registration from a different session', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const deviceInfo = [
      {
        name: 'first device',
        type: 'mobile',
      },
      {
        name: 'second device',
        type: 'desktop',
      },
    ];
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    ).then(client => {
      return Client.login(config.publicUrl, email, password)
        .then(secondClient => {
          return secondClient.updateDevice(deviceInfo[0]);
        })
        .then(() => {
          return client.devices();
        })
        .then(devices => {
          assert.equal(devices.length, 1, 'devices returned one item');
          assert.equal(
            devices[0].isCurrentDevice,
            false,
            'devices returned false isCurrentDevice'
          );
          assert.equal(
            devices[0].name,
            deviceInfo[0].name,
            'devices returned correct name'
          );
          assert.equal(
            devices[0].type,
            deviceInfo[0].type,
            'devices returned correct type'
          );
          return client.updateDevice(deviceInfo[1]);
        })
        .then(() => {
          return client.devices();
        })
        .then(devices => {
          assert.equal(devices.length, 2, 'devices returned two items');
          if (devices[0].name === deviceInfo[1].name) {
            // database results are unordered, swap them if necessary
            const swap = {};
            Object.keys(devices[0]).forEach(key => {
              swap[key] = devices[0][key];
              devices[0][key] = devices[1][key];
              devices[1][key] = swap[key];
            });
          }
          assert.equal(
            devices[0].isCurrentDevice,
            false,
            'devices returned false isCurrentDevice for first item'
          );
          assert.equal(
            devices[0].name,
            deviceInfo[0].name,
            'devices returned correct name for first item'
          );
          assert.equal(
            devices[0].type,
            deviceInfo[0].type,
            'devices returned correct type for first item'
          );
          assert.equal(
            devices[1].isCurrentDevice,
            true,
            'devices returned true isCurrentDevice for second item'
          );
          assert.equal(
            devices[1].name,
            deviceInfo[1].name,
            'devices returned correct name for second item'
          );
          assert.equal(
            devices[1].type,
            deviceInfo[1].type,
            'devices returned correct type for second item'
          );
          return P.all([
            client.destroyDevice(devices[0].id),
            client.destroyDevice(devices[1].id),
          ]);
        });
    });
  });

  it('ensures all device push fields appear together', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const deviceInfo = {
      name: 'test device',
      type: 'desktop',
      pushCallback: 'https://updates.push.services.mozilla.com/qux',
      pushPublicKey: mocks.MOCK_PUSH_KEY,
      pushAuthKey: base64url(crypto.randomBytes(16)),
    };
    return Client.create(config.publicUrl, email, password).then(client => {
      return client
        .updateDevice(deviceInfo)
        .then(() => {
          return client.devices();
        })
        .then(devices => {
          assert.equal(
            devices[0].pushCallback,
            deviceInfo.pushCallback,
            'devices returned correct pushCallback'
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
            false,
            'devices returned correct pushEndpointExpired'
          );
          return client.updateDevice({
            id: client.device.id,
            pushCallback: 'https://updates.push.services.mozilla.com/foo',
          });
        })
        .then(assert.fail, err => {
          assert.equal(err.errno, 107);
          assert.equal(err.message, 'Invalid parameter in request body');
        });
    });
  });

  it('invalid public keys are cleanly rejected', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    const invalidPublicKey = Buffer.alloc(65);
    invalidPublicKey.fill('\0');
    const deviceInfo = {
      name: 'test device',
      type: 'desktop',
      pushCallback: 'https://updates.push.services.mozilla.com/qux',
      pushPublicKey: base64url(invalidPublicKey),
      pushAuthKey: base64url(crypto.randomBytes(16)),
    };
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    ).then(client => {
      return (
        client
          .updateDevice(deviceInfo)
          .then(
            () => {
              assert(false, 'request should have failed');
            },
            err => {
              assert.equal(err.code, 400, 'err.code was 400');
              assert.equal(err.errno, 107, 'err.errno was 107');
            }
          )
          // A rather strange nodejs bug means that invalid push keys
          // can cause a subsequent /certificate/sign to fail.
          // Test that we've successfully mitigated that bug.
          .then(() => {
            const publicKey = {
              algorithm: 'RS',
              n:
                '4759385967235610503571494339196749614544606692567785' +
                '7909539347682027142806529730913413168629935827890798' +
                '72007974809511698859885077002492642203267408776123',
              e: '65537',
            };
            return client.sign(publicKey, 1000 * 60 * 5);
          })
          .then(cert => {
            assert.equal(typeof cert, 'string', 'cert was successfully signed');
          })
      );
    });
  });

  it('device updates can correctly handle upgrades from placeholder record', () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    ).then(client => {
      const deviceInfo = {
        name: 'test device',
      };
      // Sign a certificate to generate a placeholder device record.
      const publicKey = {
        algorithm: 'RS',
        n:
          '4759385967235610503571494339196749614544606692567785' +
          '7909539347682027142806529730913413168629935827890798' +
          '72007974809511698859885077002492642203267408776123',
        e: '65537',
      };
      return client
        .sign(publicKey, 1000 * 60 * 5, undefined, { service: 'sync' })
        .then(() => {
          return client.devices();
        })
        .then(devices => {
          assert.equal(devices.length, 1, 'devices returned 1 item');
          assert.equal(
            devices[0].name,
            '',
            'placeholder device record has an empty name'
          );
          assert.equal(
            devices[0].type,
            'desktop',
            'placeholder device record type defaults to desktop'
          );

          // Now attempt to update the name on the placeholder record.
          deviceInfo.id = devices[0].id;
          return client.updateDevice(deviceInfo);
        })
        .then(device => {
          assert.equal(device.id, deviceInfo.id, 'device.id was set correctly');
          assert.equal(
            device.name,
            deviceInfo.name,
            'device name was updated correctly'
          );
          assert.equal(
            device.type,
            'desktop',
            'device type still defaults to desktop'
          );
        });
    });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
