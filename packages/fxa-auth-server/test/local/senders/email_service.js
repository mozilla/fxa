/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 'use strict'

const ROOT_DIR = '../../..'

const assert = require('insist')
const proxyquire = require('proxyquire')

const config = require(`${ROOT_DIR}/config`).getProperties()
const emailConfig = {
  cc: ['bar@test.com', 'baz@test.com'],
  to: 'foo@test.com',
  subject: 'subject',
  text: 'text',
  html: '<p>html</p>',
  headers: {
    'x-header': 'yeah',
    'x-numbers': 9999
  }
}

describe(
  'lib/senders/email_service',
  () => {
    it('emailService serializes options correctly', () => {
      const mock = {
        'request': function (config, cb) {
          cb(config)
        }
      }

      const emailService = proxyquire(`${ROOT_DIR}/lib/senders/email_service`, mock)(config)
      emailService.sendMail(emailConfig, (serialized) => {
        assert.equal(serialized.url, `http://${config.emailService.host}:${config.emailService.port}/send`)
        assert.equal(serialized.method, 'POST')
        assert.equal(serialized.json, true)
        assert.deepEqual(serialized.body.cc, ['bar@test.com', 'baz@test.com'])
        assert.equal(serialized.body.to, 'foo@test.com')
        assert.equal(serialized.body.subject, 'subject')
        assert.equal(serialized.body.body.text, 'text')
        assert.equal(serialized.body.body.html, '<p>html</p>')
        assert.equal(serialized.body.headers['x-header'], 'yeah')
        assert.equal(serialized.body.headers['x-numbers'], '9999')
      })
    })

    it('emailService handles successfull request and response', () => {
      const mock = {
        'request': function (config, cb) {
          cb(null, {
            statusCode: 200
          }, {
            messageId: 'woopwoop'
          })
        }
      }

      const emailService = proxyquire(`${ROOT_DIR}/lib/senders/email_service`, mock)(config)
      emailService.sendMail(emailConfig, (err, body) => {
        assert.equal(err, null)
        assert.equal(body.messageId, 'woopwoop')
        assert.equal(body.message, undefined)
      })
    })

    it('emailService handles successfull request, but unsuccessfull response', () => {
      const mock = {
        'request': function (config, cb) {
          cb(null, {
            statusCode: 500
          }, {
            code: 500,
            error: 'InternalServerError',
            errno: 104,
            message: 'FREAKOUT',
            name: 'SES'
          })
        }
      }

      const emailService = proxyquire(`${ROOT_DIR}/lib/senders/email_service`, mock)(config)
      emailService.sendMail(emailConfig, (err, body) => {
        assert.equal(err, null)
        assert.equal(body.messageId, undefined)
        assert.equal(body.message, 'FREAKOUT')
      })
    })

    it('emailService handles unsuccessfull request', () => {
      const mock = {
        'request': function (config, cb) {
          cb(Error('FREAKOUT'), undefined, undefined)
        }
      }

      const emailService = proxyquire(`${ROOT_DIR}/lib/senders/email_service`, mock)(config)
      emailService.sendMail(emailConfig, (err, body) => {
        assert.equal(typeof err, 'object')
        assert.equal(body.messageId, undefined)
        assert.equal(body.message, 'FREAKOUT')
      })
    })
  }
)
