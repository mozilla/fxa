/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const emailHelpers = require('../../../lib/email/utils/helpers')
const spyLog = require('../../mocks').spyLog


describe('email utils helpers', () => {
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

})
