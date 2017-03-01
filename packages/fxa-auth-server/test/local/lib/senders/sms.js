/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const P = require('bluebird')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const log = {
  error: sinon.spy(),
  info: sinon.spy(),
  trace: sinon.spy()
}

let nexmoStatus = '0'
const sendSms = sinon.spy((from, to, message, callback) => {
  callback(null, {
    message_count: '1',
    messages: [
      {
        to: to.substr(1),
        'message-id': 'foo',
        status: nexmoStatus,
        'error-text': 'bar',
        'remaining-balance': '42',
        'message-price': '1',
        'network': 'baz'
      }
    ]
  })
})
let nexmoBalance = 1
const checkBalance = sinon.spy(callback => {
  callback(null, {
    value: nexmoBalance,
    autoReload: false
  })
})
function Nexmo () {}
Nexmo.prototype.message = { sendSms }
Nexmo.prototype.account = { checkBalance }

describe('lib/senders/sms:', () => {
  let sms

  before(() => {
    return P.all([
      require('../../../../lib/senders/translator')(['en'], 'en'),
      require('../../../../lib/senders/templates')()
    ]).spread((translator, templates) => {
      sms = proxyquire('../../../../lib/senders/sms', {
        nexmo: Nexmo
      })(log, translator, templates, {
        apiKey: 'foo',
        apiSecret: 'bar',
        balanceThreshold: 1,
        installFirefoxLink: 'https://baz/qux'
      })
    })
  })

  afterEach(() => {
    sendSms.reset()
    checkBalance.reset()
    log.error.reset()
    log.info.reset()
    log.trace.reset()
  })

  it('interface is correct', () => {
    assert.equal(typeof sms.send, 'function', 'sms.send is function')
    assert.equal(sms.send.length, 4, 'sms.send expects 4 arguments')

    assert.equal(typeof sms.balance, 'function', 'sms.balance is function')
    assert.equal(sms.balance.length, 0, 'sms.balance expects no arguments')

    assert.equal(Object.keys(sms).length, 2, 'sms has no other methods')
  })

  it('sends a valid sms', () => {
    return sms.send('+442078553000', 'Firefox', 1, 'en')
      .then(() => {
        assert.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
        const args = sendSms.args[0]
        assert.equal(args.length, 4, 'nexmo.message.sendSms was passed four arguments')
        assert.equal(args[0], 'Firefox', 'nexmo.message.sendSms was passed the correct sender id')
        assert.equal(args[1], '+442078553000', 'nexmo.message.sendSms was passed the correct phone number')
        assert.equal(args[2], 'As requested, here is a link to install Firefox on your mobile device: https://baz/qux', 'nexmo.message.sendSms was passed the correct message')
        assert.equal(typeof args[3], 'function', 'nexmo.message.sendSms was passed a callback function')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.trace.args[0].length, 1, 'log.trace was passed one argument')
        assert.deepEqual(log.trace.args[0][0], {
          op: 'sms.send',
          senderId: 'Firefox',
          messageId: 1,
          acceptLanguage: 'en'
        }, 'log.trace was passed the correct data')

        assert.equal(log.info.callCount, 1, 'log.info was called once')
        assert.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
        assert.deepEqual(log.info.args[0][0], {
          op: 'sms.send.success',
          senderId: 'Firefox',
          messageId: 1,
          acceptLanguage: 'en'
        }, 'log.info was passed the correct data')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
        assert.equal(checkBalance.callCount, 0, 'checkBalance was not called')
      })
  })

  it('fails to send an sms with an invalid message id', () => {
    return sms.send('+442078553000', 'Firefox', 2, 'en')
      .then(() => assert.fail('sms.send should have rejected'))
      .catch(error => {
        assert.equal(error.status, 400, 'error.statusCode was set correctly')
        assert.equal(error.message, 'Invalid message id', 'error.message was set correctly')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 0, 'log.info was not called')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.deepEqual(log.error.args[0][0], {
          op: 'sms.send',
          err: error.message
        }, 'log.error was passed the correct data')

        assert.equal(sendSms.callCount, 0, 'nexmo.message.sendSms was not called')
      })
  })

  it('fails to send an sms that is rejected by the network provider', () => {
    nexmoStatus = '1'
    return sms.send('+442078553000', 'Firefox', 1, 'en')
      .then(() => assert.fail('sms.send should have rejected'))
      .catch(error => {
        assert.equal(error.status, 500, 'error.statusCode was set correctly')
        assert.equal(error.message, 'Message rejected', 'error.message was set correctly')
        assert.equal(error.reason, 'bar', 'error.reason was set correctly')
        assert.equal(error.reasonCode, '1', 'error.reasonCode was set correctly')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 0, 'log.info was not called')

        assert.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
      })
  })


  it('gets balance when balance is good', () => {
    return sms.balance()
      .then(result => {
        assert.deepEqual(result, { value: 1, isOk: true }, 'result is correct')

        assert.equal(checkBalance.callCount, 1, 'nexmo.account.checkBalance was called once')
        assert.equal(checkBalance.args[0].length, 1, 'nexmo.account.checkBalance was passed no arguments')
        assert.equal(typeof checkBalance.args[0][0], 'function', 'nexmo.account.checkBalance was passed a callback function')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.trace.args[0].length, 1, 'log.trace was passed one argument')
        assert.deepEqual(log.trace.args[0][0], { op: 'sms.balance' }, 'log.trace was passed the correct data')

        assert.equal(log.info.callCount, 1, 'log.info was called once')
        assert.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
        assert.deepEqual(log.info.args[0][0], {
          op: 'sms.balance.success',
          balance: 1,
          isOk: true
        }, 'log.info was passed the correct data')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
        assert.equal(sendSms.callCount, 0, 'sendSms was not called')
      })
  })

  it('gets balance when balance is too low', () => {
    nexmoBalance = 0.99
    return sms.balance()
      .then(result => {
        assert.deepEqual(result, { value: 0.99, isOk: false }, 'result is correct')

        assert.equal(checkBalance.callCount, 1, 'nexmo.account.checkBalance was called once')
        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 1, 'log.info was called once')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })
})

