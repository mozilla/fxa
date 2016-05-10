/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var test = tap.test
var P = require('../../lib/promise')
var mockLog = require('../mocks').mockLog
var mockUid = new Buffer('foo')

var mockDbEmpty = {
  devices: function () {
    return P.resolve([])
  }
}

var mockDbResult = {
  devices: function (/* uid */) {
    return P.resolve([
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
    ])
  }
}

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
  'pushToDevices sends notifications',
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
    push.pushToDevices(mockUid, 'accountVerify')
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

    mockDbResult.devices().then(function(devices) {
      var push = proxyquire('../../lib/push', mocks)(mockLog(), mockDbResult)
      push.pushToDevices(mockUid, 'accountVerify', null, [devices[0].id])
    })
  }
)

test(
  'pushToDevices sends data',
  function (t) {
    var count = 0
    var mocks = {
      'web-push': {
        sendNotification: function (endpoint, params) {
          count++
          t.ok(params.userPublicKey)
          t.ok(params.userAuth)
          t.deepEqual(params.payload, new Buffer('foobar'))
          if (count === 2) {
            t.end()
          }
          return P.resolve()
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(mockLog(), mockDbResult)
    push.pushToDevices(mockUid, 'accountVerify', new Buffer('foobar'))
  }
)

test(
  'pushToDevices fails if data is present but both keys are not present',
  function (t) {
    var mockDbNoKeys = {
      devices: function () {
        return P.resolve([{
          'id': 'foo',
          'name': 'My Phone',
          'pushCallback': 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
          'pushAuthKey': 'bogus'
        }])
      }
    }

    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.data_but_no_keys') {
          // data detected but device had no keys
          t.end()
        }
      }
    })

    var push = require('../../lib/push')(thisMockLog, mockDbNoKeys)
    push.pushToDevices(mockUid, 'accountVerify', new Buffer('foobar'))
  }
)

test(
  'pushToDevices catches devices with no push callback',
  function (t) {
    var mockDbNoCallback = {
      devices: function () {
        return P.resolve([{
          'id': 'foo',
          'name': 'My Phone'
        }])
      }
    }

    var thisMockLog = mockLog({
      info: function (log) {
        if (log.name === 'push.account_verify.no_push_callback') {
          // device had no push callback
          t.end()
        }
      }
    })

    var push = require('../../lib/push')(thisMockLog, mockDbNoCallback)
    push.pushToDevices(mockUid, 'accountVerify')
  }
)

test(
  'pushToDevices reports errors when web-push fails',
  function (t) {
    var mockDb = {
      devices: function (/* uid */) {
        return P.resolve([
          {
            'id': 'foo',
            'pushCallback': 'https://example.com',
          }
        ])
      }
    }

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

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDb)
    push.pushToDevices(mockUid, 'accountVerify')
  }
)

test(
  'pushToDevices resets device push data when push server responds with a 400 level error',
  function (t) {
    var mockDb = {
      devices: function (/* uid */) {
        return P.resolve([
          {
            'id': 'foo',
            'pushCallback': 'https://example.com',
          }
        ])
      },
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
    push.pushToDevices(mockUid, 'accountVerify')
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

