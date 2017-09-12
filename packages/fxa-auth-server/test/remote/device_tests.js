/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()
var config = require('../../config').getProperties()
var crypto = require('crypto')
var base64url = require('base64url')
var P = require('../../lib/promise')
var mocks = require('../mocks')

describe('remote device', function() {
  this.timeout(15000)
  let server
  before(() => {
    config.lastAccessTimeUpdates = {
      enabled: true,
      enabledEmailAddresses: /.*/g,
      sampleRate: 1
    }

    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'device registration after account creation',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              name: 'test device 🍓🔥在𝌆',
              type: 'mobile',
              pushCallback: '',
              pushPublicKey: '',
              pushAuthKey: ''
            }
            return client.devices()
              .then(
                function (devices) {
                  assert.equal(devices.length, 0, 'devices returned no items')
                  return client.updateDevice(deviceInfo)
                }
              )
              .then(
                function (device) {
                  assert.ok(device.id, 'device.id was set')
                  assert.ok(device.createdAt > 0, 'device.createdAt was set')
                  assert.equal(device.name, deviceInfo.name, 'device.name is correct')
                  assert.equal(device.type, deviceInfo.type, 'device.type is correct')
                  assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
                  assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
                  assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
                  assert.equal(device.pushEndpointExpired, false, 'device.pushEndpointExpired is correct')
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  assert.equal(devices.length, 1, 'devices returned one item')
                  assert.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                  assert.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                  assert.equal(devices[0].pushCallback, '', 'devices returned empty pushCallback')
                  assert.equal(devices[0].pushPublicKey, '', 'devices returned correct pushPublicKey')
                  assert.equal(devices[0].pushAuthKey, '', 'devices returned correct pushAuthKey')
                  assert.equal(devices[0].pushEndpointExpired, '', 'devices returned correct pushEndpointExpired')
                  return client.destroyDevice(devices[0].id)
                }
              )
          }
        )
    }
  )

  it(
    'device registration without optional parameters',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              name: 'test device',
              type: 'mobile'
            }
            return client.devices()
              .then(
                function (devices) {
                  assert.equal(devices.length, 0, 'devices returned no items')
                  return client.updateDevice(deviceInfo)
                }
              )
              .then(
                function (device) {
                  assert.ok(device.id, 'device.id was set')
                  assert.ok(device.createdAt > 0, 'device.createdAt was set')
                  assert.equal(device.name, deviceInfo.name, 'device.name is correct')
                  assert.equal(device.type, deviceInfo.type, 'device.type is correct')
                  assert.equal(device.pushCallback, undefined, 'device.pushCallback is undefined')
                  assert.equal(device.pushPublicKey, undefined, 'device.pushPublicKey is undefined')
                  assert.equal(device.pushAuthKey, undefined, 'device.pushAuthKey is undefined')
                  assert.equal(device.pushEndpointExpired, false, 'device.pushEndpointExpired is false')
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  assert.equal(devices.length, 1, 'devices returned one item')
                  assert.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                  assert.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                  assert.equal(devices[0].pushCallback, null, 'devices returned undefined pushCallback')
                  assert.equal(devices[0].pushPublicKey, null, 'devices returned undefined pushPublicKey')
                  assert.equal(devices[0].pushAuthKey, null, 'devices returned undefined pushAuthKey')
                  assert.equal(devices[0].pushEndpointExpired, false, 'devices returned false pushEndpointExpired')
                  return client.destroyDevice(devices[0].id)
                }
              )
          }
        )
    }
  )

  it(
    'device registration with unicode characters in the name',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              // That's a beta, and a CJK character from https://bugzilla.mozilla.org/show_bug.cgi?id=1348298
              name: 'Firefox \u5728 \u03b2 test',
              type: 'desktop',
            }
            return client.updateDevice(deviceInfo)
              .then(
                function (device) {
                  assert.ok(device.id, 'device.id was set')
                  assert.ok(device.createdAt > 0, 'device.createdAt was set')
                  assert.equal(device.name, deviceInfo.name, 'device.name is correct')
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  assert.equal(devices.length, 1, 'devices returned one item')
                  assert.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                }
              )
          }
        )
    }
  )

  it(
    'device registration without required name parameter',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            return client.updateDevice({ type: 'mobile' })
              .then(
                function (r) {
                  assert(false, 'request should have failed')
                }
              )
              .catch(
                function (err) {
                  assert.equal(err.code, 400, 'err.code was 400')
                  assert.equal(err.errno, 108, 'err.errno was 108')
                }
              )
          }
        )
    }
  )

  it(
    'device registration without required type parameter',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            return client.updateDevice({ name: 'test device' })
              .then(
                function () {
                  assert(false, 'request should have failed')
                }
              )
              .catch(
                function (err) {
                  assert.equal(err.code, 400, 'err.code was 400')
                  assert.equal(err.errno, 108, 'err.errno was 108')
                }
              )
          }
        )
    }
  )

  it(
    'update device fails with bad callbackUrl',
    () => {
      var badPushCallback = 'https://updates.push.services.mozilla.com.different-push-server.technology'
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'test device',
        type: 'desktop',
        pushCallback: badPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            return client.updateDevice(deviceInfo)
              .then(
                function (r) {
                  assert(false, 'request should have failed')
                }
              )
              .catch(
                function (err) {
                  assert.equal(err.code, 400, 'err.code was 400')
                  assert.equal(err.errno, 107, 'err.errno was 107, invalid parameter')
                  assert.equal(err.validation.keys[0], 'pushCallback', 'bad pushCallback caught in validation')
                }
              )
          })
    }
  )

  it(
    'update device works with stage servers',
    () => {
      var goodPushCallback = 'https://updates-autopush.stage.mozaws.net'
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              name: 'test device',
              type: 'mobile',
              pushCallback: goodPushCallback,
              pushPublicKey: '',
              pushAuthKey: ''
            }
            return client.devices()
              .then(
                function (devices) {
                  assert.equal(devices.length, 0, 'devices returned no items')
                  return client.updateDevice(deviceInfo)
                }
              )
              .then(
                function (device) {
                  assert.ok(device.id, 'device.id was set')
                  assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
                }
              )
              .catch(
                function (err) {
                  assert.fail(err, 'request should have worked')
                }
              )
          })
    }
  )

  it(
    'update device works with dev servers',
    () => {
      var goodPushCallback = 'https://updates-autopush.dev.mozaws.net'
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              name: 'test device',
              type: 'mobile',
              pushCallback: goodPushCallback,
              pushPublicKey: '',
              pushAuthKey: ''
            }
            return client.devices()
              .then(
                function (devices) {
                  assert.equal(devices.length, 0, 'devices returned no items')
                  return client.updateDevice(deviceInfo)
                }
              )
              .then(
                function (device) {
                  assert.ok(device.id, 'device.id was set')
                  assert.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
                }
              )
              .catch(
                function (err) {
                  assert.fail(err, 'request should have worked')
                }
              )
          })
    }
  )

  it(
    'update device fails with bad dev callbackUrl',
    () => {
      var badPushCallback = 'https://evil.mozaws.net'
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'test device',
        type: 'desktop',
        pushCallback: badPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            return client.updateDevice(deviceInfo)
              .then(
                function (r) {
                  assert(false, 'request should have failed')
                }
              )
              .catch(
                function (err) {
                  assert.equal(err.code, 400, 'err.code was 400')
                  assert.equal(err.errno, 107, 'err.errno was 107, invalid parameter')
                  assert.equal(err.validation.keys[0], 'pushCallback', 'bad pushCallback caught in validation')
                }
              )
          })
    }
  )

  it(
    'device registration from a different session',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = [
        {
          name: 'first device',
          type: 'mobile'
        },
        {
          name: 'second device',
          type: 'desktop'
        }
      ]
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (client) {
            return Client.login(config.publicUrl, email, password)
              .then(
                function (secondClient) {
                  return secondClient.updateDevice(deviceInfo[0])
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  assert.equal(devices.length, 1, 'devices returned one item')
                  assert.equal(devices[0].isCurrentDevice, false, 'devices returned false isCurrentDevice')
                  assert.equal(devices[0].name, deviceInfo[0].name, 'devices returned correct name')
                  assert.equal(devices[0].type, deviceInfo[0].type, 'devices returned correct type')
                  return client.updateDevice(deviceInfo[1])
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  assert.equal(devices.length, 2, 'devices returned two items')
                  if (devices[0].name === deviceInfo[1].name) {
                    // database results are unordered, swap them if necessary
                    var swap = {}
                    Object.keys(devices[0]).forEach(function (key) {
                      swap[key] = devices[0][key]
                      devices[0][key] = devices[1][key]
                      devices[1][key] = swap[key]
                    })
                  }
                  assert.equal(devices[0].isCurrentDevice, false, 'devices returned false isCurrentDevice for first item')
                  assert.equal(devices[0].name, deviceInfo[0].name, 'devices returned correct name for first item')
                  assert.equal(devices[0].type, deviceInfo[0].type, 'devices returned correct type for first item')
                  assert.equal(devices[1].isCurrentDevice, true, 'devices returned true isCurrentDevice for second item')
                  assert.equal(devices[1].name, deviceInfo[1].name, 'devices returned correct name for second item')
                  assert.equal(devices[1].type, deviceInfo[1].type, 'devices returned correct type for second item')
                  return P.all([
                    client.destroyDevice(devices[0].id),
                    client.destroyDevice(devices[1].id)
                  ])
                }
              )
          }
        )
    }
  )

  it(
    'update device with callbackUrl but without keys resets the keys',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'desktop',
        pushCallback: 'https://updates.push.services.mozilla.com/qux',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      return Client.create(config.publicUrl, email, password)
      .then(
        function (client) {
          return client.updateDevice(deviceInfo)
            .then(
              function () {
                return client.devices()
              }
            )
            .then(
              function (devices) {
                assert.equal(devices[0].pushCallback, deviceInfo.pushCallback, 'devices returned correct pushCallback')
                assert.equal(devices[0].pushPublicKey, deviceInfo.pushPublicKey, 'devices returned correct pushPublicKey')
                assert.equal(devices[0].pushAuthKey, deviceInfo.pushAuthKey, 'devices returned correct pushAuthKey')
                assert.equal(devices[0].pushEndpointExpired, false, 'devices returned correct pushEndpointExpired')
                return client.updateDevice({
                  id: client.device.id,
                  pushCallback: 'https://updates.push.services.mozilla.com/foo'
                })
              }
            )
            .then(
              function () {
                return client.devices()
              }
            )
            .then(
              function (devices) {
                assert.equal(devices[0].pushCallback, 'https://updates.push.services.mozilla.com/foo', 'devices returned correct pushCallback')
                assert.equal(devices[0].pushPublicKey, '', 'devices returned newly empty pushPublicKey')
                assert.equal(devices[0].pushAuthKey, '', 'devices returned newly empty pushAuthKey')
                assert.equal(devices[0].pushEndpointExpired, false, 'devices returned false pushEndpointExpired')
              }
            )
        }
      )
    }
  )

  it(
    'invalid public keys are cleanly rejected',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      var invalidPublicKey = Buffer.alloc(65)
      invalidPublicKey.fill('\0')
      var deviceInfo = {
        name: 'test device',
        type: 'desktop',
        pushCallback: 'https://updates.push.services.mozilla.com/qux',
        pushPublicKey: base64url(invalidPublicKey),
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then(
        function (client) {
          return client.updateDevice(deviceInfo)
            .then(
              function () {
                assert(false, 'request should have failed')
              },
              function (err) {
                assert.equal(err.code, 400, 'err.code was 400')
                assert.equal(err.errno, 107, 'err.errno was 107')
              }
            )
            // A rather strange nodejs bug means that invalid push keys
            // can cause a subsequent /certificate/sign to fail.
            // Test that we've successfully mitigated that bug.
            .then(
              function () {
                var publicKey = {
                  'algorithm': 'RS',
                  'n': '4759385967235610503571494339196749614544606692567785' +
                       '7909539347682027142806529730913413168629935827890798' +
                       '72007974809511698859885077002492642203267408776123',
                  'e': '65537'
                }
                return client.sign(publicKey, 1000 * 60 * 5)
              }
            )
            .then(
              function (cert) {
                assert.equal(typeof(cert), 'string', 'cert was successfully signed')
              }
            )
        }
      )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
