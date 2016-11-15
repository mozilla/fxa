/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var proxyquire = require('proxyquire')

var P = require('../../lib/promise')
var config = require('../../config').getProperties()
var spyLog = require('../mocks').spyLog
var mockUid = new Buffer('foo')

var PushManager = require('../push_helper').PushManager

describe('e2e/push', () => {

  let pushManager
  before(() => {
    pushManager = new PushManager({
      server: 'wss://push.services.mozilla.com/',
      channelId: '9500b5e6-9954-40d5-8ac1-3920832e781e'
    })
  })

  it(
    'pushToAllDevices sends notifications using a real push server',
    () => {
      return pushManager.getSubscription().then(function (subscription) { // eslint-disable-line no-unreachable
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
          },
          updateDevice: function () {
            return P.resolve()
          }
        }

        let count = 0
        var thisSpyLog = spyLog({
          info: function (log) {
            if (log.name === 'push.account_verify.success') {
              count++
            }
          }
        })

        var push = proxyquire('../../lib/push', {})(thisSpyLog, mockDbResult, config)
        var options = {
          data: new Buffer('foodata')
        }
        return push.pushToAllDevices(mockUid, 'accountVerify', options).then(function() {
          assert.equal(thisSpyLog.error.callCount, 0, 'No errors should have been logged')
          assert.equal(count, 1)
        })
      })
    }
  )
})
