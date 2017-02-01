/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()
var jwtool = require('fxa-jwtool')

var config = require('../../config').getProperties()
var pubSigKey = jwtool.JWK.fromFile(config.publicKeyFile)

var publicKey = {
  'algorithm': 'RS',
  'n': '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  'e': '65537'
}

describe('remote certificate sign', function() {
  this.timeout(15000)
  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'certificate sign',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var duration = 1000 * 60 * 60 * 24 // 24 hours
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (c) {
            client = c
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            assert.equal(typeof(cert), 'string', 'cert exists')
            var payload = jwtool.verify(cert, pubSigKey.pem)
            assert.equal(payload.iss, config.domain, 'issuer is correct')
            assert.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
            assert.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number')
            assert.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible')
            assert.equal(payload['fxa-verifiedEmail'], email, 'verifiedEmail is correct')
            assert.equal(payload['fxa-tokenVerified'], true, 'tokenVerified is correct')
          }
        )
    }
  )

  it(
    'certificate sign requires a verified account',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var duration = 1000 * 60 * 60 * 24 // 24 hours
      return Client.create(config.publicUrl, email, password)
        .then(
          function (c) {
            client = c
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            assert(false, 'should not be able to sign with unverified account')
          },
          function (err) {
            assert.equal(err.errno, 104, 'should get an unverifiedAccount error')
          }
        )
    }
  )

  it(
    '/certificate/sign inputs',
    () => {
      var email = server.uniqueEmail()
      var password = '123456'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            // string as publicKey
            return client.sign('tada', 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'string as publicKey')
            // empty object as publicKey
            return client.sign({}, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'empty object as publicKey')
            // undefined duration
            return client.sign({ algorithm: 'RS', n: 'x', e: 'y' }, undefined)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'undefined duration')
            // missing publicKey arguments (e)
            return client.sign({ algorithm: 'RS', n: 'x' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'missing publicKey arguments (e)')
            // missing publicKey arguments (n)
            return client.sign({ algorithm: 'RS', e: 'x' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'missing publicKey arguments (n)')
            // missing publicKey arguments (y)
            return client.sign({ algorithm: 'DS', p: 'p', q: 'q', g: 'g' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'missing publicKey arguments (y)')
            // missing publicKey arguments (p)
            return client.sign({ algorithm: 'DS', y: 'y', q: 'q', g: 'g' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'missing publicKey arguments (p)')
            // missing publicKey arguments (q)
            return client.sign({ algorithm: 'DS', y: 'y', p: 'p', g: 'g' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'missing publicKey arguments (q)')
            // missing publicKey arguments (g)
            return client.sign({ algorithm: 'DS', y: 'y', p: 'p', q: 'q' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'missing publicKey arguments (g)')
            // invalid algorithm
            return client.sign({ algorithm: 'NSA' }, 1000)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400, 'invalid algorithm')
          }
        )
    }
  )

  it(
    'no payload',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var duration = 1000 * 60 * 60 * 24 // 24 hours
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (client) {
            client.api.once(
              'startRequest',
              function hijackPayload(options) {
                // we want the payload hash in the auth header
                // but no payload in the request body
                options.json = true
              }
            )
            return client.api.Token.SessionToken.fromHex(client.sessionToken)
              .then(
                function (token) {
                  return client.api.doRequest(
                    'POST',
                    client.api.baseURL + '/certificate/sign',
                    token,
                    {
                      publicKey: publicKey,
                      duration: duration
                    }
                  )
                }
              )
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.errno, 109, 'Missing payload authentication')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
