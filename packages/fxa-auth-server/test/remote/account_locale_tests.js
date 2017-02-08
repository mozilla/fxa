/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const TestServer = require('../test_server')
const Client = require('../client')()

var config = require('../../config').getProperties()
var key = {
  'algorithm': 'RS',
  'n': '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  'e': '65537'
}

describe('remote account locale', function() {
  this.timeout(15000)

  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'signing a cert against an account with no locale will save the locale',
    () => {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            return c.api.accountStatus(c.uid, c.sessionToken)
          }
        )
        .then(
          function (response) {
            assert.ok(! response.locale, 'account has no locale')
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
            return client.api.accountStatus(client.uid, client.sessionToken)
          }
        )
        .then(
          function (response) {
            assert.equal(response.locale, 'en-US', 'account has a locale')
          }
        )
    }
  )

  it(
    'a really long (invalid) locale',
    () => {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      return Client.create(
        config.publicUrl,
        email,
        password,
        { lang: Buffer(128).toString('hex') }
      )
      .then(
        function (c) {
          return c.api.accountStatus(c.uid, c.sessionToken)
        }
      )
      .then(
        function (response) {
          assert.ok(! response.locale, 'account has no locale')
        }
      )
    }
  )

  it(
    'a really long (valid) locale',
    () => {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      return Client.create(
        config.publicUrl,
        email,
        password,
        { lang: 'en-US,en;q=0.8,' + Buffer(128).toString('hex') }
      )
      .then(
        function (c) {
          return c.api.accountStatus(c.uid, c.sessionToken)
        }
      )
      .then(
        function (response) {
          assert.equal(response.locale, 'en-US,en;q=0.8', 'account has no locale')
        }
      )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })

})
