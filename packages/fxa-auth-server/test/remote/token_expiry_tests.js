/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()

function fail() { throw new Error() }

describe('remote token expiry', function() {
  this.timeout(15000)
  let server, config
  before(() => {
    process.env.PASSWORD_CHANGE_TOKEN_TTL = '1'
    config = require('../../config').getProperties()

    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'token expiry',
    () => {
      // FYI config.tokenLifetimes.passwordChangeToken = 1
      var email = Math.random() + '@example.com'
      var password = 'ok'
      return Client.create(config.publicUrl, email, password, { preVerified: true })
        .then(
          function (c) {
            return c.changePassword('hello')
          }
        )
        .then(
          fail,
          function (err) {
            assert.equal(err.errno, 110, 'invalid token')
          }
        )
    }
  )

  after(() => {
    delete process.env.PASSWORD_CHANGE_TOKEN_TTL
    return TestServer.stop(server)
  })
})
