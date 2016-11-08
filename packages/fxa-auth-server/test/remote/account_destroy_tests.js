/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const TestServer = require('../test_server')
const Client = require('../client')()

const config = require('../../config').getProperties()

describe('remote account destroy', () => {

  let server

  before(function() {
    this.timeout(15000)
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'account destroy',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            return client.sessionStatus()
          }
        )
        .then(
          function (status) {
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .then(
          function (keys) {
            assert(false, 'account not destroyed')
          },
          function (err) {
            assert.equal(err.message, 'Unknown account', 'account destroyed')
          }
        )
    }
  )

  it(
    'invalid authPW on account destroy',
    () => {
      var email = server.uniqueEmail()
      var password = 'ok'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            c.authPW = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
            return c.destroyAccount()
          }
        )
        .then(
          () => {
            assert(false)
          },
          function (err) {
            assert.equal(err.errno, 103)
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
