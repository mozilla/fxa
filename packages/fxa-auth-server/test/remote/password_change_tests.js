/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Client = require('../client')
var config = require('../../config').getProperties()
var test = require('../ptaptest')
var TestServer = require('../test_server')
var url = require('url')

var tokens = require('../../lib/tokens')({ trace: function() {}})
function getSessionTokenId(sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return token.id
      }
    )
}

process.env.SIGNIN_CONFIRMATION_ENABLED = true
process.env.SIGNIN_CONFIRMATION_RATE = 1.0

TestServer.start(config)
.then(function main(server) {

  test(
    'password change, with unverified session',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var kB, kA, client, firstAuthPW, originalSessionToken

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            originalSessionToken = client.sessionToken
            firstAuthPW = x.authPW.toString('hex')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            kB = keys.kB
            kA = keys.kA
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            // Login from different location to created unverified session
            return Client.login(config.publicUrl, email, password, {keys:true})
          }
        )
        .then(
          function (c) {
            client = c
          }
        )
        .then(
          function () {
            // Ignore confirm login email
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            // Verify correct status
            t.equal(status.verified, false, 'account is unverified')
            t.equal(status.emailVerified, true, 'account email is verified')
            t.equal(status.sessionVerified, false, 'account session is unverified')
          }
        )
        .then(
          function () {
            return getSessionTokenId(client.sessionToken)
          }
        )
        .then(
          function (sessionTokenId) {
            return client.changePassword(newPassword, undefined, sessionTokenId)
          }
        )
        .then(
          function (response) {
            // Verify correct change password response
            t.notEqual(response.sessionToken, originalSessionToken, 'session token has changed')
            t.ok(response.keyFetchToken, 'key fetch token returned')
            t.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var subject = emailData.headers['subject']
            t.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            t.ok(query.email, 'email is in the link')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            // Verify correct status
            t.equal(status.verified, false, 'account is unverified')
            t.equal(status.emailVerified, true, 'account email is verified')
            t.equal(status.sessionVerified, false, 'account session is unverified')
          }
        )
        .then(
          function () {
            return Client.loginAndVerify(config.publicUrl, email, newPassword, server.mailbox, {keys:true})
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
            t.deepEqual(keys.kB, kB, 'kB is preserved')
            t.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
    }
  )

  test(
    'password change, with verified session',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var kB, kA, client, firstAuthPW, originalSessionToken

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            originalSessionToken = client.sessionToken
            firstAuthPW = x.authPW.toString('hex')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            kB = keys.kB
            kA = keys.kA
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            return getSessionTokenId(client.sessionToken)
          }
        )
        .then(
          function (sessionTokenId) {
            return client.changePassword(newPassword, undefined, sessionTokenId)
          }
        )
        .then(
          function (response) {
            t.notEqual(response.sessionToken, originalSessionToken, 'session token has changed')
            t.ok(response.keyFetchToken, 'key fetch token returned')
            t.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var subject = emailData.headers['subject']
            t.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            t.ok(query.email, 'email is in the link')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            return Client.loginAndVerify(config.publicUrl, email, newPassword, server.mailbox, {keys:true})
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
            t.deepEqual(keys.kB, kB, 'kB is preserved')
            t.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
    }
  )

  test(
    'password change, with raw session data rather than session token id',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var client, firstAuthPW, originalSessionToken

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            originalSessionToken = client.sessionToken
            firstAuthPW = x.authPW.toString('hex')
            return client.keys()
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword, undefined, client.sessionToken)
          }
        )
        .then(
          function (response) {
            t.notEqual(response.sessionToken, originalSessionToken, 'session token has changed')
            t.ok(response.keyFetchToken, 'key fetch token returned')
            t.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var subject = emailData.headers['subject']
            t.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            t.ok(query.email, 'email is in the link')
          }
        )
    }
  )

  test(
    'password change w/o sessionToken',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var kB, kA, client, firstAuthPW

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            firstAuthPW = x.authPW.toString('hex')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            kB = keys.kB
            kA = keys.kA
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword)
          }
        )
        .then(
          function (response) {
            t.notOk(response.sessionToken, 'no session token returned')
            t.notOk(response.keyFetchToken, 'no key fetch token returned')
            t.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var subject = emailData.headers['subject']
            t.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            t.ok(query.email, 'email is in the link')
          }
        )
        .then(
          function () {
            return Client.loginAndVerify(config.publicUrl, email, newPassword, server.mailbox, {keys:true})
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
            t.deepEqual(keys.kB, kB, 'kB is preserved')
            t.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
    }
  )

  test(
    'wrong password on change start',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function () {
            client.authPW = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
            return client.changePassword('foobar')
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.errno, 103, 'invalid password')
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
