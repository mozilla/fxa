/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')

var test = tap.test
var P = require('../../lib/promise')
var mockLog = require('../mocks').mockLog
var mockUid = new Buffer('foo')

var PushManager = require('../push_helper').PushManager

var pushManager = new PushManager({
  server: 'wss://push.services.mozilla.com/',
  channelId: '9500b5e6-9954-40d5-8ac1-3920832e781e'
})

test(
  'pushToAllDevices sends notifications using a real push server',
  function (t) {
    t.assert(true, 'Test Skipped. See issue #1368.')
    return t.end()

    pushManager.getSubscription().then(function (subscription) { // eslint-disable-line no-unreachable
      var mockDbResult = {
        devices: function (/* uid */) {
          return P.resolve([
            {
              'id': '0f7aa00356e5416e82b3bef7bc409eef',
              'isCurrentDevice': true,
              'lastAccessTime': 1449235471335,
              'name': 'My Phone',
              'type': 'mobile',
              'pushCallback': subscription.endpoint,
              'pushPublicKey': 'BBXOKjUb84pzws1wionFpfCBjDuCh4-s_1b52WA46K5wYL2gCWEOmFKWn_NkS5nmJwTBuO8qxxdjAIDtNeklvQc',
              'pushAuthKey': 'GSsIiaD2Mr83iPqwFNK4rw'
            }
          ])
        }
      }

      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.success') {
            t.end()
          }
        }
      })

      var push = proxyquire('../../lib/push', {})(thisMockLog, mockDbResult)
      var options = {
        data: new Buffer('foodata')
      }
      push.pushToAllDevices(mockUid, 'accountVerify', options)

    })
  }
)
