/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ROOT_DIR = '../../../..'

const assert = require('insist')
var P = require('bluebird')
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

it(
  'keeps polling until time limit',
  function () {
    dbConnect = proxyquire(`${ROOT_DIR}/lib/senders/db_connect`, {
      './log': mockLog,
      './db': function () {
        return {
          connect: function() {
            return P.reject(new Error('ECONNREFUSED'))
          }
        }
      },
      '../../mailer/config': mockConfig
    })()

    return dbConnect()
      .catch(function (err) {
        assert.equal(err.name, 'TimeoutError')
        assert.equal(err.message, 'operation timed out')
      })
  }
)

it(
  'connects to db after polling',
  function () {
    var dbConnectedMs = 30
    var testStart = Date.now()

    dbConnect = proxyquire(`${ROOT_DIR}/lib/senders/db_connect`, {
      './log': mockLog,
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
      '../../mailer/config': mockConfig
    })()

    return dbConnect()
      .then(function (db) {
        assert.equal(db.name, 'TestDB')
      })
  }
)
