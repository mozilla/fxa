/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var log = {
  trace: function () {},
  error: console.error,
}
var error = require('../../error.js')
var nock = require('nock')

var Customs = require('../../customs.js')(log, error)

var MockDB = {
  locked: {},
  lockAccount: function(account) {
    MockDB.locked[account.uid] = true;
  },
  unlockAccount: function(account) {
    delete MockDB.locked[account.uid];
  }
}

var CUSTOMS_URL_REAL = 'http://localhost:7000'
var CUSTOMS_URL_MISSING = 'http://localhost:7001'

var customsNoUrl
var customsWithUrl
var customsInvalidUrl

var customsServer = nock(CUSTOMS_URL_REAL)
  .defaultReplyHeaders({
    'Content-Type': 'application/json'
  })

test(
  "can create a customs object with url as 'none'",
  function (t) {
    t.plan(7)

    customsNoUrl = new Customs('none', MockDB)

    t.ok(customsNoUrl, 'got a customs object with a none url')

    var email = newEmail()
    var ip = newIp()
    var action = newAction()

    return customsNoUrl.check(email, ip, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds')
        t.pass('Passed /check (no url)')
      }, function(error) {
        t.fail('We should have failed open (no url provided) for /check')
      })
      .then(function() {
        return customsNoUrl.flag(ip, { email: email, uid: "12345" })
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        t.pass('Passed /failedLoginAttempt')
      }, function(error) {
        t.fail('We should have failed open for /failedLoginAttempt')
      })
      .then(function() {
        return customsNoUrl.reset(email)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        t.pass('Passed /passwordReset')
      }, function(error) {
        t.fail('We should have failed open (no url provided) for /failedLoginAttempt')
      })
  }
)

test(
  'can create a customs object with a url',
  function (t) {
    t.plan(18)

    customsWithUrl = new Customs(CUSTOMS_URL_REAL, MockDB)

    t.ok(customsWithUrl, 'got a customs object with a valid url')

    var email = newEmail()
    var ip = newIp()
    var action = newAction()

    customsServer
      .post('/check').reply(200, '{"block":false,"retryAfter":0}')
      .post('/failedLoginAttempt').reply(200, '{"lockout":false}')
      .post('/passwordReset').reply(200, '{}')
      .post('/check').reply(200, '{"block":true,"retryAfter":10001}')
      .post('/failedLoginAttempt').reply(200, '{"lockout":true}')

    return customsWithUrl.check(email, ip, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds')
        t.pass('Passed /check (with url)')
      }, function(error) {
        t.fail('We should not have failed here for /check : err=' + error)
      })
      .then(function() {
        return customsWithUrl.flag(ip, { email: email, uid: "12345" })
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        t.ok(!MockDB.locked["12345"], 'We ignore /failedLoginAttempt {lockout:false}')
        t.pass('Passed /failedLoginAttempt')
      }, function(error) {
        t.fail('We should not have failed here for /failedLoginAttempt : err=' + error)
      })
      .then(function() {
        return customsWithUrl.reset(email)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        t.pass('Passed /passwordReset')
      }, function(error) {
        t.fail('We should not have failed here for /passwordReset : err=' + error)
      })
      .then(function() {
        return customsWithUrl.check(email, ip, action)
      })
      .then(function(result) {
        t.fail('This should have failed the check since it should be blocked')
      }, function(error) {
        t.pass('Since we faked a block, we should have arrived here')
        t.equal(error.errno, 114, 'Error number is correct')
        t.equal(error.message, 'Client has sent too many requests', 'Error message is correct')
        t.ok(error.isBoom, 'The error causes a boom')
        t.equal(error.output.statusCode, 429, 'Status Code is correct')
        t.equal(error.output.payload.retryAfter, 10001, 'retryAfter is correct')
        t.equal(error.output.headers['retry-after'], 10001, 'retryAfter header is correct')
      })
      .then(function() {
        return customsWithUrl.flag(ip, { email: email, uid: "12345" })
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        t.ok(MockDB.locked["12345"], 'We lockout on /failedLoginAttempt {lockout:true}')
        t.pass('Passed /failedLoginAttempt with lockout')
      }, function(error) {
        t.fail('We should not have failed here for /failedLoginAttempt : err=' + error)
      })

  }
)

test(
  "can create a customs object with non-existant customs service'",
  function (t) {
    t.plan(7)

    customsInvalidUrl = new Customs(CUSTOMS_URL_MISSING, MockDB)

    t.ok(customsInvalidUrl, 'got a customs object with a non-existant service url')

    var email = newEmail()
    var ip = newIp()
    var action = newAction()

    return customsInvalidUrl.check(email, ip, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds even when service is non-existant')
        t.pass('Passed /check (no url)')
      }, function(error) {
        t.fail('We should have failed open (non-existant service url provided) for /check')
      })
      .then(function() {
        return customsInvalidUrl.flag(ip, { email: email, uid: "12345" })
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        t.pass('Passed /failedLoginAttempt')
      }, function(error) {
        t.fail('We should have failed open (no url provided) for /failedLoginAttempt')
      })
      .then(function() {
        return customsInvalidUrl.reset(email)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        t.pass('Passed /passwordReset')
      }, function(error) {
        t.fail('We should have failed open (no url provided) for /failedLoginAttempt')
      })
  }
)

function newEmail() {
  return Math.random().toString().substr(2) + '@example.com'
}

function newIp() {
  return [
    '' + Math.floor(Math.random() * 256),
    '' + Math.floor(Math.random() * 256),
    '' + Math.floor(Math.random() * 256),
    '' + Math.floor(Math.random() * 256),
  ].join('.')
}

var EMAIL_ACTIONS = [
  'accountCreate',
  'recoveryEmailResendCode',
  'passwordForgotSendCode',
  'passwordForgotResendCode'
]

function newAction() {
  return EMAIL_ACTIONS[Math.floor(Math.random() * EMAIL_ACTIONS.length)]
}
