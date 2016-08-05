/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sinon = require('sinon')
var extend = require('util')._extend
var tap = require('tap')
var test = tap.test
var P = require('../../lib/promise')
var config = require('../../config')

var TEST_EMAIL = 'test@restmail.net'
var TEST_ACCOUNT_RECORD = {
  emailVerified: false,
  email: TEST_EMAIL,
  emailCode: new Buffer('foo'),
  uid: new Buffer('bar'),
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
    if (!log[name]) {
      log[name] = function() {}
    }
  })
  return log
}

test('_processReminder sends first reminder for unverified emails', function (t) {
  setup()

  var legacyMailerLog = require('../../legacy_log')(mockLog())
  var Mailer = require('../../mailer')(legacyMailerLog)
  var mailer = new Mailer({}, {}, config.get('mail'))
  sandbox.stub(mailer, 'send', function (vals) {
    t.equal(vals.acceptLanguage, TEST_ACCOUNT_RECORD.locale, 'correct locale')
    t.equal(vals.uid, TEST_ACCOUNT_RECORD.uid.toString('hex'), 'correct uid')
    t.equal(vals.email, TEST_ACCOUNT_RECORD.email, 'correct email')
    t.equal(vals.template, 'verificationReminderFirstEmail', 'correct template')
    t.equal(vals.subject, 'Hello again.', 'correct subject')
    t.equal(vals.headers['X-Verify-Code'], TEST_ACCOUNT_RECORD.emailCode.toString('hex'), 'correct code')
    t.ok(vals.templateValues.link.indexOf(TEST_ACCOUNT_RECORD.emailCode.toString('hex')) >= 0, 'correct link')
    done(t)
  })

  require('../../lib/verification-reminders')(mailer, mockDb)
    ._processReminder(SAMPLE_REMINDER)
})

test('_processReminder sends second reminder for unverified emails', function (t) {
  setup()
  var legacyMailerLog = require('../../legacy_log')(mockLog())
  var Mailer = require('../../mailer')(legacyMailerLog)
  var mailer = new Mailer({}, {}, config.get('mail'))
  sandbox.stub(mailer, 'send', function (vals) {
    t.equal(vals.template, 'verificationReminderSecondEmail', 'correct template')
    t.equal(vals.headers['X-Verify-Code'], TEST_ACCOUNT_RECORD.emailCode.toString('hex'), 'correct code')
    t.ok(vals.templateValues.link.indexOf(TEST_ACCOUNT_RECORD.emailCode.toString('hex')) >= 0, 'correct link')
    done(t)
  })

  require('../../lib/verification-reminders')(mailer, mockDb)
    ._processReminder({uid: TEST_ACCOUNT_RECORD.uid, type: 'second'})
})

test('_processReminder - does not send email for verified emails', function (t) {
  setup()
  sandbox.stub(mockDb, 'account', function () {
    return P.resolve({
      emailVerified: true
    })
  })

  var log = mockLog({
    debug: function (op, data) {
      if (data.msg === 'Already Verified') {
        done(t)
      }
    }
  })

  require('../../lib/verification-reminders')(mockMailer, mockDb, { log: log })
    ._processReminder(SAMPLE_REMINDER)
})

test('_processReminder - catches errors', function (t) {
  setup()
  var errorMsg = 'Something is wrong.'

  sandbox.stub(mockDb, 'account', function () {
    return P.reject(new Error(errorMsg))
  })

  var log = mockLog({
    debug: function (op, data) {
      if (data.err && data.err.message === errorMsg) {
        done(t)
      }
    }
  })

  require('../../lib/verification-reminders')(mockMailer, mockDb, { log: log })
    ._processReminder(SAMPLE_REMINDER)
})


test('_continuousPoll - calls _continuousPoll', function (t) {
  setup()

  sandbox.stub(mockDb, 'fetchReminders', function (options) {
    t.ok(options.type)
    t.ok(options.reminderTime)
    t.ok(options.limit)

    if (options.type === 'first') {
      return P.resolve([SAMPLE_REMINDER])
    } else {
      return P.resolve([])
    }
  })

  sandbox.stub(mockDb, 'account', function () {
    done(t)
    return P.resolve({
      emailVerified: true
    })
  })

  require('../../lib/verification-reminders')(mockMailer, mockDb)
    ._continuousPoll()
})


function setup() {
  sandbox = sinon.sandbox.create()
}

function done(t) {
  sandbox.restore()
  t.done()
}
