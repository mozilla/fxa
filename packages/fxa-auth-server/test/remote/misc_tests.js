/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var P = require('../../lib/promise')
var hawk = require('hawk')
var request = require('request')


var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  function testVersionRoute(route) {
    return function (t) {
      request(config.publicUrl + route, function (err, res, body) {
        t.ok(!err, 'No error fetching ' + route)

        var json = JSON.parse(body)
        t.deepEqual(Object.keys(json), ['version', 'commit', 'source'])
        t.equal(json.version, require('../../package.json').version, 'package version')
        t.ok(json.source && json.source !== 'unknown', 'source repository')

        // check that the git hash just looks like a hash
        t.ok(json.commit.match(/^[0-9a-f]{40}$/), 'The git hash actually looks like one')
        t.end()
      })
    }
  }

  function testCORSHeader(withAllowedOrigin) {
    var randomAllowedOrigin = config.corsOrigin[Math.floor(Math.random() * config.corsOrigin.length)]
    var expectedOrigin = withAllowedOrigin ? randomAllowedOrigin : undefined

    return function(t) {
      var options = {
        url: config.publicUrl + '/'
      }
      if (withAllowedOrigin !== undefined) {
        options.headers = {
          'Origin': (withAllowedOrigin ? randomAllowedOrigin : 'http://notallowed')
        }
      }
      request(options, function(err, res, body) {
        t.equal(res.headers['access-control-allow-origin'], expectedOrigin, 'Access-Control-Allow-Origin header was set correctly')
        t.end()
      })
    }
  }

  test(
    'unsupported api version',
    function (t) {
      request(config.publicUrl + '/v0/account/create', function (err, res) {
        t.equal(res.statusCode, 410, 'http gone')
        t.end()
      })
    }
  )

  test(
    '/ returns version, git hash and source repo',
    testVersionRoute('/')
  )

  test(
    '/__version__ returns version, git hash and source repo',
    testVersionRoute('/__version__')
  )

  test(
    'returns no Access-Control-Allow-Origin with no Origin set',
    testCORSHeader(undefined)
  )

  test(
    'returns correct Access-Control-Allow-Origin with whitelisted Origin',
    testCORSHeader(true)
  )

  test(
    'returns no Access-Control-Allow-Origin with not whitelisted Origin',
    testCORSHeader(false)
  )

  test(
    '/verify_email redirects',
    function (t) {
      var path = '/v1/verify_email?code=0000&uid=0000'
      request(
        {
          url: config.publicUrl + path,
          followRedirect: false
        },
        function (err, res, body) {
          t.equal(res.statusCode, 302, 'redirected')
          //t.equal(res.headers.location, config.contentServer.url + path)
          t.end()
        }
      )
    }
  )

  test(
    '/complete_reset_password redirects',
    function (t) {
      var path = '/v1/complete_reset_password?code=0000&email=a@b.c&token=0000'
      request(
        {
          url: config.publicUrl + path,
          followRedirect: false
        },
        function (err, res, body) {
          t.equal(res.statusCode, 302, 'redirected')
          //t.equal(res.headers.location, config.contentServer.url + path)
          t.end()
        }
      )
    }
  )

  test(
    'timestamp header',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var url = null
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            return client.login()
          }
        )
        .then(
          function () {
            url = client.api.baseURL + '/account/keys'
            return client.api.Token.KeyFetchToken.fromHex(client.keyFetchToken)
          }
        )
        .then(
          function (token) {
            var d = P.defer()
            var method = 'GET'
            var verify = {
              credentials: token,
              timestamp: Math.floor(Date.now() / 1000)
            }
            var headers = {
              Authorization: hawk.client.header(url, method, verify).field
            }
            request(
              {
                method: method,
                url: url,
                headers: headers,
                json: true
              },
              function (err, res, body) {
                if (err) {
                  d.reject(err)
                } else {
                  var now = +new Date() / 1000
                  t.ok(res.headers.timestamp > now - 60, 'has timestamp header')
                  t.ok(res.headers.timestamp < now + 60, 'has timestamp header')
                  d.resolve()
                }
              }
            )
            return d.promise
          }
        )
    }
  )

  test(
    'Strict-Transport-Security header',
    function (t) {
      request(
        {
          url: config.publicUrl + '/'
        },
        function (err, res, body) {
          t.equal(res.headers['strict-transport-security'], 'max-age=15552000; includeSubdomains')
          t.end()
        }
      )
    }
  )

  test(
    'oversized payload',
    function (t) {
      var client = new Client(config.publicUrl)
      return client.api.doRequest(
        'POST',
        client.api.baseURL + '/get_random_bytes',
        null,
        // See payload.maxBytes in ../../server/server.js
        { big: Buffer(8192).toString('hex')}
      )
      .then(
        function (body) {
          t.fail('request should have failed')
        },
        function (err) {
          if (err.errno) {
            t.equal(err.errno, 113, 'payload too large')
          }
          else {
            // nginx returns an html response
            t.ok(/413 Request Entity Too Large/.test(err), 'payload too large')
          }
        }
      )
    }
  )

  test(
    'random bytes',
    function (t) {
      var client = new Client(config.publicUrl)
      return client.api.getRandomBytes()
        .then(
          function (x) {
            t.equal(x.data.length, 64)
          }
        )
    }
  )

  test(
    'fetch /.well-known/browserid support document',
    function (t) {
      var client = new Client(config.publicUrl)
      function fetch(url) {
        return client.api.doRequest('GET', config.publicUrl + url)
      }
      return fetch('/.well-known/browserid')
      .then(
        function (doc) {
          t.ok(doc.hasOwnProperty('public-key'), 'doc has public key')
          t.ok(/^[0-9]+$/.test(doc['public-key'].n), 'n is base 10')
          t.ok(/^[0-9]+$/.test(doc['public-key'].e), 'e is base 10')
          t.ok(doc.hasOwnProperty('authentication'), 'doc has auth page')
          t.ok(doc.hasOwnProperty('provisioning'), 'doc has provisioning page')
          t.equal(doc.keys.length, 1)
          return doc
        }
      )
      .then(
        function (doc) {
          return fetch(doc.authentication)
          .then(
            function (authPage) {
              t.ok(authPage, 'auth page can be fetched')
              return doc
            }
          )
        }
      )
      .then(
        function (doc) {
          return fetch(doc.provisioning)
          .then(
            function (provPage) {
              t.ok(provPage, 'provisioning page can be fetched')
              return doc
            }
          )
        }
      )
    }
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
