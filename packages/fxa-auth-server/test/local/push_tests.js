/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var ajv = require('ajv')()
var fs = require('fs')
var path = require('path')

var test = tap.test
var P = require('../../lib/promise')
var mockLog = require('../mocks').mockLog
var mockUid = new Buffer('foo')

var PUSH_PAYLOADS_SCHEMA_PATH = '../../docs/pushpayloads.schema.json'
var TTL = '42'

var mockDbEmpty = {
  devices: function () {
    return P.resolve([])
  }
}

var mockDevices = [
  {
    'id': '0f7aa00356e5416e82b3bef7bc409eef',
    'isCurrentDevice': true,
    'lastAccessTime': 1449235471335,
    'name': 'My Phone',
    'type': 'mobile',
    'pushCallback': 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
    'pushPublicKey': 'BCp93zru09_hab2Bg37LpTNG__Pw6eMPEP2hrQpwuytoj3h4chXpGc-3qqdKyqjuvAiEupsnOd_RLyc7erJHWgA=',
    'pushAuthKey': 'w3b14Zjc-Afj2SDOLOyong=='
  },
  {
    'id': '3a45e6d0dae543qqdKyqjuvAiEupsnOd',
    'isCurrentDevice': false,
    'lastAccessTime': 1417699471335,
    'name': 'My Desktop',
    'type': null,
    'pushCallback': 'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
    'pushPublicKey': 'BCp93zru09_hab2Bg37LpTNG__Pw6eMPEP2hrQpwuytoj3h4chXpGc-3qqdKyqjuvAiEupsnOd_RLyc7erJHWgA=',
    'pushAuthKey': 'w3b14Zjc-Afj2SDOLOyong=='
  }
]

var mockDbResult = {
  devices: function (/* uid */) {
    return P.resolve(mockDevices)
  }
}

test(
  'pushToDevice throws on device not found',
  function (t) {
    var push = require('../../lib/push')(mockLog(), mockDbEmpty)
    sinon.spy(push, 'sendPush')

    push.pushToDevice(mockUid, 'bogusid').then(function () {
      t.fail('must throw')
    }, function(err) {
      t.notOk(push.sendPush.called)
      t.end()
    })
  }
)

test(
  'pushToDevices does not throw on empty device result',
  function (t) {
    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.success') {
          t.fail('must not call push.success')
        }
      }
    })

    try {
      var push = require('../../lib/push')(thisMockLog, mockDbEmpty)
      push.pushToDevices(mockUid).catch(function (err) {
        t.fail('must not throw')
        throw err
      })
    } catch (e) {
      t.fail('must not throw')
    }
    t.end()
  }
)

test(
  'pushToDevices does not send notification to an excluded device',
  function (t) {
    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          t.end()
          return P.resolve()
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(mockLog(), mockDbResult)
    var options = { excludedDeviceIds: [mockDevices[0].id] }
    push.pushToDevices(mockUid, 'accountVerify', options)
  }
)

test(
  'pushToDevices calls sendPush',
  function (t) {
    try {
      var push = require('../../lib/push')(mockLog(), mockDbResult)
      sinon.stub(push, 'sendPush')
      var excluded = [mockDevices[0].id]
      var data = new Buffer('foobar')
      var options = { data: data, excludedDeviceIds: excluded, TTL: TTL }
      push.pushToDevices(mockUid, 'deviceConnected', options).catch(function (err) {
        t.fail('must not throw')
        throw err
      })
      .then(function() {
        t.ok(push.sendPush.calledOnce, 'push was called')
        t.equal(push.sendPush.getCall(0).args[0], mockUid)
        t.deepEqual(push.sendPush.getCall(0).args[1], [mockDevices[1]])
        t.equal(push.sendPush.getCall(0).args[2], 'deviceConnected')
        t.deepEqual(push.sendPush.getCall(0).args[3], { data: data, TTL: TTL })
        push.sendPush.restore()
        t.end()
      })
    } catch (e) {
      t.fail('must not throw')
    }
  }
)

