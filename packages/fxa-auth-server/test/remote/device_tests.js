/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var config = require('../../config').getProperties()
var crypto = require('crypto')

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
        name: 'test device',
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
