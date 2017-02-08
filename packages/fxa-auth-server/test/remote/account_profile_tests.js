/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var path = require('path')
var TestServer = require('../test_server')
const Client = require('../client')()

var config = require('../../config').getProperties()

function makeMockOAuthHeader(opts) {
  var token = Buffer.from(JSON.stringify(opts)).toString('hex')
  return 'Bearer ' + token
}

describe('remote account profile', function() {
  this.timeout(15000)

  let server
  before(() => {
    process.env.CONFIG_FILES = path.join(__dirname, '../config/mock_oauth.json')
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'account profile authenticated with session returns profile data',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(c.sessionToken)
          }
        )
        .then(
          function (response) {
            assert.ok(response.email, 'email address is returned')
            assert.equal(response.locale, 'en-US', 'locale is returned')
          }
        )
    }
  )

  it(
    'account profile authenticated with oauth returns profile data',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: c.uid,
                scope: ['profile']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.ok(response.email, 'email address is returned')
            assert.equal(response.locale, 'en-US', 'locale is returned')
          }
        )
    }
  )

  it(
    'account profile authenticated with invalid oauth token returns an error',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                code: 401,
                errno: 108
              })
            })
          }
        )
        .then(
          function () {
            assert(false, 'should get an error')
          },
          function (e) {
            assert.equal(e.code, 401, 'correct error status code')
            assert.equal(e.errno, 110, 'correct errno')
          }
        )
    }
  )

  it(
    'account status authenticated with oauth for unknown uid returns an error',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            var UNKNOWN_UID = 'abcdef123456'
            assert.notEqual(c.uid, UNKNOWN_UID)
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: UNKNOWN_UID,
                scope: ['profile']
              })
            })
          }
        )
        .then(
          function () {
            assert(false, 'should get an error')
          },
          function (e) {
            assert.equal(e.code, 400, 'correct error status code')
            assert.equal(e.errno, 102, 'correct errno')
          }
        )
    }
  )

  it(
    'account status authenticated with oauth for wrong scope returns no info',
    () => {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: c.uid,
                scope: ['readinglist', 'payments']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.deepEqual(response, {}, 'no info should be returned')
          }
        )
    }
  )

  it(
    'account profile authenticated with limited oauth scopes returns limited profile data',
    () => {
      var client
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            client = c
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:email']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.ok(response.email, 'email address is returned')
            assert.ok(! response.locale, 'locale should not be returned')
          }
        )
        .then(
          function () {
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:locale']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.ok(! response.email, 'email address should not be returned')
            assert.equal(response.locale, 'en-US', 'locale is returned')
          }
        )
    }
  )

  it(
    'account profile authenticated with oauth :write scopes returns profile data',
    () => {
      var client
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            client = c
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:write']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.ok(response.email, 'email address is returned')
            assert.ok(response.locale, 'locale is returned')
          }
        )
        .then(
          function () {
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:locale:write', 'readinglist']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.ok(! response.email, 'email address should not be returned')
            assert.ok(response.locale, 'locale is returned')
          }
        )
        .then(
          function () {
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['storage', 'profile:email:write']
              })
            })
          }
        )
        .then(
          function (response) {
            assert.ok(response.email, 'email address is returned')
            assert.ok(! response.locale, 'locale should not be returned')
          }
        )
    }
  )

  it(
    'account profile works with unicode email address',
    () => {
      var email = server.uniqueUnicodeEmail()
      return Client.create(config.publicUrl, email, 'password')
        .then(
          function (c) {
            return c.api.accountProfile(c.sessionToken)
          }
        )
        .then(
          function (response) {
            assert.equal(response.email, email, 'email address is returned')
          }
        )
    }
  )

  after(() => {
    delete process.env.CONFIG_FILES
    return TestServer.stop(server)
  })
})
