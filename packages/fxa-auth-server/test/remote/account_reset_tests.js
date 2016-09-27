/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var url = require('url')
const Client = require('../client')()
var TestServer = require('../test_server')

var config = require('../../config').getProperties()
process.env.SIGNIN_CONFIRMATION_ENABLED = false

TestServer.start(config)
  .then(function main(server) {

    test(
      'account reset w/o sessionToken',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var newPassword = 'ez'
        var wrapKb, kA, client

        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
          .then(
            function (x) {
              client = x
            }
          )
          .then(
            function () {
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
              return server.mailbox.waitForCode(email)
            }
          )
          .then(
            function (code) {
              t.throws(function() {
                client.resetPassword(newPassword)
              })
              return resetPassword(client, code, newPassword, {sessionToken: false})
            }
          )
          .then(
            function (response) {
              t.notOk(response.sessionToken, 'session token is not in response')
              t.notOk(response.keyFetchToken, 'keyFetchToken token is not in response')
              t.notOk(response.verified, 'verified is not in response')
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
              t.ok(query.email, 'email is in the link')
            }
          )
          .then(
            function () {
              // make sure we can still login after password reset
              return Client.login(config.publicUrl, email, newPassword, server.mailbox, {keys:true})
            }
          )
          .then(
            function (x) {
              client = x
              return client.keys()
            }
          )
          .then(
            function (keys) {
              t.ok(Buffer.isBuffer(keys.wrapKb), 'yep, wrapKb')
              t.notDeepEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
              t.deepEqual(kA, keys.kA, 'kA was not reset')
              t.equal(client.kB.length, 32, 'kB exists, has the right length')
            }
          )
      }
    )

    test(
      'account reset with keys',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var newPassword = 'ez'
        var wrapKb, kA, client

        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
          .then(
            function (x) {
              client = x
            }
          )
          .then(
            function () {
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
              return server.mailbox.waitForCode(email)
            }
          )
          .then(
            function (code) {
              t.throws(function() {
                client.resetPassword(newPassword)
              })
              return resetPassword(client, code, newPassword,  {keys:true})
            }
          )
          .then(
            function (response) {
              t.ok(response.sessionToken, 'session token is in response')
              t.ok(response.keyFetchToken, 'keyFetchToken token is in response')
              t.equal(response.verified, true,  'verified is true')
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
              t.ok(query.email, 'email is in the link')
            }
          )
          .then(
            function () {
              // make sure we can still login after password reset
              return Client.login(config.publicUrl, email, newPassword, server.mailbox, {keys:true})
            }
          )
          .then(
            function (x) {
              client = x
              return client.keys()
            }
          )
          .then(
            function (keys) {
              t.ok(Buffer.isBuffer(keys.wrapKb), 'yep, wrapKb')
              t.notDeepEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
              t.deepEqual(kA, keys.kA, 'kA was not reset')
              t.equal(client.kB.length, 32, 'kB exists, has the right length')
            }
          )
      }
    )

    test(
      'account reset w/o keys, with sessionToken',
      function (t) {
        var email = server.uniqueEmail()
        var password = 'allyourbasearebelongtous'
        var newPassword = 'ez'
        var client

        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
          .then(
            function (x) {
              client = x
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
              t.throws(function() {
                client.resetPassword(newPassword)
              })
              return resetPassword(client, code, newPassword)
            }
          )
          .then(
            function (response) {
              t.ok(response.sessionToken, 'session token is in response')
              t.notOk(response.keyFetchToken, 'keyFetchToken token is not in response')
              t.equal(response.verified, true,  'verified is true')
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

function resetPassword(client, code, newPassword, options) {
  return client.verifyPasswordResetCode(code)
    .then(function() {
      return client.resetPassword(newPassword, {}, options)
    })
}
