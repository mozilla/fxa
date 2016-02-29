/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var config = require('../../config').getProperties()
var crypto = require('crypto')
var P = require('../../lib/promise')

TestServer.start(config)
.then(function main(server) {
  test(
    'device registration during account creation',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'desktop',
        pushCallback: 'https://foo/bar',
        pushPublicKey: crypto.randomBytes(32).toString('hex')
      }
      return Client.create(config.publicUrl, email, password, { device: deviceInfo })
      .then(
        function (client) {
          t.ok(client.authAt, 'authAt was set')
          t.ok(client.device.id, 'device.id was set')
          t.ok(client.device.createdAt > 0, 'device.createdAt was set')
          t.equal(client.device.name, deviceInfo.name, 'device.name is correct')
          t.equal(client.device.type, deviceInfo.type, 'device.type is correct')
          t.equal(client.device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
          t.deepEqual(client.device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
          return client.devices()
            .then(
              function (devices) {
                t.equal(devices.length, 1, 'devices returned one item')
                t.equal(devices[0].isCurrentDevice, true, 'devices returned true isCurrentDevice')
                t.ok(devices[0].lastAccessTime > 0, 'devices returned positive lastAccessTime')
                t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                t.equal(devices[0].pushCallback, deviceInfo.pushCallback, 'devices returned correct pushCallback')
                t.deepEqual(devices[0].pushPublicKey, deviceInfo.pushPublicKey, 'devices returned correct pushPublicKey')
                return client.updateDevice({
                  id: client.device.id,
                  name: 'new name'
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
                t.equal(devices.length, 1, 'devices returned one item')
                t.equal(devices[0].name, 'new name', 'devices returned correct name')
                t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                t.equal(devices[0].pushCallback, deviceInfo.pushCallback, 'devices returned correct pushCallback')
                t.deepEqual(devices[0].pushPublicKey, deviceInfo.pushPublicKey, 'devices returned correct pushPublicKey')
                return client.destroyDevice(devices[0].id)
              }
            )
            .then(
              function () {
                return client.devices()
              }
            )
            .then(
              function (devices) {
                t.equal(devices.length, 0, 'devices returned no items')
              }
            )
        }
      )
    }
  )

  test(
    'device registration during account login',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'a different device name',
        type: 'mobile',
        pushCallback: '',
        pushPublicKey: ''
      }
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            return Client.login(config.publicUrl, email, password, { device: deviceInfo })
          }
        )
        .then(
          function (client) {
            t.ok(client.device.id, 'device.id was set')
            t.ok(client.device.createdAt > 0, 'device.createdAt was set')
            t.equal(client.device.name, deviceInfo.name, 'device.name is correct')
            t.equal(client.device.type, deviceInfo.type, 'device.type is correct')
            t.equal(client.device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
            t.deepEqual(client.device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
            return client.devices()
              .then(
                function (devices) {
                  t.equal(devices.length, 1, 'devices returned one item')
                  t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                  t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                  t.equal(devices[0].pushCallback, deviceInfo.pushCallback, 'devices returned correct pushCallback')
                  t.deepEqual(devices[0].pushPublicKey, '0000000000000000000000000000000000000000000000000000000000000000', 'devices returned correct pushPublicKey')
                  return client.destroyDevice(devices[0].id)
                }
              )
          }
        )
    }
  )

  test(
    'device registration after account creation',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            var deviceInfo = {
              name: 'test device',
              type: 'mobile',
              pushCallback: '',
              pushPublicKey: ''
            }
            return client.devices()
              .then(
                function (devices) {
                  t.equal(devices.length, 0, 'devices returned no items')
                  return client.updateDevice(deviceInfo)
                }
              )
              .then(
                function (device) {
                  t.ok(device.id, 'device.id was set')
                  t.ok(device.createdAt > 0, 'device.createdAt was set')
                  t.equal(device.name, deviceInfo.name, 'device.name is correct')
                  t.equal(device.type, deviceInfo.type, 'device.type is correct')
                  t.equal(device.pushCallback, deviceInfo.pushCallback, 'device.pushCallback is correct')
                  t.deepEqual(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  t.equal(devices.length, 1, 'devices returned one item')
                  t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                  t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                  t.equal(devices[0].pushCallback, '', 'devices returned empty pushCallback')
                  t.deepEqual(devices[0].pushPublicKey, '0000000000000000000000000000000000000000000000000000000000000000', 'devices returned correct pushPublicKey')
                  return client.destroyDevice(devices[0].id)
                }
              )
          }
        )
    }
  )

  test(
    'device registration without optional parameters',
    function (t) {
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
                  t.equal(devices.length, 0, 'devices returned no items')
                  return client.updateDevice(deviceInfo)
                }
              )
              .then(
                function (device) {
                  t.ok(device.id, 'device.id was set')
                  t.ok(device.createdAt > 0, 'device.createdAt was set')
                  t.equal(device.name, deviceInfo.name, 'device.name is correct')
                  t.equal(device.type, deviceInfo.type, 'device.type is correct')
                  t.equal(device.pushCallback, undefined, 'device.pushCallback is undefined')
                  t.equal(device.pushPublicKey, undefined, 'device.pushPublicKey is undefined')
                }
              )
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  t.equal(devices.length, 1, 'devices returned one item')
                  t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                  t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                  t.equal(devices[0].pushCallback, null, 'devices returned undefined pushCallback')
                  t.equal(devices[0].pushPublicKey, null, 'devices returned undefined pushPublicKey')
                  return client.destroyDevice(devices[0].id)
                }
              )
          }
        )
    }
  )

  test(
    'device registration without required name parameter',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            return client.updateDevice({ type: 'mobile' })
              .then(
                function (r) {
                  t.fail('request should have failed')
                }
              )
              .catch(
                function (err) {
                  t.equal(err.code, 400, 'err.code was 400')
                  t.equal(err.errno, 108, 'err.errno was 108')
                }
              )
          }
        )
    }
  )

  test(
    'device registration without required type parameter',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (client) {
            return client.updateDevice({ name: 'test device' })
              .then(
                function () {
                  t.fail('request should have failed')
                }
              )
              .catch(
                function (err) {
                  t.equal(err.code, 400, 'err.code was 400')
                  t.equal(err.errno, 108, 'err.errno was 108')
                }
              )
          }
        )
    }
  )

  test(
    'device registration from a different session',
    function (t) {
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
            return Client.login(config.publicUrl, email, password, { device: deviceInfo[0] })
              .then(
                function () {
                  return client.devices()
                }
              )
              .then(
                function (devices) {
                  t.equal(devices.length, 1, 'devices returned one item')
                  t.equal(devices[0].isCurrentDevice, false, 'devices returned false isCurrentDevice')
                  t.equal(devices[0].name, deviceInfo[0].name, 'devices returned correct name')
                  t.equal(devices[0].type, deviceInfo[0].type, 'devices returned correct type')
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
                  t.equal(devices.length, 2, 'devices returned two items')
                  if (devices[0].name === deviceInfo[1].name) {
                    // database results are unordered, swap them if necessary
                    var swap = {}
                    Object.keys(devices[0]).forEach(function (key) {
                      swap[key] = devices[0][key]
                      devices[0][key] = devices[1][key]
                      devices[1][key] = swap[key]
                    })
                  }
                  t.equal(devices[0].isCurrentDevice, false, 'devices returned false isCurrentDevice for first item')
                  t.equal(devices[0].name, deviceInfo[0].name, 'devices returned correct name for first item')
                  t.equal(devices[0].type, deviceInfo[0].type, 'devices returned correct type for first item')
                  t.equal(devices[1].isCurrentDevice, true, 'devices returned true isCurrentDevice for second item')
                  t.equal(devices[1].name, deviceInfo[1].name, 'devices returned correct name for second item')
                  t.equal(devices[1].type, deviceInfo[1].type, 'devices returned correct type for second item')
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

  test(
    // Regression test for https://github.com/mozilla/fxa-auth-server/issues/1197
    'devices list, sessionToken.lastAccessTime === 0 (regression test for #1197)',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'mobile'
      }
      return Client.create(config.publicUrl, email, password, {
        createdAt: '0',
        device: deviceInfo
      })
      .then(
        function (client) {
          return client.devices()
            .then(
              function (devices) {
                t.equal(devices.length, 1, 'devices returned one item')
                t.strictEqual(devices[0].lastAccessTime, 0, 'devices returned correct lastAccessTime')
                t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                return client.destroyDevice(devices[0].id)
              }
            )
        }
      )
    }
  )

  test(
    'devices list, sessionToken.lastAccessTime === -1',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'mobile'
      }
      return Client.create(config.publicUrl, email, password, {
        createdAt: '-1',
        device: deviceInfo
      })
      .then(
        function (client) {
          return client.devices()
            .then(
              function (devices) {
                t.equal(devices.length, 1, 'devices returned one item')
                t.ok(devices[0].lastAccessTime > 0, 'devices returned correct lastAccessTime')
                t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                return client.destroyDevice(devices[0].id)
              }
            )
        }
      )
    }
  )

  test(
    'devices list, sessionToken.lastAccessTime === THE FUTURE',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'test password'
      var deviceInfo = {
        name: 'test device',
        type: 'mobile'
      }
      var theFuture = Date.now() + 10000
      return Client.create(config.publicUrl, email, password, {
        createdAt: '' + theFuture,
        device: deviceInfo
      })
      .then(
        function (client) {
          return client.devices()
            .then(
              function (devices) {
                t.equal(devices.length, 1, 'devices returned one item')
                t.ok(devices[0].lastAccessTime > 0, 'devices returned correct lastAccessTime')
                t.ok(devices[0].lastAccessTime < theFuture, 'devices returned correct lastAccessTime')
                t.equal(devices[0].name, deviceInfo.name, 'devices returned correct name')
                t.equal(devices[0].type, deviceInfo.type, 'devices returned correct type')
                return client.destroyDevice(devices[0].id)
              }
            )
        }
      )
    }
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
