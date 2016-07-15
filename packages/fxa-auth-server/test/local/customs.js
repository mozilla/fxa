/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var log = {
  trace: function () {},
  error: console.error,
}
var error = require('../../lib/error.js')
var nock = require('nock')

var Customs = require('../../lib/customs.js')(log, error)

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

    customsNoUrl = new Customs('none')

    t.ok(customsNoUrl, 'got a customs object with a none url')

    var request = newRequest()
    var ip = request.app.clientAddress
    var email = newEmail()
    var action = newAction()

    return customsNoUrl.check(request, email, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds')
        t.pass('Passed /check (no url)')
      }, function(error) {
        t.fail('We should have failed open (no url provided) for /check')
      })
      .then(function() {
        return customsNoUrl.flag(ip, { email: email, uid: '12345' })
      })
      .then(function(result) {
        t.equal(result.lockout, false, 'lockout is false when /failedLoginAttempt returns `lockout: false`')
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
    t.plan(29)

    customsWithUrl = new Customs(CUSTOMS_URL_REAL)

    t.ok(customsWithUrl, 'got a customs object with a valid url')

    var request = newRequest()
    var ip = request.app.clientAddress
    var email = newEmail()
    var action = newAction()

    // Mock a check that does not get blocked.
    customsServer.post('/check', function (body) {
      t.deepEqual(body, {
        ip: ip,
        email: email,
        action: action,
        headers: request.headers,
        query: request.query,
        payload: request.payload,
      }, 'first call to /check had expected request params')
      return true
    }).reply(200, {
      block: false,
      retryAfter: 0
    })
    return customsWithUrl.check(request, email, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds')
        t.pass('Passed /check (with url)')
      }, function(error) {
        t.fail('We should not have failed here for /check : err=' + error)
      })
      .then(function() {
        // Mock a report of a failed login attempt that doesn't trigger lockout.
        customsServer.post('/failedLoginAttempt', function (body) {
          t.deepEqual(body, {
             ip: ip,
             email: email,
             errno: error.ERRNO.UNEXPECTED_ERROR
          }, 'first call to /failedLoginAttempt had expected request params')
          return true
        }).reply(200, {
          lockout: false
        })
        return customsWithUrl.flag(ip, { email: email, uid: '12345' })
      })
      .then(function(result) {
        t.equal(result.lockout, false, 'lockout is false when /failedLoginAttempt returns false')
        t.pass('Passed /failedLoginAttempt')
      }, function(error) {
        t.fail('We should not have failed here for /failedLoginAttempt : err=' + error)
      })
      .then(function() {
        // Mock a report of a password reset.
        customsServer.post('/passwordReset', function (body) {
          t.deepEqual(body, {
             email: email,
          }, 'first call to /passwordReset had expected request params')
          return true
        }).reply(200, {})
        return customsWithUrl.reset(email)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        t.pass('Passed /passwordReset')
      }, function(error) {
        t.fail('We should not have failed here for /passwordReset : err=' + error)
      })
      .then(function() {
        // Mock a check that does get blocked, with a retryAfter.
        customsServer.post('/check', function (body) {
          t.deepEqual(body, {
             ip: ip,
             email: email,
             action: action,
             headers: request.headers,
             query: request.query,
             payload: request.payload,
          }, 'second call to /check had expected request params')
          return true
        }).reply(200, {
          block: true,
          retryAfter: 10001
        })
        return customsWithUrl.check(request, email, action)
      })
      .then(function(result) {
        t.fail('This should have failed the check since it should be blocked')
      }, function(err) {
        t.pass('Since we faked a block, we should have arrived here')
        t.equal(err.errno, error.ERRNO.THROTTLED, 'Error number is correct')
        t.equal(err.message, 'Client has sent too many requests', 'Error message is correct')
        t.ok(err.isBoom, 'The error causes a boom')
        t.equal(err.output.statusCode, 429, 'Status Code is correct')
        t.equal(err.output.payload.retryAfter, 10001, 'retryAfter is correct')
        t.equal(err.output.headers['retry-after'], 10001, 'retryAfter header is correct')
      })
      .then(function() {
        // Mock a report of a failed login attempt that does trigger lockout.
        customsServer.post('/failedLoginAttempt', function (body) {
          t.deepEqual(body, {
             ip: ip,
             email: email,
             errno: error.ERRNO.INCORRECT_PASSWORD
          }, 'second call to /failedLoginAttempt had expected request params')
          return true
        }).reply(200, {
          lockout: true
        })
        return customsWithUrl.flag(ip, {
          email: email,
          errno: error.ERRNO.INCORRECT_PASSWORD
        })
      })
      .then(function(result) {
        t.equal(result.lockout, true, 'lockout is true when /failedLoginAttempt returns `lockout: true`')
        t.pass('Passed /failedLoginAttempt with lockout')
      }, function(error) {
        t.fail('We should not have failed here for /failedLoginAttempt : err=' + error)
      })
      .then(function() {
        // Mock a check that does get blocked, with no retryAfter.
        request.headers['user-agent'] = 'test passing through headers'
        request.payload['foo'] = 'bar'
        customsServer.post('/check', function (body) {
          t.deepEqual(body, {
             ip: ip,
             email: email,
             action: action,
             headers: request.headers,
             query: request.query,
             payload: request.payload,
          }, 'third call to /check had expected request params')
          return true
        }).reply(200, {
          block: true
        })
        return customsWithUrl.check(request, email, action)
      })
      .then(function(result) {
        t.fail('This should have failed the check since it should be blocked')
      }, function(err) {
        t.pass('Since we faked a block, we should have arrived here')
        t.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'Error number is correct')
        t.equal(err.message, 'The request was blocked for security reasons', 'Error message is correct')
        t.ok(err.isBoom, 'The error causes a boom')
        t.equal(err.output.statusCode, 400, 'Status Code is correct')
        t.notOk(err.output.payload.retryAfter, 'retryAfter field is not present')
        t.notOk(err.output.headers['retry-after'], 'retryAfter header is not present')
      })

  }
)

