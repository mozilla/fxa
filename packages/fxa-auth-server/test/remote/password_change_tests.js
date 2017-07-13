/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const Client = require('../client')()
var config = require('../../config').getProperties()
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

describe('remote password change', function() {
  this.timeout(15000)
  let server
  before(() => {
    config.securityHistory.ipProfiling.allowedRecency = 0
    config.signinConfirmation.skipForNewAccounts.enabled = false

    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'password change, with unverified session',
    () => {
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
            assert.equal(status.verified, true, 'account is verified')
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
            assert.equal(status.verified, false, 'account is unverified')
            assert.equal(status.emailVerified, true, 'account email is verified')
            assert.equal(status.sessionVerified, false, 'account session is unverified')
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
            assert.notEqual(response.sessionToken, originalSessionToken, 'session token has changed')
            assert.ok(response.keyFetchToken, 'key fetch token returned')
            assert.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
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
            assert.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            assert.ok(query.email, 'email is in the link')
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
            assert.equal(status.verified, false, 'account is unverified')
            assert.equal(status.emailVerified, true, 'account email is verified')
            assert.equal(status.sessionVerified, false, 'account session is unverified')
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
            assert.deepEqual(keys.kB, kB, 'kB is preserved')
            assert.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
    }
  )

  it(
    'password change, with verified session',
    () => {
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
            assert.equal(status.verified, true, 'account is verified')
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
            assert.notEqual(response.sessionToken, originalSessionToken, 'session token has changed')
            assert.ok(response.keyFetchToken, 'key fetch token returned')
            assert.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
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
            assert.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            assert.ok(query.email, 'email is in the link')
            assert.equal(emailData.html.indexOf('IP address') > -1, true, 'contains ip location data')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified')
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
            assert.deepEqual(keys.kB, kB, 'kB is preserved')
            assert.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
    }
  )

  it(
    'password change, with raw session data rather than session token id, return invalid token error',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var client

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
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
            assert.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword, undefined, client.sessionToken)
          }
        )
        .then(
          function () {
            assert(false)
          },
          function (err) {
            assert.equal(err.errno, 110, 'Invalid token error')
            assert.equal(err.message, 'The authentication token could not be found')
          }
        )
    }
  )

  it(
    'password change w/o sessionToken',
    () => {
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
            assert(! response.sessionToken, 'no session token returned')
            assert(! response.keyFetchToken, 'no key fetch token returned')
            assert.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
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
            assert.equal(subject, 'Your Firefox Account password has been changed', 'password email subject set correctly')
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            assert.ok(query.email, 'email is in the link')
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
            assert.deepEqual(keys.kB, kB, 'kB is preserved')
            assert.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
    }
  )

  it(
    'wrong password on change start',
    () => {
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
          () => assert(false),
          function (err) {
            assert.equal(err.errno, 103, 'invalid password')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
