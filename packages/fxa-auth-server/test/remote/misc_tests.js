/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const TestServer = require('../test_server')
const Client = require('../client')()
const P = require('../../lib/promise')
const hawk = require('hawk')
const request = P.promisify(require('request'), { multiArgs: true })

const config = require('../../config').getProperties()

describe('remote misc', function() {
  this.timeout(15000)
  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  function testVersionRoute(route) {
    return () => {
      return request(config.publicUrl + route).spread((res, body) => {
        var json = JSON.parse(body)
        assert.deepEqual(Object.keys(json), ['version', 'commit', 'source'])
        assert.equal(json.version, require('../../package.json').version, 'package version')
        assert.ok(json.source && json.source !== 'unknown', 'source repository')

        // check that the git hash just looks like a hash
        assert.ok(json.commit.match(/^[0-9a-f]{40}$/), 'The git hash actually looks like one')
      })
    }
  }

  function testCORSHeader(withAllowedOrigin) {
    var randomAllowedOrigin = config.corsOrigin[Math.floor(Math.random() * config.corsOrigin.length)]
    var expectedOrigin = withAllowedOrigin ? randomAllowedOrigin : undefined

    return () => {
      var options = {
        url: config.publicUrl + '/'
      }
      if (withAllowedOrigin !== undefined) {
        options.headers = {
          'Origin': (withAllowedOrigin ? randomAllowedOrigin : 'http://notallowed')
        }
      }
      return request(options).spread((res, body) => {
        assert.equal(res.headers['access-control-allow-origin'], expectedOrigin, 'Access-Control-Allow-Origin header was set correctly')
      })
    }
  }

  it(
    'unsupported api version',
    () => {
      return request(config.publicUrl + '/v0/account/create').spread((res) => {
        assert.equal(res.statusCode, 410, 'http gone')
      })
    }
  )

  it(
    '/ returns version, git hash and source repo',
    testVersionRoute('/')
  )

  it(
    '/__version__ returns version, git hash and source repo',
    testVersionRoute('/__version__')
  )

  it(
    'returns no Access-Control-Allow-Origin with no Origin set',
    testCORSHeader(undefined)
  )

  it(
    'returns correct Access-Control-Allow-Origin with whitelisted Origin',
    testCORSHeader(true)
  )

  it(
    'returns no Access-Control-Allow-Origin with not whitelisted Origin',
    testCORSHeader(false)
  )

  it(
    '/verify_email redirects',
    () => {
      var path = '/v1/verify_email?code=0000&uid=0000'
      return request(
        {
          url: config.publicUrl + path,
          followRedirect: false
        })
        .spread((res, body) => {
          assert.equal(res.statusCode, 302, 'redirected')
          //assert.equal(res.headers.location, config.contentServer.url + path)
        })
    }
  )

  it(
    '/complete_reset_password redirects',
    () => {
      var path = '/v1/complete_reset_password?code=0000&email=a@b.c&token=0000'
      return request(
        {
          url: config.publicUrl + path,
          followRedirect: false
        })
        .spread((res, body) => {
          assert.equal(res.statusCode, 302, 'redirected')
          //assert.equal(res.headers.location, config.contentServer.url + path)
        })
    }
  )

  it(
    'timestamp header',
    () => {
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
            var method = 'GET'
            var verify = {
              credentials: token,
              timestamp: Math.floor(Date.now() / 1000)
            }
            var headers = {
              Authorization: hawk.client.header(url, method, verify).field
            }
            return request(
              {
                method: method,
                url: url,
                headers: headers,
                json: true
              })
              .spread((res, body) => {
                var now = +new Date() / 1000
                assert.ok(res.headers.timestamp > now - 60, 'has timestamp header')
                assert.ok(res.headers.timestamp < now + 60, 'has timestamp header')
              })
          }
        )
    }
  )

  it(
    'Strict-Transport-Security header',
    () => {
      return request(
        {
          url: config.publicUrl + '/'
        })
        .spread((res, body) => {
          assert.equal(res.headers['strict-transport-security'], 'max-age=15552000; includeSubDomains')
        })
    }
  )

  it(
    'oversized payload',
    () => {
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
          assert(false, 'request should have failed')
        },
        function (err) {
          if (err.errno) {
            assert.equal(err.errno, 113, 'payload too large')
          }
          else {
            // nginx returns an html response
            assert.ok(/413 Request Entity Too Large/.test(err), 'payload too large')
          }
        }
      )
    }
  )

  it(
    'random bytes',
    () => {
      var client = new Client(config.publicUrl)
      return client.api.getRandomBytes()
        .then(
          function (x) {
            assert.equal(x.data.length, 64)
          }
        )
    }
  )

  it(
    'fetch /.well-known/browserid support document',
    () => {
      var client = new Client(config.publicUrl)
      function fetch(url) {
        return client.api.doRequest('GET', config.publicUrl + url)
      }
      return fetch('/.well-known/browserid')
      .then(
        function (doc) {
          assert.ok(doc.hasOwnProperty('public-key'), 'doc has public key')
          assert.ok(/^[0-9]+$/.test(doc['public-key'].n), 'n is base 10')
          assert.ok(/^[0-9]+$/.test(doc['public-key'].e), 'e is base 10')
          assert.ok(doc.hasOwnProperty('authentication'), 'doc has auth page')
          assert.ok(doc.hasOwnProperty('provisioning'), 'doc has provisioning page')
          assert.equal(doc.keys.length, 1)
          return doc
        }
      )
      .then(
        function (doc) {
          return fetch(doc.authentication)
          .then(
            function (authPage) {
              assert.ok(authPage, 'auth page can be fetched')
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
              assert.ok(provPage, 'provisioning page can be fetched')
              return doc
            }
          )
        }
      )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