test(
  'can create a customs object with non-existant customs service',
  function (t) {
    t.plan(7)

    customsInvalidUrl = new Customs(CUSTOMS_URL_MISSING)

    t.ok(customsInvalidUrl, 'got a customs object with a non-existant service url')

    var request = newRequest()
    var ip = request.app.clientAddress
    var email = newEmail()
    var action = newAction()

    return customsInvalidUrl.check(request, email, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds even when service is non-existant')
        t.pass('Passed /check (no url)')
      }, function(error) {
        t.fail('We should have failed open (non-existant service url provided) for /check')
      })
      .then(function() {
        return customsInvalidUrl.flag(ip, { email: email, uid: '12345' })
      })
      .then(function(result) {
        t.equal(result.lockout, false, 'lockout is false when /failedLoginAttempt hits an invalid endpoint')
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

test(
  'can rate limit checkAccountStatus /check',
  function (t) {
    t.plan(18)

    customsWithUrl = new Customs(CUSTOMS_URL_REAL)

    t.ok(customsWithUrl, 'can rate limit checkAccountStatus /check')

    var request = newRequest()
    var ip = request.app.clientAddress
    var email = newEmail()
    var action = 'accountStatusCheck'

    function checkRequestBody (body) {
      t.deepEqual(body, {
         ip: ip,
         email: email,
         action: action,
         headers: request.headers,
         query: request.query,
         payload: request.payload,
      }, 'call to /check had expected request params')
      return true
    }

    customsServer
      .post('/check', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
      .post('/check', checkRequestBody).reply(200, '{"block":true,"retryAfter":10001}')

    return customsWithUrl.check(request, email, action)
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds - 1')
        return customsWithUrl.check(request, email, action)
      }, function(error) {
        t.fail('We should not have failed here for /check : err=' + error)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds - 2')
        return customsWithUrl.check(request, email, action)
      }, function(error) {
        t.fail('We should not have failed here for /check : err=' + error)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds - 3')
        return customsWithUrl.check(request, email, action)
      }, function(error) {
        t.fail('We should not have failed here for /check : err=' + error)
      })
      .then(function(result) {
        t.equal(result, undefined, 'Nothing is returned when /check succeeds - 4')
        return customsWithUrl.check(request, email, action)
      }, function(error) {
        t.fail('We should not have failed here for /check : err=' + error)
      })
      .then(function() {
        // request is blocked
        return customsWithUrl.check(request, email, action)
      })
      .then(function() {
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

function newRequest() {
  return {
    app: {
      clientAddress: newIp()
    },
    headers: {},
    query: {},
    payload: {}
  }
}


function newAction() {
  var EMAIL_ACTIONS = [
    'accountCreate',
    'recoveryEmailResendCode',
    'passwordForgotSendCode',
    'passwordForgotResendCode'
  ]

  return EMAIL_ACTIONS[Math.floor(Math.random() * EMAIL_ACTIONS.length)]
}
