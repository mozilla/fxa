/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()

var config = require('../../config').getProperties()

describe('remote session destroy', function() {
  this.timeout(15000)
  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'session destroy',
    () => {
      var email = server.uniqueEmail()
      var password = 'foobar'
      var client = null
      var sessionToken = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            return client.sessionStatus()
          }
        )
        .then(
          function () {
            sessionToken = client.sessionToken
            return client.destroySession()
          }
        )
        .then(
          function () {
            assert.equal(client.sessionToken, null, 'session token deleted')
            client.sessionToken = sessionToken
            return client.sessionStatus()
          }
        )
        .then(
          function (status) {
            assert(false, 'got status with destroyed session')
          },
          function (err) {
            assert.equal(err.errno, 110, 'session is invalid')
          }
        )
    }
  )

  it(
    'session destroy a custom token',
    () => {
      var email = server.uniqueEmail()
      var password = 'foobar'
      var client = null
      var tokenId = null
      var sessionTokenCreate = null
      var sessionTokenLogin = null
      return Client.create(config.publicUrl, email, password)
        .then((x) => {
          client = x
          sessionTokenCreate = client.sessionToken
          return client.api.sessions(sessionTokenCreate)
        })
        .then((sessions) => {
          tokenId = sessions[0].id
          return client.login()
        })
        .then((c) => {
          sessionTokenLogin = c.sessionToken
          return client.api.sessionStatus(sessionTokenCreate)
        })
        .then((status) => {
          assert.ok(status.uid, 'got valid session')

          return client.api.sessionDestroy(sessionTokenLogin, {
            customSessionToken: tokenId
          })
        })
        .then(() => {
          return client.api.sessionStatus(sessionTokenCreate)
        }, () => {
          assert(false, 'failed to destroy the session')
        })
        .then((status) => {
          assert(false, 'got status with destroyed session')
        },(err) => {
          assert.equal(err.code, 401)
          assert.equal(err.errno, 110, 'session is invalid')

        })
    }
  )

  it(
    'session destroy fails with a bad custom token',
    () => {
      var email = server.uniqueEmail()
      var password = 'foobar'
      var client = null
      var sessionTokenCreate = null
      var sessionTokenLogin = null
      return Client.create(config.publicUrl, email, password)
        .then((x) => {
          client = x
          sessionTokenCreate = client.sessionToken
          return client.login()
        })
        .then((c) => {
          sessionTokenLogin = c.sessionToken
          return client.api.sessionStatus(sessionTokenCreate)
        })
        .then(() => {
          return client.api.sessionDestroy(sessionTokenLogin, {
            customSessionToken: 'eff779f59ab974f800625264145306ce53185bb22ee01fe80280964ff2766504'
          })
        })
        .then(() => {
          return client.api.sessionStatus(sessionTokenCreate)
        })
        .then(
          function (status) {
            assert(false, 'got status with destroyed session')
          },
          function (err) {
            assert.equal(err.code, 401)
            assert.equal(err.errno, 110, 'session is invalid')
            assert.equal(err.error, 'Unauthorized')
            assert.equal(err.message, 'The authentication token could not be found')
          }
        )
    }
  )

  it(
    'session status with valid token',
    () => {
      var email = server.uniqueEmail()
      var password = 'testx'
      var uid = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (c) {
            uid = c.uid
            return c.login()
              .then(
                function () {
                  return c.api.sessionStatus(c.sessionToken)
                }
              )
          }
        )
        .then(
          function (x) {
            assert.deepEqual(x, { uid: uid }, 'good status')
          }
        )
    }
  )

  it(
    'session status with invalid token',
    () => {
      var client = new Client(config.publicUrl)
      return client.api.sessionStatus('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF')
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.errno, 110, 'invalid token')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
