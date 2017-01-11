/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')
const log = {
  trace: () => {},
  activityEvent: () => {},
  flowEvent: () => {},
  error() {}
}
const mocks = require('../mocks')
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

describe('Customs', () => {
  it(
    "can create a customs object with url as 'none'",
    () => {
      customsNoUrl = new Customs('none')

      assert.ok(customsNoUrl, 'got a customs object with a none url')

      var request = newRequest()
      var ip = request.app.clientAddress
      var email = newEmail()
      var action = newAction()

      return customsNoUrl.check(request, email, action)
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds')
        })
        .then(function() {
          return customsNoUrl.flag(ip, { email: email, uid: '12345' })
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        })
        .then(function() {
          return customsNoUrl.reset(email)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        })
    }
  )

  it(
    'can create a customs object with a url',
    () => {
      customsWithUrl = new Customs(CUSTOMS_URL_REAL)

      assert.ok(customsWithUrl, 'got a customs object with a valid url')

      var request = newRequest()
      var ip = request.app.clientAddress
      var email = newEmail()
      var action = newAction()

      // Mock a check that does not get blocked.
      customsServer.post('/check', function (body) {
        assert.deepEqual(body, {
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
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds')
        })
        .then(function() {
          // Mock a report of a failed login attempt
          customsServer.post('/failedLoginAttempt', function (body) {
            assert.deepEqual(body, {
              ip: ip,
              email: email,
              errno: error.ERRNO.UNEXPECTED_ERROR
            }, 'first call to /failedLoginAttempt had expected request params')
            return true
          }).reply(200, {})
          return customsWithUrl.flag(ip, { email: email, uid: '12345' })
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        })
        .then(function() {
          // Mock a report of a password reset.
          customsServer.post('/passwordReset', function (body) {
            assert.deepEqual(body, {
              email: email,
            }, 'first call to /passwordReset had expected request params')
            return true
          }).reply(200, {})
          return customsWithUrl.reset(email)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        })
        .then(function() {
          // Mock a check that does get blocked, with a retryAfter.
          customsServer.post('/check', function (body) {
            assert.deepEqual(body, {
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
          assert(false, 'This should have failed the check since it should be blocked')
        }, function(err) {
          assert.equal(err.errno, error.ERRNO.THROTTLED, 'Error number is correct')
          assert.equal(err.message, 'Client has sent too many requests', 'Error message is correct')
          assert.ok(err.isBoom, 'The error causes a boom')
          assert.equal(err.output.statusCode, 429, 'Status Code is correct')
          assert.equal(err.output.payload.retryAfter, 10001, 'retryAfter is correct')
          assert.equal(err.output.headers['retry-after'], 10001, 'retryAfter header is correct')
        })
        .then(function() {
          // Mock a report of a failed login attempt that does trigger lockout.
          customsServer.post('/failedLoginAttempt', function (body) {
            assert.deepEqual(body, {
              ip: ip,
              email: email,
              errno: error.ERRNO.INCORRECT_PASSWORD
            }, 'second call to /failedLoginAttempt had expected request params')
            return true
          }).reply(200, { })
          return customsWithUrl.flag(ip, {
            email: email,
            errno: error.ERRNO.INCORRECT_PASSWORD
          })
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        })
        .then(function() {
          // Mock a check that does get blocked, with no retryAfter.
          request.headers['user-agent'] = 'test passing through headers'
          request.payload['foo'] = 'bar'
          customsServer.post('/check', function (body) {
            assert.deepEqual(body, {
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
          assert(false, 'This should have failed the check since it should be blocked')
        }, function(err) {
          assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'Error number is correct')
          assert.equal(err.message, 'The request was blocked for security reasons', 'Error message is correct')
          assert.ok(err.isBoom, 'The error causes a boom')
          assert.equal(err.output.statusCode, 400, 'Status Code is correct')
          assert(!err.output.payload.retryAfter, 'retryAfter field is not present')
          assert(!err.output.headers['retry-after'], 'retryAfter header is not present')
        })
    }
  )

  it(
    'can create a customs object with non-existant customs service',
    () => {
      customsInvalidUrl = new Customs(CUSTOMS_URL_MISSING)

      assert.ok(customsInvalidUrl, 'got a customs object with a non-existant service url')

      var request = newRequest()
      var ip = request.app.clientAddress
      var email = newEmail()
      var action = newAction()

      return customsInvalidUrl.check(request, email, action)
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds even when service is non-existant')
        })
        .then(function() {
          return customsInvalidUrl.flag(ip, { email: email, uid: '12345' })
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /failedLoginAttempt succeeds')
        })
        .then(function() {
          return customsInvalidUrl.reset(email)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /passwordReset succeeds')
        })
    }
  )

  it(
    'can rate limit checkAccountStatus /check',
    () => {
      customsWithUrl = new Customs(CUSTOMS_URL_REAL)

      assert.ok(customsWithUrl, 'can rate limit checkAccountStatus /check')

      var request = newRequest()
      var ip = request.app.clientAddress
      var email = newEmail()
      var action = 'accountStatusCheck'

      function checkRequestBody (body) {
        assert.deepEqual(body, {
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
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds - 1')
          return customsWithUrl.check(request, email, action)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds - 2')
          return customsWithUrl.check(request, email, action)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds - 3')
          return customsWithUrl.check(request, email, action)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /check succeeds - 4')
          return customsWithUrl.check(request, email, action)
        })
        .then(function() {
          // request is blocked
          return customsWithUrl.check(request, email, action)
        })
        .then(function() {
          assert(false, 'This should have failed the check since it should be blocked')
        }, function(error) {
          assert.equal(error.errno, 114, 'Error number is correct')
          assert.equal(error.message, 'Client has sent too many requests', 'Error message is correct')
          assert.ok(error.isBoom, 'The error causes a boom')
          assert.equal(error.output.statusCode, 429, 'Status Code is correct')
          assert.equal(error.output.payload.retryAfter, 10001, 'retryAfter is correct')
          assert.equal(error.output.payload.retryAfterLocalized, 'in 3 hours', 'retryAfterLocalized is correct')
          assert.equal(error.output.headers['retry-after'], 10001, 'retryAfter header is correct')
        })
    }
  )

  it(
    'can rate limit devicesNotify /checkAuthenticated',
    () => {
      customsWithUrl = new Customs(CUSTOMS_URL_REAL)

      assert.ok(customsWithUrl, 'can rate limit /checkAuthenticated')

      var request = newRequest()
      var action = 'devicesNotify'
      var ip = request.app.clientAddress
      var uid = 'foo'

      function checkRequestBody (body) {
        assert.deepEqual(body, {
          action: action,
          ip: ip,
          uid: uid,
        }, 'call to /checkAuthenticated had expected request params')
        return true
      }

      customsServer
        .post('/checkAuthenticated', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
        .post('/checkAuthenticated', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
        .post('/checkAuthenticated', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
        .post('/checkAuthenticated', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
        .post('/checkAuthenticated', checkRequestBody).reply(200, '{"block":false,"retryAfter":0}')
        .post('/checkAuthenticated', checkRequestBody).reply(200, '{"block":true,"retryAfter":10001}')

      return customsWithUrl.checkAuthenticated(action, ip, uid)
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /checkAuthenticated succeeds - 1')
          return customsWithUrl.checkAuthenticated(action, ip, uid)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /checkAuthenticated succeeds - 2')
          return customsWithUrl.checkAuthenticated(action, ip, uid)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /checkAuthenticated succeeds - 3')
          return customsWithUrl.checkAuthenticated(action, ip, uid)
        })
        .then(function(result) {
          assert.equal(result, undefined, 'Nothing is returned when /checkAuthenticated succeeds - 4')
          return customsWithUrl.checkAuthenticated(action, ip, uid)
        })
        .then(function() {
          // request is blocked
          return customsWithUrl.checkAuthenticated(action, ip, uid)
        })
        .then(function() {
          assert(false, 'This should have failed the check since it should be blocked')
        }, function(error) {
          assert.equal(error.errno, 114, 'Error number is correct')
          assert.equal(error.message, 'Client has sent too many requests', 'Error message is correct')
          assert.ok(error.isBoom, 'The error causes a boom')
          assert.equal(error.output.statusCode, 429, 'Status Code is correct')
          assert.equal(error.output.payload.retryAfter, 10001, 'retryAfter is correct')
          assert.equal(error.output.headers['retry-after'], 10001, 'retryAfter header is correct')
        })
    }
  )

  it(
    'can scrub customs request object',
    () => {
      customsWithUrl = new Customs(CUSTOMS_URL_REAL)

      assert.ok(customsWithUrl, 'got a customs object with a valid url')

      var request = newRequest()
      request.payload.authPW = 'asdfasdfadsf'
      request.payload.oldAuthPW = '012301230123'
      request.payload.notThePW = 'plaintext'
      var ip = request.app.clientAddress
      var email = newEmail()
      var action = newAction()

      customsServer.post('/check', function (body) {
        assert.deepEqual(body, {
          ip: ip,
          email: email,
          action: action,
          headers: request.headers,
          query: request.query,
          payload: {
            notThePW: 'plaintext'
          }
        }, 'should not have password fields in payload')
        return true
      }).reply(200, {
        block: false,
        retryAfter: 0
      })

      return customsWithUrl.check(request, email, action)
        .then(function (result) {
          assert.equal(result, undefined, 'nothing is returned when /check succeeds - 1')
        })
    }
  )

})

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
  return mocks.mockRequest({
    clientAddress: newIp(),
    headers: {},
    query: {},
    payload: {}
  })
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

