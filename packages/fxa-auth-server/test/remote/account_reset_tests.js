/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var url = require('url')
const Client = require('../client')()
var TestServer = require('../test_server')

var config = require('../../config').getProperties()

describe('remote account reset', function() {
  this.timeout(15000)
  let server
  config.signinConfirmation.skipForNewAccounts.enabled = true
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'account reset w/o sessionToken',
    () => {
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
            assert.throws(function() {
              client.resetPassword(newPassword)
            })
            return resetPassword(client, code, newPassword, {sessionToken: false})
          }
        )
        .then(
          function (response) {
            assert(! response.sessionToken, 'session token is not in response')
            assert(! response.keyFetchToken, 'keyFetchToken token is not in response')
            assert(! response.verified, 'verified is not in response')
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
          }
        )
        .then(
          function () {
            // make sure we can still login after password reset
            return Client.login(config.publicUrl, email, newPassword, {keys:true})
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
            assert.notEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
            assert.equal(kA, keys.kA, 'kA was not reset')
            assert.equal(typeof client.kB, 'string')
            assert.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
    }
  )

  it(
    'account reset with keys',
    () => {
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
            assert.throws(function() {
              client.resetPassword(newPassword)
            })
            return resetPassword(client, code, newPassword,  {keys:true})
          }
        )
        .then(
          function (response) {
            assert.ok(response.sessionToken, 'session token is in response')
            assert.ok(response.keyFetchToken, 'keyFetchToken token is in response')
            assert.equal(response.verified, true,  'verified is true')
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
          }
        )
        .then(
          function () {
            // make sure we can still login after password reset
            return Client.login(config.publicUrl, email, newPassword, {keys:true})
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
            assert.notEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
            assert.equal(kA, keys.kA, 'kA was not reset')
            assert.equal(typeof client.kB, 'string')
            assert.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
    }
  )

  it(
    'account reset w/o keys, with sessionToken',
    () => {
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
            assert.throws(function() {
              client.resetPassword(newPassword)
            })
            return resetPassword(client, code, newPassword)
          }
        )
        .then(
          function (response) {
            assert.ok(response.sessionToken, 'session token is in response')
            assert(! response.keyFetchToken, 'keyFetchToken token is not in response')
            assert.equal(response.verified, true,  'verified is true')
          }
        )
    }
  )

  it(
    'account reset deletes tokens',
    () => {
      const email = server.uniqueEmail()
      const password = 'allyourbasearebelongtous'
      const newPassword = 'ez'
      let client = null
      let originalCode = null
      const opts = {
        keys: true
      }
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, opts)
        .then((x) => {
          client = x

          return client.forgotPassword()
        })
        .then(() => server.mailbox.waitForCode(email))
        .then((code) => {
          // Stash original reset code then attempt to use it after another reset
          originalCode = code

          return client.forgotPassword()
        })
        .then(() => server.mailbox.waitForCode(email))
        .then((code) => {
          assert.throws(() => client.resetPassword(newPassword))

          return resetPassword(client, code, newPassword, undefined, opts)
        })
        .then(() => server.mailbox.waitForEmail(email))
        .then((emailData) => {
          const templateName = emailData.headers['x-template-name']
          assert.equal(templateName, 'passwordResetEmail')

          return resetPassword(client, originalCode, newPassword, undefined, opts)
            .then(() => assert.fail('Should not have succeeded password reset'),
              (err) => {
                // Ensure that password reset fails with unknown token error codes
                assert.equal(err.code, 401)
                assert.equal(err.errno, 110)
              })
        })
    }
  )

  after(() => {
    return TestServer.stop(server)
  })

  function resetPassword(client, code, newPassword, options) {
    return client.verifyPasswordResetCode(code)
      .then(function() {
        return client.resetPassword(newPassword, {}, options)
      })
  }
})
