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
  'notifyUpdate sends notifications using a real push server',
  function (t) {

    pushManager.getSubscription().then(function (subscription) {
      var mockDbResult = {
        devices: function (/* uid */) {
          return P.resolve([
            {
              'id': '0f7aa00356e5416e82b3bef7bc409eef',
              'isCurrentDevice': true,
              'lastAccessTime': 1449235471335,
              'name': 'My Phone',
              'type': 'mobile',
              'pushCallback': subscription.endpoint
            }
          ])
        }
      }

      var thisMockLog = mockLog({
        increment: function (log) {
          if (log === 'push.success') {
            t.end()
          }
        }
      })

      var push = proxyquire('../../lib/push', {})(thisMockLog, mockDbResult)
      push.notifyUpdate(mockUid)

    })
  }
)
