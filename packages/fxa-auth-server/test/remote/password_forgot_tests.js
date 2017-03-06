/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var url = require('url')
const Client = require('../client')()
var TestServer = require('../test_server')
var crypto = require('crypto')
var base64url = require('base64url')

var config = require('../../config').getProperties()
const mocks = require('../mocks')

describe('remote password forgot', function() {
  this.timeout(15000)
  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'forgot password',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'ez'
      var wrapKb = null
      var kA = null
      var client = null
      var opts = {
        keys: true,
        metricsContext: mocks.generateMetricsContext()
      }
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, opts)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            wrapKb = keys.wrapKb
            kA = keys.kA
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.html.indexOf('IP address') > -1, true, 'contains ip location data')
            assert.equal(emailData.headers['x-flow-begin-time'], opts.metricsContext.flowBeginTime, 'flow begin time set')
            assert.equal(emailData.headers['x-flow-id'], opts.metricsContext.flowId, 'flow id set')
            return emailData.headers['x-recovery-code']
          }
        )
        .then(
          function (code) {
            assert.throws(function() { client.resetPassword(newPassword) })
            return resetPassword(client, code, newPassword, undefined, opts)
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            assert.ok(query.email, 'email is in the link')

            assert.equal(emailData.headers['x-flow-begin-time'], opts.metricsContext.flowBeginTime, 'flow begin time set')
            assert.equal(emailData.headers['x-flow-id'], opts.metricsContext.flowId, 'flow id set')
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .then(
          function (keys) {
            assert.ok(Buffer.isBuffer(keys.wrapKb), 'yep, wrapKb')
            assert.notDeepEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
            assert.deepEqual(kA, keys.kA, 'kA was not reset')
            assert.equal(client.kB.length, 32, 'kB exists, has the right length')
          }
        )
        .then( // make sure we can still login after password reset
          function () {
            return Client.login(config.publicUrl, email, newPassword)
          }
        )
        .then(
          function () {
            // clear new-login notification email
            return server.mailbox.waitForEmail(email)
          }
        )
    }
  )

  it(
    'forgot password limits verify attempts',
    () => {
      var code = null
      var email = server.uniqueEmail()
      var password = 'hothamburger'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            client = new Client(config.publicUrl)
            client.email = email
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (c) {
            code = c
          }
        )
        .then(
          function () {
            return client.reforgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (c) {
            assert.equal(code, c, 'same code as before')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            assert(false, 'reset password with bad code')
          },
          function (err) {
            assert.equal(err.tries, 2, 'used a try')
            assert.equal(err.message, 'Invalid verification code', 'bad attempt 1')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            assert(false, 'reset password with bad code')
          },
          function (err) {
            assert.equal(err.tries, 1, 'used a try')
            assert.equal(err.message, 'Invalid verification code', 'bad attempt 2')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            assert(false, 'reset password with bad code')
          },
          function (err) {
            assert.equal(err.tries, 0, 'used a try')
            assert.equal(err.message, 'Invalid verification code', 'bad attempt 3')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            assert(false, 'reset password with invalid token')
          },
          function (err) {
            assert.equal(err.message, 'The authentication token could not be found', 'token is now invalid')
          }
        )
    }
  )

  it(
    'recovery email link',
    () => {
      var email = server.uniqueEmail()
      var password = 'something'
      var client = null
      var options = {
        redirectTo: 'https://sync.' + config.smtp.redirectDomain,
        service: 'sync'
      }
      return Client.create(config.publicUrl, email, password, options)
        .then(
          function (c) {
            client = c
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function () {
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            assert.ok(query.token, 'uid is in link')
            assert.ok(query.code, 'code is in link')
            assert.equal(query.redirectTo, options.redirectTo, 'redirectTo is in link')
            assert.equal(query.service, options.service, 'service is in link')
            assert.equal(query.email, email, 'email is in link')
          }
        )
    }
  )

  it(
    'password forgot status with valid token',
    () => {
      var email = server.uniqueEmail()
      var password = 'something'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (c) {
            return c.forgotPassword()
              .then(
                function () {
                  return c.api.passwordForgotStatus(c.passwordForgotToken)
                }
              )
              .then(
                function (x) {
                  assert.equal(x.tries, 3, 'three tries remaining')
                  assert.ok(x.ttl > 0 && x.ttl <= (60 * 60), 'ttl is ok')
                }
              )
          }
        )
    }
  )

  it(
    'password forgot status with invalid token',
    () => {
      var client = new Client(config.publicUrl)
      return client.api.passwordForgotStatus('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF')
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.errno, 110, 'invalid token')
          }
        )
    }
  )

  it(
    '/password/forgot/verify_code should set an unverified account as verified',
    () => {
      var email = server.uniqueEmail()
      var password = 'something'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(function (c) { client = c })
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'email unverified')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email) // ignore this code
          }
        )
        .then(
          function () {
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            return client.verifyPasswordResetCode(code)
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account unverified')
          }
        )
    }
  )

  it(
    'forgot password with service query parameter',
    () => {
      var email = server.uniqueEmail()
      var options = {
        redirectTo: 'https://sync.' + config.smtp.redirectDomain,
        serviceQuery: 'sync'
      }
      var client
      return Client.create(config.publicUrl, email, 'wibble', options)
        .then(function (c) {
          client = c
        })
        .then(function () {
          return server.mailbox.waitForEmail(email)
        })
        .then(function () {
          return client.forgotPassword()
        })
        .then(function () {
          return server.mailbox.waitForEmail(email)
        })
        .then(function (emailData) {
          var link = emailData.headers['x-link']
          var query = url.parse(link, true).query
          assert.equal(query.service, options.serviceQuery, 'service is in link')
        })
    }
  )

  it(
    'forgot password, then get device list',
    () => {
      var email = server.uniqueEmail()
      var newPassword = 'foo'
      var client
      return Client.createAndVerify(config.publicUrl, email, 'bar', server.mailbox)
        .then(
          function (c) {
            client = c
            return client.updateDevice({
              name: 'baz',
              type: 'mobile',
              pushCallback: 'https://updates.push.services.mozilla.com/qux',
              pushPublicKey: base64url(Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])),
              pushAuthKey: base64url(crypto.randomBytes(16))
            })
          }
        )
        .then(
          function () {
            return client.devices()
          }
        )
        .then(
          function (devices) {
            assert.equal(devices.length, 1, 'devices list contains 1 item')
          }
        )
        .then(
          function () {
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            return resetPassword(client, code, newPassword)
          }
        )
        .then(
          function () {
            return Client.login(config.publicUrl, email, newPassword)
          }
        )
        .then(
          function (client) {
            return client.devices()
          }
        )
        .then(
          function (devices) {
            assert.equal(devices.length, 0, 'devices list is empty')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })

  function resetPassword(client, code, newPassword, headers, options) {
    return client.verifyPasswordResetCode(code, headers, options)
      .then(function() {
        return client.resetPassword(newPassword, {}, options)
      })
  }

})
