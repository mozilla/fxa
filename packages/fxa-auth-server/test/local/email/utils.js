/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../..'

const assert = require('insist')
const P = require(`${ROOT_DIR}/lib/promise`)
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const spyLog = require('../../mocks').spyLog

const amplitude = sinon.spy()
const emailHelpers = proxyquire(`${ROOT_DIR}/lib/email/utils/helpers`, {
  '../../metrics/amplitude': () => amplitude
})

describe('email utils helpers', () => {
  afterEach(() => amplitude.reset())

  describe('getHeaderValue', () => {

    it('works with message.mail.headers', () => {
      const message = {
        mail: {
          headers: [{
            name: 'content-language',
            value: 'en-US'
          }]
        }
      }

      const value = emailHelpers.getHeaderValue('Content-Language', message)
      assert.equal(value, message.mail.headers[0].value)
    })


    it('works with message.headers', () => {
      const message = {
        headers: [{
          name: 'content-language',
          value: 'ru'
        }]
      }

      const value = emailHelpers.getHeaderValue('Content-Language', message)
      assert.equal(value, message.headers[0].value)
    })

  })

  describe('logEmailEventSent', () => {
    it('should check headers case-insensitively', () => {
      const mockLog = spyLog()
      const message = {
        email: 'user@example.domain',
        template: 'verifyEmail',
        headers: {
          'cOnTeNt-LaNgUaGe': 'ru'
        }
      }
      emailHelpers.logEmailEventSent(mockLog, message)
      assert.equal(mockLog.info.callCount, 1)
      assert.equal(mockLog.info.args[0][0].locale, 'ru')
    })

    it('should log an event per CC email', () => {
      const mockLog = spyLog()
      const message = {
        email: 'user@example.domain',
        ccEmails: ['noreply@gmail.com', 'noreply@yahoo.com'],
        template: 'verifyEmail'
      }
      emailHelpers.logEmailEventSent(mockLog, message)
      assert.equal(mockLog.info.callCount, 3)
      assert.equal(mockLog.info.args[0][0].domain, 'other')
      assert.equal(mockLog.info.args[1][0].domain, 'gmail.com')
      assert.equal(mockLog.info.args[2][0].domain, 'yahoo.com')
    })
  })

  it('logEmailEventSent should call amplitude correctly', () => {
    emailHelpers.logEmailEventSent(spyLog(), {
      email: 'foo@example.com',
      ccEmails: [ 'bar@example.com', 'baz@example.com' ],
      template: 'verifyEmail',
      headers: [
        { name: 'Content-Language', value: 'aaa' }
      ],
      deviceId: 'bbb',
      flowBeginTime: 42,
      flowId: 'ccc',
      service: 'ddd',
      uid: 'eee'
    })
    assert.equal(amplitude.callCount, 1)
    const args = amplitude.args[0]
    assert.equal(args.length, 4)
    assert.equal(args[0], 'email.verifyEmail.sent')
    assert.deepEqual(args[1], {
      app: {
        devices: P.resolve([]),
        geo: P.resolve({
          location: {}
        }),
        locale: 'aaa',
        ua: {}
      },
      auth: {},
      query: {},
      payload: {}
    })
    assert.deepEqual(args[2], {
      device_id: 'bbb',
      email_domain: 'other',
      service: 'ddd',
      uid: 'eee'
    })
    assert.equal(args[3].flow_id, 'ccc')
    assert.equal(args[3].flowBeginTime, 42)
    assert.ok(args[3].time > Date.now() - 1000)
  })

  it('logEmailEventFromMessage should call amplitude correctly', () => {
    emailHelpers.logEmailEventFromMessage(spyLog(), {
      email: 'foo@example.com',
      ccEmails: [ 'bar@example.com', 'baz@example.com' ],
      headers: [
        { name: 'Content-Language', value: 'a' },
        { name: 'X-Device-Id', value: 'b' },
        { name: 'X-Flow-Begin-Time', value: 1 },
        { name: 'X-Flow-Id', value: 'c' },
        { name: 'X-Service-Id', value: 'd' },
        { name: 'X-Template-Name', value: 'verifyLoginEmail' },
        { name: 'X-Uid', value: 'e' }
      ]
    }, 'bounced', 'gmail')
    assert.equal(amplitude.callCount, 1)
    const args = amplitude.args[0]
    assert.equal(args.length, 4)
    assert.equal(args[0], 'email.verifyLoginEmail.bounced')
    assert.deepEqual(args[1], {
      app: {
        devices: P.resolve([]),
        geo: P.resolve({
          location: {}
        }),
        locale: 'a',
        ua: {}
      },
      auth: {},
      query: {},
      payload: {}
    })
    assert.deepEqual(args[2], {
      device_id: 'b',
      email_domain: 'gmail',
      service: 'd',
      uid: 'e'
    })
    assert.equal(args[3].flow_id, 'c')
    assert.equal(args[3].flowBeginTime, 1)
  })

  describe('logErrorIfHeadersAreWeirdOrMissing', () => {
    let log

    beforeEach(() => {
      log = spyLog()
    })

    it('logs an error if message.mail is missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, {}, 'wibble')
      assert.equal(log.error.callCount, 1)
      assert.equal(log.error.args[0].length, 1)
      assert.deepEqual({
        op: 'emailHeaders.missing',
        origin: 'wibble'
      }, log.error.args[0][0])
    })

    it('logs an error if message.mail.headers is missing', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, { mail: {} }, 'blee')
      assert.equal(log.error.callCount, 1)
      assert.deepEqual({
        op: 'emailHeaders.missing',
        origin: 'blee'
      }, log.error.args[0][0])
    })

    it('does not log an error if message.mail.headers is object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, { mail: { headers: {} } })
      assert.equal(log.error.callCount, 0)
    })

    it('does not log an error if message.headers is object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, { headers: {} })
      assert.equal(log.error.callCount, 0)
    })

    it('logs an error if message.mail.headers is non-object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, { mail: { headers: 'foo' } }, 'wibble')
      assert.equal(log.error.callCount, 1)
      assert.deepEqual({
        op: 'emailHeaders.weird',
        type: 'string',
        origin: 'wibble'
      }, log.error.args[0][0])
    })

    it('logs an error if message.headers is non-object', () => {
      emailHelpers.logErrorIfHeadersAreWeirdOrMissing(log, { mail: {}, headers: 42 }, 'wibble')
      assert.equal(log.error.callCount, 1)
      assert.deepEqual({
        op: 'emailHeaders.weird',
        type: 'number',
        origin: 'wibble'
      }, log.error.args[0][0])
    })
  })
})
