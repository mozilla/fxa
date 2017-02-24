/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ROOT_DIR = '../../../../'

const assert = require('insist')
var sinon = require('sinon')
var extend = require('util')._extend
var P = require(`${ROOT_DIR}/lib/promise`)
var config = require(`${ROOT_DIR}/mailer/config`)

var TEST_EMAIL = 'test@restmail.net'
var TEST_ACCOUNT_RECORD = {
  emailVerified: false,
  email: TEST_EMAIL,
  emailCode: Buffer.from('foo'),
  uid: Buffer.from('bar'),
  locale: 'da, en-gb;q=0.8, en;q=0.7'
}
var REMINDER_TYPE = 'first'
var SAMPLE_REMINDER = {uid: TEST_ACCOUNT_RECORD.uid, type: REMINDER_TYPE}

var sandbox
var mockMailer = {
  verificationReminderEmail: function () {}
}

var mockDb = {
  fetchReminders: function () {},
  account: function () { return P.resolve(TEST_ACCOUNT_RECORD) }
}

var LOG_METHOD_NAMES = ['trace', 'increment', 'info', 'error', 'begin', 'debug']

var mockLog = function(methods) {
  var log = extend({}, methods)
  LOG_METHOD_NAMES.forEach(function(name) {
    if (! log[name]) {
      log[name] = function() {}
    }
  })
  return log
}

it('_processReminder sends first reminder for unverified emails', function () {
  setup()

  var legacyMailerLog = require(`${ROOT_DIR}/lib/senders/legacy_log`)(mockLog())
  var Mailer = require(`${ROOT_DIR}/lib/senders/email`)(legacyMailerLog)
  var mailer = new Mailer({}, {}, config.get('mail'))
  sandbox.stub(mailer, 'send', function (vals) {
    assert.equal(vals.acceptLanguage, TEST_ACCOUNT_RECORD.locale, 'correct locale')
    assert.equal(vals.uid, TEST_ACCOUNT_RECORD.uid.toString('hex'), 'correct uid')
    assert.equal(vals.email, TEST_ACCOUNT_RECORD.email, 'correct email')
    assert.equal(vals.template, 'verificationReminderFirstEmail', 'correct template')
    assert.equal(vals.subject, 'Hello again.', 'correct subject')
    assert.equal(vals.headers['X-Verify-Code'], TEST_ACCOUNT_RECORD.emailCode.toString('hex'), 'correct code')
    assert.ok(vals.templateValues.link.indexOf(TEST_ACCOUNT_RECORD.emailCode.toString('hex')) >= 0, 'correct link')
    done()
  })

  require(`${ROOT_DIR}/lib/senders/verification-reminders`)(mailer, mockDb)
    ._processReminder(SAMPLE_REMINDER)
})

it('_processReminder sends second reminder for unverified emails', function () {
  setup()
  var legacyMailerLog = require(`${ROOT_DIR}/lib/senders/legacy_log`)(mockLog())
  var Mailer = require(`${ROOT_DIR}/lib/senders/email`)(legacyMailerLog)
  var mailer = new Mailer({}, {}, config.get('mail'))
  sandbox.stub(mailer, 'send', function (vals) {
    assert.equal(vals.template, 'verificationReminderSecondEmail', 'correct template')
    assert.equal(vals.headers['X-Verify-Code'], TEST_ACCOUNT_RECORD.emailCode.toString('hex'), 'correct code')
    assert.ok(vals.templateValues.link.indexOf(TEST_ACCOUNT_RECORD.emailCode.toString('hex')) >= 0, 'correct link')
    done()
  })

  require(`${ROOT_DIR}/lib/senders/verification-reminders`)(mailer, mockDb)
    ._processReminder({uid: TEST_ACCOUNT_RECORD.uid, type: 'second'})
})

it('_processReminder - does not send email for verified emails', function () {
  setup()
  sandbox.stub(mockDb, 'account', function () {
    return P.resolve({
      emailVerified: true
    })
  })

  var log = mockLog({
    debug: function (op, data) {
      if (data.msg === 'Already Verified') {
        done()
      }
    }
  })

  require(`${ROOT_DIR}/lib/senders/verification-reminders`)(mockMailer, mockDb, { log: log })
    ._processReminder(SAMPLE_REMINDER)
})

it('_processReminder - catches errors', function () {
  setup()
  var errorMsg = 'Something is wrong.'

  sandbox.stub(mockDb, 'account', function () {
    return P.reject(new Error(errorMsg))
  })

  var log = mockLog({
    error: function (op, data) {
      if (data.err && data.err.message === errorMsg) {
        done()
      }
    }
  })

  require(`${ROOT_DIR}/lib/senders/verification-reminders`)(mockMailer, mockDb, { log: log })
    ._processReminder(SAMPLE_REMINDER)
})


it('_continuousPoll - calls _continuousPoll', function () {
  setup()

  sandbox.stub(mockDb, 'fetchReminders', function (options) {
    assert.ok(options.type)
    assert.ok(options.reminderTime)
    assert.ok(options.limit)

    if (options.type === 'first') {
      return P.resolve([SAMPLE_REMINDER])
    } else {
      return P.resolve([])
    }
  })

  sandbox.stub(mockDb, 'account', function () {
    done()
    return P.resolve({
      emailVerified: true
    })
  })

  require(`${ROOT_DIR}/lib/senders/verification-reminders`)(mockMailer, mockDb)
    ._continuousPoll()
})


function setup() {
  sandbox = sinon.sandbox.create()
}

function done() {
  sandbox.restore()
}
