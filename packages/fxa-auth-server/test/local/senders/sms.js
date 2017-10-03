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

let snsResult = P.resolve({
  MessageId: 'foo'
})
const publish = sinon.spy(params => ({
  promise: () => snsResult
}))
function SNS () {}
SNS.prototype.publish = publish

let mockConstructed = false
function MockSNS () {
  mockConstructed = true
}
MockSNS.prototype = SNS.prototype

describe('lib/senders/sms:', () => {
  let sms

  before(() => {
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`).init()
    ]).spread((translator, templates) => {
      sms = proxyquire(`${ROOT_DIR}/lib/senders/sms`, {
        'aws-sdk': { SNS }
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
    publish.reset()
    log.error.reset()
    log.info.reset()
    log.trace.reset()
    mockConstructed = false
  })

  it('interface is correct', () => {
    assert.equal(typeof sms.send, 'function', 'sms.send is function')
    assert.equal(sms.send.length, 4, 'sms.send expects 4 arguments')

    assert.equal(Object.keys(sms).length, 1, 'sms has no other methods')
  })

  it('sends a valid sms without a signinCode', () => {
    return sms.send('+442078553000', 'installFirefox', 'en')
      .then(() => {
        assert.equal(publish.callCount, 1, 'AWS.SNS.publish was called once')
        assert.equal(publish.args[0].length, 1, 'AWS.SNS.publish was passed one argument')
        assert.deepEqual(publish.args[0][0], {
          Message: 'Thanks for choosing Firefox! You can install Firefox for mobile here: https://baz/qux',
          MessageAttributes: {
            'AWS.SNS.SMS.MaxPrice': {
              DataType: 'String',
              StringValue: '1.0'
            },
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: 'Firefox'
            },
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Promotional'
            }
          },
          PhoneNumber: '+442078553000'
        }, 'AWS.SNS.publish was passed the correct argument')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.trace.args[0].length, 1, 'log.trace was passed one argument')
        assert.deepEqual(log.trace.args[0][0], {
          op: 'sms.send',
          templateName: 'installFirefox',
          acceptLanguage: 'en'
        }, 'log.trace was passed the correct data')

        assert.equal(log.info.callCount, 1, 'log.info was called once')
        assert.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
        assert.deepEqual(log.info.args[0][0], {
          op: 'sms.send.success',
          templateName: 'installFirefox',
          acceptLanguage: 'en',
          messageId: 'foo'
        }, 'log.info was passed the correct data')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('sends a valid sms with a signinCode', () => {
    return sms.send('+442078553000', 'installFirefox', 'en', Buffer.from('++//ff0=', 'base64'))
      .then(() => {
        assert.equal(publish.callCount, 1, 'AWS.SNS.publish was called once')
        assert.equal(publish.args[0][0].Message, 'Thanks for choosing Firefox! You can install Firefox for mobile here: https://wibble/--__ff0', 'AWS.SNS.publish was passed the correct message')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 1, 'log.info was called once')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('fails to send an sms with an invalid template name', () => {
    return sms.send('+442078553000', 'wibble', 'en', Buffer.from('++//ff0=', 'base64'))
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

        assert.equal(publish.callCount, 0, 'AWS.SNS.publish was not called')
      })
  })

  it('fails to send an sms that is rejected by the network provider', () => {
    snsResult = P.reject({
      statusCode: 400,
      code: 42,
      message: 'this is an error'
    })
    return sms.send('+442078553000', 'installFirefox', 'en', Buffer.from('++//ff0=', 'base64'))
      .then(() => assert.fail('sms.send should have rejected'))
      .catch(error => {
        assert.equal(error.errno, 132, 'error.errno was set correctly')
        assert.equal(error.message, 'Message rejected', 'error.message was set correctly')
        assert.equal(error.output.payload.reason, 'this is an error', 'error.reason was set correctly')
        assert.equal(error.output.payload.reasonCode, 42, 'error.reasonCode was set correctly')

        assert.equal(log.trace.callCount, 1, 'log.trace was called once')
        assert.equal(log.info.callCount, 0, 'log.info was not called')

        assert.equal(publish.callCount, 1, 'AWS.SNS.publish was called once')
      })
  })


  it('uses the SNS constructor if `useMock: false`', () => {
    assert.equal(mockConstructed, false)
  })

  it('uses the MockSNS constructor if `useMock: true`', () => {
    return P.all([
      require(`${ROOT_DIR}/lib/senders/translator`)(['en'], 'en'),
      require(`${ROOT_DIR}/lib/senders/templates`).init()
    ]).spread((translator, templates) => {
      sms = proxyquire(`${ROOT_DIR}/lib/senders/sms`, {
        'aws-sdk': { SNS },
        '../../test/mock-sns': MockSNS
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

