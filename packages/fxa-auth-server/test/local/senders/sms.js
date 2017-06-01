/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../..'

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
function Nexmo () {}
Nexmo.prototype.message = { sendSms }

let mockConstructed = false
function MockNexmo () {
  mockConstructed = true
}
MockNexmo.prototype = Nexmo.prototype

describe('lib/senders/sms:', () => {
  let sms

  before(() => {
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`)()
    ]).spread((translator, templates) => {
      sms = proxyquire(`${ROOT_DIR}/lib/senders/sms`, {
        nexmo: Nexmo
      })(log, translator, templates, {
        sms: {
          apiKey: 'foo',
          apiSecret: 'bar',
          installFirefoxLink: 'https://baz/qux',
          installFirefoxWithSigninCodeBaseUri: 'https://wibble',
          useMock: false
        }
      })
    })
  })

  afterEach(() => {
    sendSms.reset()
    log.error.reset()
    log.info.reset()
    log.trace.reset()
    mockConstructed = false
  })

  it('interface is correct', () => {
    assert.equal(typeof sms.send, 'function', 'sms.send is function')
    assert.equal(sms.send.length, 5, 'sms.send expects 5 arguments')

    assert.equal(Object.keys(sms).length, 1, 'sms has no other methods')
  })

  it('sends a valid sms without a signinCode', () => {
    return sms.send('+442078553000', 'Firefox', 'installFirefox', 'en')
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
          templateName: 'installFirefox',
          acceptLanguage: 'en'
        }, 'log.trace was passed the correct data')

        assert.equal(log.info.callCount, 1, 'log.info was called once')
        assert.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
        assert.deepEqual(log.info.args[0][0], {
          op: 'sms.send.success',
          senderId: 'Firefox',
          templateName: 'installFirefox',
          acceptLanguage: 'en'
        }, 'log.info was passed the correct data')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('sends a valid sms with a signinCode', () => {
    return sms.send('+442078553000', 'Firefox', 'installFirefox', 'en', Buffer.from('++//ff0=', 'base64'))
      .then(() => {
        assert.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
        assert.equal(sendSms.args[0][2], 'As requested, here is a link to install Firefox on your mobile device: https://wibble/--__ff0', 'nexmo.message.sendSms was passed the correct message')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 1, 'log.info was called once')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('fails to send an sms with an invalid template name', () => {
    return sms.send('+442078553000', 'Firefox', 'wibble', 'en', Buffer.from('++//ff0=', 'base64'))
      .then(() => assert.fail('sms.send should have rejected'))
      .catch(error => {
        assert.equal(error.errno, 131, 'error.errno was set correctly')
        assert.equal(error.message, 'Invalid message id', 'error.message was set correctly')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 0, 'log.info was not called')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.deepEqual(log.error.args[0][0], {
          op: 'sms.getMessage.error',
          templateName: 'wibble'
        }, 'log.error was passed the correct data')

        assert.equal(sendSms.callCount, 0, 'nexmo.message.sendSms was not called')
      })
  })

  it('fails to send an sms that is throttled by the network provider', () => {
    nexmoStatus = '1'
    return sms.send('+442078553000', 'Firefox', 'installFirefox', 'en', Buffer.from('++//ff0=', 'base64'))
      .then(() => assert.fail('sms.send should have rejected'))
      .catch(error => {
        assert.equal(error.errno, 114, 'error.errno was set correctly')
        assert.equal(error.message, 'Client has sent too many requests', 'error.message was set correctly')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 0, 'log.info was not called')

        assert.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
      })
  })

  it('fails to send an sms that is rejected by the network provider', () => {
    nexmoStatus = '2'
    return sms.send('+442078553000', 'Firefox', 'installFirefox', 'en', Buffer.from('++//ff0=', 'base64'))
      .then(() => assert.fail('sms.send should have rejected'))
      .catch(error => {
        assert.equal(error.errno, 132, 'error.errno was set correctly')
        assert.equal(error.message, 'Message rejected', 'error.message was set correctly')
        assert.equal(error.output.payload.reason, 'bar', 'error.reason was set correctly')
        assert.equal(error.output.payload.reasonCode, '2', 'error.reasonCode was set correctly')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 0, 'log.info was not called')

        assert.equal(sendSms.callCount, 1, 'nexmo.message.sendSms was called once')
      })
  })


  it('uses the Nexmo constructor if `useMock: false`', () => {
    assert.equal(mockConstructed, false)
  })

  it('uses the NexmoMock constructor if `useMock: true`', () => {
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`)()
    ]).spread((translator, templates) => {
      sms = proxyquire(`${ROOT_DIR}/lib/senders/sms`, {
        nexmo: Nexmo,
        '../mock-nexmo': MockNexmo
      })(log, translator, templates, {
        sms: {
          apiKey: 'foo',
          apiSecret: 'bar',
          installFirefoxLink: 'https://baz/qux',
          useMock: true
        }
      })

      assert.equal(mockConstructed, true)
    })
  })
})

