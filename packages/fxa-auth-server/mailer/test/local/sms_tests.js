/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const P = require('bluebird')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const test = require('tap').test

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
function Nexmo () {}
Nexmo.prototype.message = { sendSms }

P.all([
  require('../../translator')(['en'], 'en'),
  require('../../templates')()
]).spread((translator, templates) => {
  const sms = proxyquire('../../lib/sms', {
    nexmo: Nexmo
  })(log, translator, templates, {
    apiKey: 'foo',
    apiSecret: 'bar',
    installFirefoxLink: 'https://baz/qux'
  })

  test('interface is correct', t => {
    t.equal(typeof sms.send, 'function', 'sms.send is function')
    t.equal(sms.send.length, 4, 'sms.send expects 4 arguments')
    t.equal(Object.keys(sms).length, 1, 'sms has no other methods')
    t.done()
  })

  test('send a valid sms', t => {
    t.plan(13)
    return sms.send('+442078553000', 'Firefox', 1, 'en')
      .then(() => {
        t.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
        const args = sendSms.args[0]
        t.equal(args.length, 4, 'nexmo.message.sendSms was passed four arguments')
        t.equal(args[0], 'Firefox', 'nexmo.message.sendSms was passed the correct sender id')
        t.equal(args[1], '+442078553000', 'nexmo.message.sendSms was passed the correct phone number')
        t.equal(args[2], 'As requested, here is a link to install Firefox on your mobile device: https://baz/qux', 'nexmo.message.sendSms was passed the correct message')
        t.equal(typeof args[3], 'function', 'nexmo.message.sendSms was passed a callback function')

        t.equal(log.trace.callCount, 1, 'log.trace was called once')
        t.equal(log.trace.args[0].length, 1, 'log.trace was passed one argument')
        t.deepEqual(log.trace.args[0][0], {
          op: 'sms.send',
          senderId: 'Firefox',
          messageId: 1,
          acceptLanguage: 'en'
        }, 'log.info was passed the correct data')

        t.equal(log.info.callCount, 1, 'log.info was called once')
        t.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
        t.deepEqual(log.info.args[0][0], {
          op: 'sms.send.success',
          senderId: 'Firefox',
          messageId: 1,
          acceptLanguage: 'en'
        }, 'log.info was passed the correct data')

        t.equal(log.error.callCount, 0, 'log.error was not called')
      })
      .finally(() => {
        sendSms.reset()
        log.trace.reset()
        log.info.reset()
      })
  })

  test('try to send an sms with an invalid message id', t => {
    t.plan(7)
    return sms.send('+442078553000', 'Firefox', 2, 'en')
      .then(() => t.notOk(true, 'sms.send should have rejected'))
      .catch(error => {
        t.equal(error.status, 400, 'error.statusCode was set correctly')
        t.equal(error.message, 'Invalid message id', 'error.message was set correctly')

        t.equal(log.trace.callCount, 1, 'log.trace was called once')
        t.equal(log.info.callCount, 0, 'log.info was not called')

        t.equal(log.error.callCount, 1, 'log.error was called once')
        t.deepEqual(log.error.args[0][0], {
          op: 'sms.send',
          err: error.message
        }, 'log.error was passed the correct data')

        t.equal(sendSms.callCount, 0, 'nexmo.message.sendSms was not called')
      })
      .finally(() => {
        log.trace.reset()
        log.error.reset()
      })
  })

  test('send an sms that is rejected by the network provider', t => {
    t.plan(7)
    nexmoStatus = '1'
    return sms.send('+442078553000', 'Firefox', 1, 'en')
      .then(() => t.notOk(true, 'sms.send should have rejected'))
      .catch(error => {
        t.equal(error.status, 500, 'error.statusCode was set correctly')
        t.equal(error.message, 'Message rejected', 'error.message was set correctly')
        t.equal(error.reason, 'bar', 'error.reason was set correctly')
        t.equal(error.reasonCode, '1', 'error.reasonCode was set correctly')

        t.equal(log.trace.callCount, 1, 'log.trace was called once')
        t.equal(log.info.callCount, 0, 'log.info was not called')

        t.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
      })
      .finally(() => {
        log.trace.reset()
        sendSms.reset()
        log.error.reset()
      })
  })
})

