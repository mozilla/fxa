/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('bluebird')
var test = require('../ptaptest')
var TestServer = require('../test_server')
var request = P.promisify(require('request'))

test(
  'Fails with no sha pins set',
  function (t) {
    process.env.HPKP_ENABLE = true
    process.env.HPKP_PIN_SHA256 = []
    var Server = require('../../lib/server')
    var config = require('../../config').getProperties()
    try{
      Server.create({},{},config,{})
      t.fail()
      t.end()
    } catch(e){
      t.equal(e.message, 'ValidationError: child "sha256s" fails because ["sha256s" must contain at least 1 items]', 'assert server error if no sha passed')
      t.end()
    }
  }
)

test(
  'Does not send HPKP header when disabled',
  function (t) {
    process.env.HPKP_ENABLE = false

    var config = require('../../config').getProperties()
    var server

    TestServer.start(config)
      .then(function main(serverObj) {
        server = serverObj
      })
      .then(function () {
        return request({
          url: config.publicUrl + '/'
        })
      })
      .spread(function (res) {
        t.equal(res.headers['public-key-pins-report-only'], undefined, 'HPKP header not set')
      })
      .done(function () {
        server.stop()
        t.end()
      })
  }
)

test(
  'Sends HPKP header',
  function (t) {
    process.env.HPKP_ENABLE = true
    process.env.HPKP_REPORT_ONLY = false
    process.env.HPKP_PIN_SHA256 = ['sha1=', 'sha2=']

    var config = require('../../config').getProperties()
    var server

    TestServer.start(config)
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
        t.equal(res.headers['public-key-pins'], headerValue, 'HPKP header was set correctly')
      })
      .done(function () {
        server.stop()
        t.end()
      })
  }
)

test(
  'Sends HPKP report header',
  function (t) {
    process.env.HPKP_ENABLE = true
    process.env.HPKP_REPORT_ONLY = true
    process.env.HPKP_PIN_SHA256 = ['sha1=', 'sha2=']
    process.env.HPKP_REPORT_URI = 'http://example.com'

    var config = require('../../config').getProperties()
    var server

    TestServer.start(config)
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
        t.equal(res.headers['public-key-pins-report-only'], headerValue, 'HPKP report header was set correctly')
      })
      .done(function () {
        server.stop()
        t.end()
      })
  }
)
