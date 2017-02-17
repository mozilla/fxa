/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('bluebird')
var tap = require('tap')
var test = tap.test
var proxyquire = require('proxyquire')
var dbConnect

var mockLog = function () {
  return {
    error: function () {},
    info: function () {},
    warn: function () {}
  }
}

var mockConfig = {
  get: function (prop) {
    if (prop === 'db') {
      return {
        connectionRetry: 10,
        connectionTimeout: 100
      }
    }
  }
}

test(
  'keeps polling until time limit',
  function (t) {
    dbConnect = proxyquire('../../lib/db_connect', {
      '../log': mockLog,
      './db': function () {
        return {
          connect: function() {
            return P.reject(new Error('ECONNREFUSED'))
          }
        }
      },
      '../config': mockConfig
    })()

    dbConnect()
      .catch(function (err) {
        t.equal(err.name, 'TimeoutError')
        t.equal(err.message, 'operation timed out')
        t.end()
      })
  }
)

test(
  'connects to db after polling',
  function (t) {
    var dbConnectedMs = 30
    var testStart = Date.now()

    dbConnect = proxyquire('../../lib/db_connect', {
      '../log': mockLog,
      './db': function () {
        return {
          connect: function() {
            if ((Date.now() - testStart) > dbConnectedMs) {
              return P.resolve({
                name: 'TestDB'
              })
            } else {
              return P.reject(new Error('ECONNREFUSED'))
            }

          }
        }
      },
      '../config': mockConfig
    })()

    dbConnect()
      .then(function (db) {
        t.equal(db.name, 'TestDB')
        t.end()
      })
  }
)
