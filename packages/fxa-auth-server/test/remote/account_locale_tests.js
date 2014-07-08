/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')

var config = require('../../config').root()
var key = {
  "algorithm":"RS",
  "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
  "e":"65537"
}

TestServer.start(config)
.then(function main(server) {

  test(
    'signing a cert against an account with no locale will save the locale',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            return c.api.accountStatus(c.uid)
          }
        )
        .then(
          function (response) {
            t.ok(!response.locale, 'account has no locale')
            return client.login()
          }
        )
        .then(
          function () {
            return client.api.certificateSign(
              client.sessionToken,
              key,
              1000,
              'en-US'
            )
          }
        )
        .then(
          function () {
            return client.api.accountStatus(client.uid)
          }
        )
        .then(
          function (response) {
            t.equal(response.locale, 'en-US', 'account has a locale')
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
