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
      var Server = require('../../lib/server')
      var config = require('../../config').getProperties()
      config.hpkpConfig.enabled = true
      config.hpkpConfig.sha256s = []
      assert.throws(() => {
        Server.create({},{},config,{})
      }, 'ValidationError: child "sha256s" fails because ["sha256s" must contain at least 1 items]', 'assert server error if no sha passed')
    }
  )

  it(
    'Does not send HPKP header when disabled',
    () => {
      var config = require('../../config').getProperties()
      config.hpkpConfig.enabled = false
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
      var config = require('../../config').getProperties()
      var server
      config.hpkpConfig.enabled = true
      config.hpkpConfig.reportOnly = false
      config.hpkpConfig.sha256s = ['sha1=', 'sha2=']


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
      var config = require('../../config').getProperties()
      var server
      config.hpkpConfig.enabled = true
      config.hpkpConfig.reportOnly = true
      config.hpkpConfig.sha256s = ['sha1=', 'sha2=']
      config.hpkpConfig.reportUri = 'http://example.com'


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
    return TestServer.stop()
  })
})
