/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var TestServer = require('../test_server')
var Promise = require('bluebird')
var restify = Promise.promisifyAll(require('restify'))
var mcHelper = require('../memcache-helper')

var config = {
  listen: {
    port: 7000
  }
}

process.env.UPDATE_POLL_INTERVAL_SECONDS = 1

var testServer = new TestServer(config)

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
})

Promise.promisifyAll(client, { multiArgs: true })

test(
  'startup',
  function (t) {
    testServer.start(function (err) {
      t.type(testServer.server, 'object', 'test server was started')
      t.notOk(err, 'no errors were returned')
      t.end()
    })
  }
)

test(
  'clear everything',
  function (t) {
    mcHelper.clearEverything(
      function (err) {
        t.notOk(err, 'no errors were returned')
        t.end()
      }
    )
  }
)

test(
  'change limits',
  function (t) {
    var x = null
    return client.getAsync('/limits')
      .spread(function (req, res, obj) {
        return obj.blockIntervalSeconds
      })
      .then(function (bis) {
        x = bis
        return mcHelper.setLimits({ blockIntervalSeconds: bis + 1 })
      })
      .then(function (settings) {
        t.equal(x + 1, settings.blockIntervalSeconds, 'helper sees the change')
        // Wait for background polling to detect the new value in memcache
        return Promise.delay(1010)
      })
      .then(function() {
        return client.getAsync('/limits')
      })
      .spread(function (req, res, obj) {
        t.equal(x + 1, obj.blockIntervalSeconds, 'server sees the change')
        t.end()
      })
      .catch(function (err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'change nested limits',
  function (t) {
    var x = null
    return client.getAsync('/limits')
      .spread(function (req, res, obj) {
        // This is derived from uidRateLimit.maxChecks
        return obj.maxChecksPerUid
      })
      .then(function (mcpuid) {
        x = mcpuid
        return mcHelper.setLimits({ uidRateLimit: { maxChecks: mcpuid + 1 } })
      })
      .then(function (settings) {
        t.equal(x + 1, settings.maxChecksPerUid, 'helper sees the change')
        // Wait for background polling to detect the new value in memcache
        return Promise.delay(1010)
      })
      .then(function() {
        return client.getAsync('/limits')
      })
      .spread(function (req, res, obj) {
        t.equal(x + 1, obj.maxChecksPerUid, 'server sees the change')
        t.end()
      })
      .catch(function (err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'change allowedIPs',
  function (t) {
    var x = ['127.0.0.1']
    return client.getAsync('/allowedIPs')
      .spread(function (req, res, obj) {
        t.ok(Array.isArray(obj))
        t.notDeepEqual(x, obj, 'allowedIPs are different')
        return mcHelper.setAllowedIPs(x)
      })
      .then(function (ips) {
        t.deepEqual(x, ips, 'helper sees the change')
        // Wait for background polling to detect the new value in memcache
        return Promise.delay(1010)
      })
      .then(function() {
        return client.getAsync('/allowedIPs')
      })
      .spread(function (req, res, obj) {
        t.deepEqual(x, obj, 'server sees the change')
        t.end()
      })
      .catch(function (err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'change allowedEmailDomains',
  function (t) {
    var x = ['restmail.net']
    return client.getAsync('/allowedEmailDomains')
      .spread(function (req, res, obj) {
        t.ok(Array.isArray(obj))
        t.notDeepEqual(x, obj, 'allowedEmailDomains are different')
        return mcHelper.setAllowedEmailDomains(x)
      })
      .then(function (ips) {
        t.deepEqual(x, ips, 'helper sees the change')
        // Wait for background polling to detect the new value in memcache
        return Promise.delay(1010)
      })
      .then(function() {
        return client.getAsync('/allowedEmailDomains')
      })
      .spread(function (req, res, obj) {
        t.deepEqual(x, obj, 'server sees the change')
        t.end()
      })
      .catch(function (err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'teardown',
  function (t) {
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server has been killed')
    t.end()
  }
)
