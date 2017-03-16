/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')

const EventEmitter = require('events').EventEmitter
const sinon = require('sinon')
const spyLog = require('../../mocks').spyLog
const profileUpdates = require('../../../lib/profile/updates')
const P = require('../../../lib/promise')

const mockDeliveryQueue = new EventEmitter()
mockDeliveryQueue.start = function start() {}

function mockMessage(msg) {
  msg.del = sinon.spy()
  return msg
}

var pushShouldThrow = false
const mockPush = {
  notifyProfileUpdated: sinon.spy(() => {
    if (pushShouldThrow) {
      throw new Error('oops')
    }
    return P.resolve()
  })
}

function mockProfileUpdates(log) {
  return profileUpdates(log)(mockDeliveryQueue, mockPush)
}

describe('profile updates', () => {
  it(
    'should log errors',
    () => {
      pushShouldThrow = true
      const mockLog = spyLog()
      return mockProfileUpdates(mockLog).handleProfileUpdated(mockMessage({
        uid: 'bogusuid'
      })).then(() => {
        assert.equal(mockPush.notifyProfileUpdated.callCount, 1)
        assert.equal(mockLog.messages.length, 1)
        pushShouldThrow = false
      })
    }
  )

  it(
    'should send push notifications',
    () => {
      const mockLog = spyLog()
      const uid = '1e2122ba'

      return mockProfileUpdates(mockLog).handleProfileUpdated(mockMessage({
        uid: uid
      })).then(function () {
        assert.equal(mockLog.messages.length, 0)
        assert.equal(mockPush.notifyProfileUpdated.callCount, 2)
        var args = mockPush.notifyProfileUpdated.getCall(1).args
        assert.deepEqual(args[0], Buffer.from(uid, 'hex'))
      })
    }
  )
})
