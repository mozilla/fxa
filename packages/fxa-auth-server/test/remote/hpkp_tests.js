/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const P = require('../../lib/promise')
const TestServer = require('../test_server')
const request = P.promisify(require('request'), { multiArgs: true })

describe('remote hpkp', function() {
  this.timeout(30000)

  it(
    'Fails with no sha pins set',
    () => {
      process.env.HPKP_ENABLE = true
      process.env.HPKP_PIN_SHA256 = []
      var Server = require('../../lib/server')
      var config = require('../../config').getProperties()
      assert.throws(() => {
        Server.create({},{},config,{})
      }, 'ValidationError: child "sha256s" fails because ["sha256s" must contain at least 1 items]', 'assert server error if no sha passed')
    }
  )

  it(
    'Does not send HPKP header when disabled',
    () => {
      process.env.HPKP_ENABLE = false

      var config = require('../../config').getProperties()
      var server

      return TestServer.start(config)
        .then(function main(serverObj) {
          server = serverObj
        })
        .then(function () {
          return request({
            url: config.publicUrl + '/'
          })
        })
        .spread(function (res) {
          assert.equal(res.headers['public-key-pins-report-only'], undefined, 'HPKP header not set')
        })
        .then(function () {
          return server.stop()
        })
    }
  )

  it(
    'Sends HPKP header',
    () => {
      process.env.HPKP_ENABLE = true
      process.env.HPKP_REPORT_ONLY = false
      process.env.HPKP_PIN_SHA256 = ['sha1=', 'sha2=']

      var config = require('../../config').getProperties()
      var server

      return TestServer.start(config)
        .then(function main(serverObj) {
          server = serverObj
        })
        .then(function () {
          return request({
            url: config.publicUrl + '/'
          })
        })
        .spread(function (res) {
          var headerValue = 'pin-sha256="sha1="; pin-sha256="sha2="; max-age=1; includeSubdomains'
          assert.equal(res.headers['public-key-pins'], headerValue, 'HPKP header was set correctly')
        })
        .then(function () {
          return server.stop()
        })
    }
  )

  it(
    'Sends HPKP report header',
    () => {
      process.env.HPKP_ENABLE = true
      process.env.HPKP_REPORT_ONLY = true
      process.env.HPKP_PIN_SHA256 = ['sha1=', 'sha2=']
      process.env.HPKP_REPORT_URI = 'http://example.com'

      var config = require('../../config').getProperties()
      var server

      return TestServer.start(config)
        .then(function main(serverObj) {
          server = serverObj
        })
        .then(function () {
          return request({
            url: config.publicUrl + '/'
          })
        })
        .spread(function (res) {
          var headerValue = 'pin-sha256="sha1="; pin-sha256="sha2="; max-age=1; includeSubdomains; report-uri="http://example.com"'
          assert.equal(res.headers['public-key-pins-report-only'], headerValue, 'HPKP report header was set correctly')
        })
        .then(function () {
          return server.stop()
        })
    }
  )

  after(() => {
    delete process.env.HPKP_ENABLE
    delete process.env.HPKP_REPORT_ONLY
    delete process.env.HPKP_PIN_SHA256
    delete process.env.HPKP_REPORT_URI
    return TestServer.stop()
  })
})
