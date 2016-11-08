/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()
var JWTool = require('fxa-jwtool')

var config = require('../../config').getProperties()
var secretKey = JWTool.JWK.fromFile(
  config.secretKeyFile,
  {
    jku: config.publicUrl + '/.well-known/public-keys',
    kid: 'dev-1'
  }
)

function fail() { throw new Error('call succeeded when it should have failed')}

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

describe('remote account preverified token', function() {
  this.timeout(15000)
  let server
  before(() => {
    process.env.TRUSTED_JKUS = 'http://127.0.0.1:9000/.well-known/public-keys'
    process.env.SIGNIN_CONFIRMATION_ENABLED = false

    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'a valid preVerifyToken creates a verified account',
    () => {
      var email = server.uniqueEmail()
      var password = 'ok'
      var token = secretKey.signSync(
        {
          exp: nowSeconds() + 10,
          aud: config.domain,
          sub: email
        }
      )
      return Client.create(config.publicUrl, email, password, { preVerifyToken: token, keys: true })
        .then(
          function (c) {
            return c.keys()
          }
        )
        .then(
          function (keys) {
            assert.ok(Buffer.isBuffer(keys.kA), 'kA exists')
            assert.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists')
          }
        )
    }
  )

  it(
    'an invalid preVerifyToken return an invalid verification code error',
    () => {
      var email = server.uniqueEmail()
      var password = 'ok'
      var token = secretKey.signSync(
        {
          exp: nowSeconds() + 10,
          aud: config.domain,
          sub: 'wrong@example.com'
        }
      )
      return Client.create(config.publicUrl, email, password, { preVerifyToken: token })
        .then(
          fail,
          function (err) {
            assert.equal(err.errno, 105, 'invalid verification code')
          }
        )
    }
  )

  it(
    're-signup against an unverified email',
    function() {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.create(config.publicUrl, email, password)
        .then(
          function () {
            // delete the first verification email
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function () {
            var token = secretKey.signSync(
              {
                exp: nowSeconds() + 10,
                aud: config.domain,
                sub: email
              }
            )
            return Client.create(config.publicUrl, email, password, { preVerifyToken: token })
          }
        )
        .then(
          function (client) {
            assert.ok(client.uid, 'account created')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            assert.ok(Buffer.isBuffer(keys.kA), 'kA exists')
            assert.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