test(
  'pushToDevice calls sendPush',
  function (t) {
    try {
      var push = require('../../lib/push')(mockLog(), mockDbResult)
      sinon.stub(push, 'sendPush')
      var data = new Buffer('foobar')
      var options = { data: data, TTL: TTL }
      push.pushToDevice(mockUid, mockDevices[0].id, 'deviceConnected', options).catch(function (err) {
        t.fail('must not throw')
        throw err
      })
      .then(function() {
        t.ok(push.sendPush.calledOnce, 'push was called')
        t.equal(push.sendPush.getCall(0).args[0], mockUid)
        t.deepEqual(push.sendPush.getCall(0).args[1], [mockDevices[0]])
        t.equal(push.sendPush.getCall(0).args[2], 'deviceConnected')
        t.deepEqual(push.sendPush.getCall(0).args[3], { data: data, TTL: TTL })
        push.sendPush.restore()
        t.end()
      })
    } catch (e) {
      t.fail('must not throw')
    }
  }
)

test(
  'sendPush sends notifications with a TTL of 0',
  function (t) {
    var successCalled = 0
    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.success') {
          // notification sent
          successCalled++
        }

        if (successCalled === 2) {
          // we should send 2 notifications for 2 devices
          t.end()
        }
      }
    })

    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          t.equal(params.TTL, '0', 'sends the proper ttl header')
          return P.resolve()
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDbResult)
    push.sendPush(mockUid, mockDevices, 'accountVerify')
  }
)

test(
  'sendPush sends notifications with user-defined TTL',
  function (t) {
    var successCalled = 0
    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.success') {
          // notification sent
          successCalled++
        }

        if (successCalled === 2) {
          // we should send 2 notifications for 2 devices
          t.end()
        }
      }
    })

    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          t.equal(params.TTL, TTL, 'sends the proper ttl header')
          return P.resolve()
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDbResult)
    var options = { TTL: TTL }
    push.sendPush(mockUid, mockDevices, 'accountVerify', options)
  }
)

test(
  'sendPush sends data',
  function (t) {
    var count = 0
    var data = new Buffer('foobar')
    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          count++
          t.ok(params.userPublicKey)
          t.ok(params.userAuth)
          t.deepEqual(params.payload, data)
          if (count === 2) {
            t.end()
          }
          return P.resolve()
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(mockLog(), mockDbResult)
    var options = { data: data }
    push.sendPush(mockUid, mockDevices, 'accountVerify', options)
  }
)

test(
  'push fails if data is present but both keys are not present',
  function (t) {
    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.data_but_no_keys') {
          // data detected but device had no keys
          t.end()
        }
      }
    })

    var devices = [{
      'id': 'foo',
      'name': 'My Phone',
      'pushCallback': 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
      'pushAuthKey': 'bogus'
    }]

    var push = require('../../lib/push')(thisMockLog, mockDbResult)
    var options = { data: new Buffer('foobar') }
    push.sendPush(mockUid, devices, 'accountVerify', options)
  }
)

test(
  'push catches devices with no push callback',
  function (t) {
    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.no_push_callback') {
          // device had no push callback
          t.end()
        }
      }
    })

    var devices = [{
      'id': 'foo',
      'name': 'My Phone'
    }]

    var push = require('../../lib/push')(thisMockLog, mockDbResult)
    push.sendPush(mockUid, devices, 'accountVerify')
  }
)

test(
  'push reports errors when web-push fails',
  function (t) {
    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.failed') {
          // web-push failed
          t.end()
        }
      }
    })

    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          return P.reject(new Error('Failed'))
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDbResult)
    push.sendPush(mockUid, [mockDevices[0]], 'accountVerify')
  }
)

test(
  'push resets device push data when push server responds with a 400 level error',
  function (t) {
    var mockDb = {
      updateDevice: function () {
        return P.resolve()
      }
    }

    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.reset_settings') {
          // web-push failed
          t.end()
        }
      }
    })

    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          var err = new Error('Failed')
          err.statusCode = 410
          return P.reject(err)
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDb)
    push.sendPush(mockUid, [mockDevices[0]], 'accountVerify')
  }
)

