/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var url = require('url')
const Client = require('../client')()
var TestServer = require('../test_server')

var config = require('../../config').getProperties()

describe('remote recovery email verify', function() {
  this.timeout(15000)
  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'create account verify with incorrect code',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'new account is not verified')
          }
        )
        .then(
          function () {
            return client.verifyEmail('00000000000000000000000000000000')
          }
        )
        .then(
          function () {
            assert(false, 'verified email with bad code')
          },
          function (err) {
            assert.equal(err.message.toString(), 'Invalid verification code', 'bad attempt')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'account not verified')
          }
        )
    }
  )

  it(
    'verification email link',
    () => {
      var email = server.uniqueEmail()
      var password = 'something'
      var client = null // eslint-disable-line no-unused-vars
      var options = {
        redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
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
          function (emailData) {
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            assert.ok(query.uid, 'uid is in link')
            assert.ok(query.code, 'code is in link')
            assert.equal(query.redirectTo, options.redirectTo, 'redirectTo is in link')
            assert.equal(query.service, options.service, 'service is in link')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
