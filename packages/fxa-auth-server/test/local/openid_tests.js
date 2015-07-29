/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var qs = require('querystring')
var url = require('url')
var Pool = require('poolee')

process.env.OPENID_PROVIDERS = 'https://me.yahoo.com,https://openid.example.com'
var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  test(
    'openid authenticate redirects to provider',
    function (t) {
      Pool.request(
        config.publicUrl + '/v1/account/openid/authenticate?' + qs.stringify(
          {
            identifier: 'https://me.yahoo.com'
          }
        ),
        function (err, res) {
          t.equal(res.statusCode, 302)
          var location = url.parse(res.headers.location)
          t.equal(location.hostname, 'open.login.yahooapis.com')
          t.end()
        }
      )
    }
  )

  test(
    'openid authenticate rejects providers not on the allow list',
    function (t) {
      Pool.request(
        config.publicUrl + '/v1/account/openid/authenticate?' + qs.stringify(
          {
            identifier: 'https://example.com'
          }
        ),
        function (err, res) {
          t.equal(res.statusCode, 302)
          var location = url.parse(res.headers.location, true)
          t.equal(location.query.err, 'This OpenID Provider is not allowed')
          t.end()
        }
      )
    }
  )

  test(
    'openid authenticate rejects allowed but invalid providers',
    function (t) {
      // this should never happen in real life
      Pool.request(
        config.publicUrl + '/v1/account/openid/authenticate?' + qs.stringify(
          {
            identifier: 'https://openid.example.com'
          }
        ),
        function (err, res) {
          t.equal(res.statusCode, 302)
          var location = url.parse(res.headers.location, true)
          t.equal(location.query.err, 'No providers found for the given identifier')
          t.end()
        }
      )
    }
  )

  test(
    'bare request to openid login returns the XRDS doc',
    function (t) {
      Pool.request(
        config.publicUrl + '/v1/account/openid/login',
        function (err, res, body) {
          t.equal(res.statusCode, 200)
          t.equal(res.headers['content-type'], 'application/xrds+xml')
          t.end()
        }
      )
    }
  )

  test(
    'openid login rejects invalid assertions',
    function (t) {
      Pool.request(
        config.publicUrl + '/v1/account/openid/login?foo=bar',
        function (err, res) {
          t.equal(res.statusCode, 302)
          var location = url.parse(res.headers.location, true)
          t.equal(location.query.err, 'Unknown Account')
          t.end()
        }
      )
    }
  )

  // test(
  //   'openid login rejects valid assertions for non-allowed providers'
  // )


  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