test(
  'notifyUpdate calls pushToDevices',
  function (t) {
    try {
      var push = require('../../lib/push')(mockLog(), mockDbEmpty)
      sinon.spy(push, 'pushToDevices')
      push.notifyUpdate(mockUid, 'passwordReset').catch(function (err) {
        t.fail('must not throw')
        throw err
      })
      .then(function() {
        t.ok(push.pushToDevices.calledOnce, 'pushToDevices was called')
        t.equal(push.pushToDevices.getCall(0).args[0], mockUid)
        t.equal(push.pushToDevices.getCall(0).args[1], 'passwordReset')
        push.pushToDevices.restore()
        t.end()
      })
    } catch (e) {
      t.fail('must not throw')
    }
  }
)

test(
  'notifyUpdate without a 2nd arg calls pushToDevices with a accountVerify reason',
  function (t) {
    try {
      var push = require('../../lib/push')(mockLog(), mockDbEmpty)
      sinon.spy(push, 'pushToDevices')
      push.notifyUpdate(mockUid).catch(function (err) {
        t.fail('must not throw')
        throw err
      })
      .then(function() {
        t.ok(push.pushToDevices.calledOnce, 'pushToDevices was called')
        t.equal(push.pushToDevices.getCall(0).args[0], mockUid)
        t.equal(push.pushToDevices.getCall(0).args[1], 'accountVerify')
        push.pushToDevices.restore()
        t.end()
      })
    } catch (e) {
      t.fail('must not throw')
    }
  }
)

test(
  'notifyDeviceConnected calls pushToDevices',
  function (t) {
    try {
      var push = require('../../lib/push')(mockLog(), mockDbEmpty)
      sinon.spy(push, 'pushToDevices')
      var deviceId = 'gjfkd5434jk5h5fd'
      var deviceName = 'My phone'
      var expectedData = {
        version: 1,
        command: 'fxaccounts:device_connected',
        data: {
          deviceName: deviceName
        }
      }
      push.notifyDeviceConnected(mockUid, deviceName, deviceId).catch(function (err) {
        t.fail('must not throw')
        throw err
      })
      .then(function() {
        t.ok(push.pushToDevices.calledOnce, 'pushToDevices was called')
        t.equal(push.pushToDevices.getCall(0).args[0], mockUid)
        t.equal(push.pushToDevices.getCall(0).args[1], 'deviceConnected')
        var options = push.pushToDevices.getCall(0).args[2]
        var payload = JSON.parse(options.data.toString('utf8'))
        t.deepEqual(payload, expectedData)
        var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
        var schema = JSON.parse(fs.readFileSync(schemaPath))
        t.ok(ajv.validate(schema, payload))
        t.deepEqual(options.excludedDeviceIds, [deviceId])
        push.pushToDevices.restore()
        t.end()
      })
    } catch (e) {
      t.fail('must not throw')
    }
  }
)

test(
  'notifyDeviceDisconnected calls pushToDevice',
  function (t) {
    try {
      var push = require('../../lib/push')(mockLog(), mockDbResult)
      sinon.spy(push, 'pushToDevice')
      var idToDisconnect = mockDevices[0].id
      var expectedData = {
        version: 1,
        command: 'fxaccounts:device_disconnected',
        data: {
          id: idToDisconnect
        }
      }
      push.notifyDeviceDisconnected(mockUid, idToDisconnect).catch(function (err) {
        t.fail('must not throw')
        throw err
      })
      .then(function() {
        t.ok(push.pushToDevice.calledOnce, 'pushToDevice was called')
        t.equal(push.pushToDevice.getCall(0).args[0], mockUid)
        t.equal(push.pushToDevice.getCall(0).args[1], idToDisconnect)
        t.equal(push.pushToDevice.getCall(0).args[2], 'deviceDisconnected')
        var options = push.pushToDevice.getCall(0).args[3]
        var payload = JSON.parse(options.data.toString('utf8'))
        t.deepEqual(payload, expectedData)
        var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
        var schema = JSON.parse(fs.readFileSync(schemaPath))
        t.ok(ajv.validate(schema, payload))
        t.ok(options.TTL, 'TTL should be set')
        push.pushToDevice.restore()
        t.end()
      })
    } catch (e) {
      t.fail('must not throw')
    }
  }
)
