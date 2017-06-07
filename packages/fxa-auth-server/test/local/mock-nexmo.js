/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
// noPreserveCache is needed to prevent the mock mailer from
// being used for all future tests that include mock-nexmo.
const proxyquire = require('proxyquire').noPreserveCache()
const sinon = require('sinon')
const config = require('../../config').getProperties()

describe('mock-nexmo', () => {
  let log
  let mailer
  let mockNexmo

  const MockNexmo = proxyquire('../../lib/mock-nexmo', {
    nodemailer: {
      createTransport: () => mailer
    }
  })

  before(() => {
    mailer = {
      sendMail: sinon.spy((config, callback) => callback())
    }
    log = {
      info: sinon.spy()
    }
    mockNexmo = new MockNexmo(log, config)
  })

  afterEach(() => {
    mailer.sendMail.reset()
    log.info.reset()
  })

  it('constructor creates an instance', () => {
    assert.ok(mockNexmo)
  })

  describe('message.sendSms', () => {
    it('returns status: 0 with options, callback', (done) => {
      mockNexmo.message.sendSms('senderid', '+019999999999', 'message', {}, (err, resp) => {
        assert.strictEqual(err, null)
        assert.equal(resp.messages.length, 1)
        assert.strictEqual(resp.messages[0].status, '0')
        assert.equal(log.info.callCount, 1)

        assert.equal(mailer.sendMail.callCount, 1)
        const sendConfig = mailer.sendMail.args[0][0]
        assert.equal(sendConfig.from, config.smtp.sender)
        assert.equal(sendConfig.to, 'sms.+019999999999@restmail.net')
        assert.equal(sendConfig.subject, 'MockNexmo.message.sendSms')
        assert.equal(sendConfig.text, 'message')

        done()
      })
    })

    it('returns status: 0 without options, only callback', (done) => {
      mockNexmo.message.sendSms('senderid', '+019999999999', 'message', (err, resp) => {
        assert.strictEqual(err, null)
        assert.equal(resp.messages.length, 1)
        assert.strictEqual(resp.messages[0].status, '0')
        assert.equal(log.info.callCount, 1)

        assert.equal(mailer.sendMail.callCount, 1)
        const sendConfig = mailer.sendMail.args[0][0]
        assert.equal(sendConfig.from, config.smtp.sender)
        assert.equal(sendConfig.to, 'sms.+019999999999@restmail.net')
        assert.equal(sendConfig.subject, 'MockNexmo.message.sendSms')
        assert.equal(sendConfig.text, 'message')

        done()
      })
    })
  })
})
