/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var url = require('url')
var Client = require('../client')
var TestServer = require('../test_server')


var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'unlock account',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then(
        function () {
          return Client.login(config.publicUrl, email, password)
        }
      )
      .then(
        function (x) {
          client = x
        }
      )
      .then(
        function () {
          return client.lockAccount(email, password)
        }
      )
      .then(
        function () {
          return client.resendAccountUnlockCode()
        }
      )
      .then(
        function () {
          return server.mailbox.waitForCode(email)
        }
      )
      .then(
        function (code) {
          return client.verifyAccountUnlockCode(client.uid, code)
        }
      )
    }
  )

  test(
    'unlock email tunnels oauth state parameters',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'something'
      var client = null
      var options = {
        redirectTo: 'https://sync.firefox.com',
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
            return client.lockAccount(email, password)
          }
        )
        .then(
          function () {
            return client.resendAccountUnlockCode()
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
            t.ok(query.uid, 'uid is in link')
            t.ok(query.code, 'code is in link')
            t.equal(query.redirectTo, options.redirectTo, 'redirectTo is in link')
            t.equal(query.service, options.service, 'service is in link')
          }
        )
    }
  )

  test(
    'resend account unlock code for account that is not locked',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then(
        function () {
          return Client.login(config.publicUrl, email, password)
        }
      )
      .then(
        function (x) {
          client = x
        }
      )
      .then(
        function () {
          return client.resendAccountUnlockCode()
        }
      )
      .then(
        function () {
          t.fail('resendAccountUnlockCode is expected to fail')
        },
        function (err) {
          t.equal(err.code, 400, '400 status code')
          t.equal(err.errno, 122, 'account is not locked errno')
        }
      )
    }
  )

  test(
    're-verify an account unlock when an account is not locked',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var code = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then(
        function () {
          return Client.login(config.publicUrl, email, password)
        }
      )
      .then(
        function (x) {
          client = x
        }
      )
      .then(
        function () {
          return client.lockAccount(email, password)
        }
      )
      .then(
        function () {
          return client.resendAccountUnlockCode()
        }
      )
      .then(
        function () {
          return server.mailbox.waitForCode(email)
        }
      )
      .then(
        function (_code) {
          code = _code
          return client.verifyAccountUnlockCode(client.uid, code)
        }
      )
      .then(
        function () {
          // the user may be re-verifying a stale link,
          // silently succeed.
          return client.verifyAccountUnlockCode(client.uid, code)
        }
      )
    }
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
