/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const Client = require('../client')()
var TestServer = require('../test_server')
var jwtool = require('fxa-jwtool')

var config = require('../../config').getProperties()

var pubSigKey = jwtool.JWK.fromFile(config.publicKeyFile)

describe('remote flow', function() {
  this.timeout(15000)
  let server
  let email1
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
        email1 = server.uniqueEmail()
      })
  })


  it(
    'Create account flow',
    () => {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var client = null
      var publicKey = {
        'algorithm': 'RS',
        'n': '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
        'e': '65537'
      }
      var duration = 1000 * 60 * 60 * 24 // 24 hours
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            assert.equal(typeof keys.kA, 'string', 'kA exists')
            assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists')
            assert.equal(typeof keys.kB, 'string', 'kB exists')
            assert.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            assert.equal(typeof(cert), 'string', 'cert exists')
            var payload = jwtool.verify(cert, pubSigKey.pem)
            assert.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
          }
        )
    }
  )

  it(
    'Login flow',
    () => {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var client = null
      var publicKey = {
        'algorithm': 'RS',
        'n': '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
        'e': '65537'
      }
      var duration = 1000 * 60 * 60 * 24 // 24 hours
      return Client.login(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (x) {
            client = x
            assert.ok(client.authAt, 'authAt was set')
            assert.ok(client.uid, 'got a uid')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            assert.equal(typeof keys.kA, 'string', 'kA exists')
            assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists')
            assert.equal(typeof keys.kB, 'string', 'kB exists')
            assert.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            assert.equal(typeof(cert), 'string', 'cert exists')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
