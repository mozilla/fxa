/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var url = require('url')
var Client = require('../../client')
var path = require('path')
var TestServer = require('../test_server')

process.env.CONFIG_FILES = path.join(__dirname, '../config/account_tests.json')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'create account verify with incorrect code',
    function (t) {
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
            t.equal(status.verified, false)
          }
        )
        .then(
          function () {
            return client.verifyEmail('00000000000000000000000000000000')
          }
        )
        .then(
          function () {
            t.fail('verified email with bad code')
          },
          function (err) {
            t.equal(err.message.toString(), 'Invalid verification code', 'bad attempt')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, false, 'account not verified')
          }
        )
    }
  )

  test(
    'verifcation email link',
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
