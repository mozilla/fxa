/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')

const EventEmitter = require('events').EventEmitter
const sinon = require('sinon')
const spyLog = require('../../mocks').spyLog
const delivery = require('../../../lib/email/delivery')

const mockDeliveryQueue = new EventEmitter()
mockDeliveryQueue.start = function start() {
}

function mockMessage(msg) {
  msg.del = sinon.spy()
  return msg
}

function mockedDelivery(log) {
  return delivery(log)(mockDeliveryQueue)
}

describe('delivery messages', () => {
  it(
    'should ignore unknown message types',
    () => {
      const mockLog = spyLog()
      return mockedDelivery(mockLog).handleDelivery(mockMessage({
        junk: 'message'
      })).then(function () {
        assert.equal(mockLog.messages.length, 0)
      })
    }
  )

  it(
    'should log delivery',
    () => {
      const mockLog = spyLog()
      const mockMsg = mockMessage({
        notificationType: 'Delivery',
        delivery: {
          timestamp: '2016-01-27T14:59:38.237Z',
          recipients: ['jane@example.com'],
          processingTimeMillis: 546,
          reportingMTA: 'a8-70.smtp-out.amazonses.com',
          smtpResponse: '250 ok:  Message 64111812 accepted',
          remoteMtaIp: '127.0.2.0'
        },
        mail: {
          headers: [
            {
              name: 'X-Template-Name',
              value: 'verifyLoginEmail'
            }
          ]
        }
      })

      return mockedDelivery(mockLog).handleDelivery(mockMsg).then(function () {
        assert.equal(mockLog.messages.length, 3)
        assert.equal(mockLog.messages[1].args[0]['email'], 'jane@example.com')
        assert.equal(mockLog.messages[1].args[0]['op'], 'handleDelivery')
        assert.equal(mockLog.messages[1].args[0]['template'], 'verifyLoginEmail')
        assert.equal(mockLog.messages[1].args[0]['processingTimeMillis'], 546)
        assert.equal(mockLog.messages[2].args[0], 'account.email_delivered')
        assert.equal(mockLog.messages[2].level, 'increment')
      })
    }
  )

  it(
    'should emit flow metrics',
    () => {
      const mockLog = spyLog()
      const mockMsg = mockMessage({
        notificationType: 'Delivery',
        delivery: {
          timestamp: '2016-01-27T14:59:38.237Z',
          recipients: ['jane@example.com'],
          processingTimeMillis: 546,
          reportingMTA: 'a8-70.smtp-out.amazonses.com',
          smtpResponse: '250 ok:  Message 64111812 accepted',
          remoteMtaIp: '127.0.2.0'
        },
        mail: {
          headers: [
            {
              name: 'X-Template-Name',
              value: 'verifyLoginEmail'
            },
            {
              name: 'X-Flow-Id',
              value: 'someFlowId'
            },
            {
              name: 'X-Flow-Begin-Time',
              value: '1234'
            }
          ]
        }
      })

      return mockedDelivery(mockLog).handleDelivery(mockMsg).then(function () {
        assert.equal(mockLog.messages.length, 3)
        assert.equal(mockLog.messages[0].args[0]['event'], 'email.verifyLoginEmail.delivered')
        assert.equal(mockLog.messages[0].args[0]['flow_id'], 'someFlowId')
        assert.equal(mockLog.messages[0].args[0]['flow_time'] > 0, true)
        assert.equal(mockLog.messages[0].args[0]['time'] > 0, true)
      })
    }
  )
})
