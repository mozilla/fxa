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

describe('remote device', function() {
  this.timeout(15000)
  let server
  before(() => {
    // HACK: Force-enable devices.lastAccessTime in the spawned server process
    process.env.LASTACCESSTIME_UPDATES_ENABLED = 'true'
    process.env.LASTACCESSTIME_UPDATES_EMAIL_ADDRESSES = '.*'
    process.env.LASTACCESSTIME_UPDATES_SAMPLE_RATE = '1'

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
              name: 'test device',
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
                  return client.destroyDevice(devices[0].id)
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
    'device registration with unsupported characters in the name',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              id: crypto.randomBytes(16).toString('hex'),
              name: 'unicodepooforyou: \uD83D\uDCA9',
              type: 'mobile',
            }
            return client.updateDevice(deviceInfo)
              .then(
                function () {
                  assert(false, 'request should have failed')
                }
              )
              .catch(
                function (err) {
                  assert.equal(err.code, 400, 'err.code was 400')
                  assert.equal(err.errno, 107, 'err.errno was 107')
                  assert.equal(err.validation.keys[0], 'name', 'name was rejected')
                }
              )
          }
        )
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
        pushCallback: 'https://foo/bar',
        pushPublicKey: base64url(Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])),
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
                return client.updateDevice({
                  id: client.device.id,
                  pushCallback: 'https://bar/foo'
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
                assert.equal(devices[0].pushCallback, 'https://bar/foo', 'devices returned correct pushCallback')
                assert.equal(devices[0].pushPublicKey, '', 'devices returned newly empty pushPublicKey')
                assert.equal(devices[0].pushAuthKey, '', 'devices returned newly empty pushAuthKey')
              }
            )
        }
      )
    }
  )

  it(
    // Regression test for https://github.com/mozilla/fxa-auth-server/issues/1197
    'devices list, sessionToken.lastAccessTime === 0 (regression test for #1197)',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'mobile'
      }
      return Client.create(config.publicUrl, email, password, {
        createdAt: '0'
      })
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
                assert.equal(devices.length, 1, 'devices returned one item')
                assert.strictEqual(devices[0].lastAccessTime, 0, 'devices returned correct lastAccessTime')
                assert.strictEqual(devices[0].lastAccessTimeFormatted, '',
                  'devices returned empty lastAccessTimeFormatted because lastAccesstime is 0')
                assert.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                assert.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                return client.destroyDevice(devices[0].id)
              }
            )
        }
      )
    }
  )

  it(
    'devices list, sessionToken.lastAccessTime === -1',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password, {
        createdAt: '-1'
      })
      .then(
        () => assert(false),
        err => {
          assert.equal(err.code, 400)
        }
      )

    }
  )

  it(
    'devices list, sessionToken.lastAccessTime === THE FUTURE',
    () => {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'mobile'
      }
      var theFuture = Date.now() + 10000
      return Client.create(config.publicUrl, email, password, {
        createdAt: '' + theFuture
      })
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
                assert.equal(devices.length, 1, 'devices returned one item')
                assert.ok(devices[0].lastAccessTime > 0, 'devices returned correct lastAccessTime')
                assert.ok(devices[0].lastAccessTime < theFuture, 'devices returned correct lastAccessTime')
                assert.strictEqual(devices[0].lastAccessTimeFormatted, 'a few seconds ago',
                  'devices returned correct lastAccessTimeFormatted')
                assert.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                assert.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                return client.destroyDevice(devices[0].id)
              }
            )
        }
      )
    }
  )

  after(() => {
    delete process.env.LASTACCESSTIME_UPDATES_ENABLED
    delete process.env.LASTACCESSTIME_UPDATES_EMAIL_ADDRESSES
    delete process.env.LASTACCESSTIME_UPDATES_SAMPLE_RATE

    return TestServer.stop(server)
  })
})
