/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var util = require('util')
var child_process = require('child_process')

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../../client')
var P = require('../../promise')
var hawk = require('hawk')
var request = require('request')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

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
    '/ returns version and git hash',
    function (t) {
      request(config.publicUrl + '/', function (err, res, body) {
        t.ok(!err, 'No error fetching /')

        var json = JSON.parse(body)
        t.equal(json.version, require('../../package.json').version, 'package version')

        // check that the git hash just looks like a hash
        t.ok(json.commit.match(/^[0-9a-f]{40}$/), 'The git hash actually looks like one')
        t.end();
      })
    }
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
    'HAWK timestamp',
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
              timestamp: Math.floor(Date.now() / 1000) - 120
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
                  t.equal(body.errno, 111, 'invalid auth timestamp')
                  var now = +new Date() / 1000
                  t.ok(body.serverTime > now - 5, 'includes current time')
                  t.ok(body.serverTime < now + 5, 'includes current time')
                  d.resolve()
                }
              }
            )
            return d.promise
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'auth-failure': 1
            })
          }
        )
    }
  )

  test(
    'HAWK nonce re-use',
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
            url = client.api.baseURL + '/account/devices'
            return client.api.Token.SessionToken.fromHex(client.sessionToken)
          }
        )
        .then(
          function (token) {
            var d = P.defer()
            var method = 'GET'
            var verify = {
              credentials: token,
              nonce: 'abcdef'
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
                  t.equal(res.statusCode, 200, 'fresh nonce is accepted')
                  d.resolve(token)
                }
              }
            )
            return d.promise
          }
        )
        .then(
          function (token) {
            var d = P.defer()
            var hawk = require('hawk')
            var request = require('request')
            var method = 'GET'
            var verify = {
              credentials: token,
              nonce: 'abcdef'
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
                  t.equal(res.statusCode, 401, 'duplicate nonce is rejected')
                  t.equal(body.errno, 115, 'duplicate nonce is rejected')
                  d.resolve()
                }
              }
            )
            return d.promise
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'auth-failure': 1
            })
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
                  t.ok(res.headers.timestamp > now - 5, 'has timestamp header')
                  t.ok(res.headers.timestamp < now + 5, 'has timestamp header')
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
    'client adjusts to time skew',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            return client.login()
          }
        )
        .then(
          function () {
            client.api.timeOffset = 90000
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.fail("client should have invalid timestamp")
          },
          function (err) {
            t.equal(err.errno, 111, 'invalid timestamp')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.ok(keys, 'client readjust to timestamp')
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
        { big: Buffer(1024 * 512).toString('hex')}
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
          t.ok(doc.hasOwnProperty('authentication'), 'doc has auth page')
          t.ok(doc.hasOwnProperty('provisioning'), 'doc has provisioning page')
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
