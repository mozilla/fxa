/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var test = require('tap').test
var banHandler = require('../../bans/handler')
var mcHelper = require('../memcache-helper')

var log = {
  info: function () {},
  error: function () {}
}

var config = {
  limits: {
    blockIntervalSeconds: 1
  }
}

var TEST_IP = '192.0.2.1'
var TEST_EMAIL = 'test@example.com'

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
  'well-formed ip blocking request',
  function (t) {
    var message = {
      ban: {
        ip: TEST_IP
      }
    }
    banHandler(mcHelper.mc, log)(message,
      function (err) {
        t.notOk(err, 'no errors were returned')

        mcHelper.blockedIpCheck(
          function (isBlocked) {
            t.equal(isBlocked, true, 'ip is blocked')
            t.end()
          }
        )
      }
    )
  }
)

test(
  'ip block has expired',
  function (t) {
    setTimeout(
      function () {
        mcHelper.blockedIpCheck(
          function (isBlocked) {
            t.equal(isBlocked, false, 'ip is not blocked')
            t.end()
          }
        )
      },
      config.limits.blockIntervalSeconds * 1000
    )
  }
)

test(
  'well-formed email blocking request',
  function (t) {
    var message = {
      ban: {
        email: TEST_EMAIL
      }
    }
    banHandler(mcHelper.mc, log)(message,
      function (err) {
        t.notOk(err, 'no errors were returned')

        mcHelper.blockedEmailCheck(
          function (isBlocked) {
            t.equal(isBlocked, true, 'email is blocked')
            t.end()
          }
        )
      }
    )
  }
)

test(
  'email block has expired',
  function (t) {
    setTimeout(
      function () {
        mcHelper.blockedEmailCheck(
          function (isBlocked) {
            t.equal(isBlocked, false, 'email is not blocked')
            t.end()
          }
        )
      },
      config.limits.blockIntervalSeconds * 1000
    )
  }
)

test(
  'missing ip and email',
  function (t) {
    var message = {
      ban: {
      }
    }
    banHandler(mcHelper.mc, log)(message,
      function (err) {
        t.equal(err, 'invalid message')
        t.end()
      }
    )
  }
)

test(
  'missing ban',
  function (t) {
    var message = {
    }
    banHandler(mcHelper.mc, log)(message,
      function (err) {
        t.equal(err, 'invalid message')
        t.end()
      }
    )
  }
)
