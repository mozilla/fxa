/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')
var extend = require('util')._extend

var test = tap.test
var P = require('../../lib/promise')
var mockUid = new Buffer('foo')
var mockLog = {
  error: function () {
  },
  increment: function () {
  },
  trace: function () {
  }
}

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
        'pushPublicKey': '468601214f60f4828b6cd5d51d9d99d212e7c73657978955f0f5a5b7e2fa1370'
      },
      {
        'id': '0f7aa00356e5416e82b3bef7bc409eef',
        'isCurrentDevice': false,
        'lastAccessTime': 1417699471335,
        'name': 'My Desktop',
        'type': null,
        'pushCallback': 'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
        'pushPublicKey': '468601214f60f4828b6cd5d51d9d99d212e7c73657978955f0f5a5b7e2fa1370'
      }
    ])
  }
}

test(
  'notifyUpdate does not throw on empty device result',
  function (t) {
    var thisMockLog = extend({}, mockLog)
    thisMockLog.increment = function (log) {
      if (log === 'push.success') {
        t.fail('must not call push.success')
      }
    }

    try {
      var push = require('../../lib/push')(thisMockLog, mockDbEmpty)
      push.notifyUpdate(mockUid).catch(function (err) {
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
  'notifyUpdate sends notifications',
  function (t) {
    var successCalled = 0
    var thisMockLog = extend({}, mockLog)
    thisMockLog.increment = function (log) {
      if (log === 'push.success') {
        // notification sent
        successCalled++
      }

      if (successCalled === 2) {
        // we should send 2 notifications for 2 devices
        t.end()
      }
    }

    var mocks = {
      request: {
        post: function (url, cb) {
          return cb()
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDbResult)
    push.notifyUpdate(mockUid)
  }
)

test(
  'notifyUpdate catches devices with no push callback',
  function (t) {
    var mockDbNoCallback = {
      devices: function () {
        return P.resolve([{
          'id': 'foo',
          'name': 'My Phone'
        }])
      }
    }

    var thisMockLog = extend({}, mockLog)
    thisMockLog.increment = function (log) {
      if (log === 'push.no_push_callback') {
        // device had no push callback
        t.end()
      }
    }

    var push = require('../../lib/push')(thisMockLog, mockDbNoCallback)
    push.notifyUpdate(mockUid)
  }
)

test(
  'notifyUpdate reports errors when requests fail',
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

    var thisMockLog = extend({}, mockLog)
    thisMockLog.increment = function (log) {
      if (log === 'push.failed') {
        // request failed
        t.end()
      }
    }

    var mocks = {
      request: {
        post: function (url, cb) {
          return cb(new Error('Failed'))
        }
      }
    }

    var push = proxyquire('../../lib/push', mocks)(thisMockLog, mockDb)
    push.notifyUpdate(mockUid)
  }
)
