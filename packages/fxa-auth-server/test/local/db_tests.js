/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var test = tap.test
var uuid = require('uuid')

var butil = require('../../lib/crypto/butil')
var unbuffer = butil.unbuffer
var config = require('../../config').getProperties()
var TestServer = require('../test_server')

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')


var DB = require('../../lib/db')()

function createTestAccount() {
  var account = {
    uid: uuid.v4('binary'),
    email: 'foo' + Math.random() + '@bar.com',
    emailCode: zeroBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    authSalt: zeroBuffer32,
    kA: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
    createdAt: Date.now(),
    verifierSetAt: Date.now()
  }

  account.normalizedEmail = account.email.toLowerCase()

  return account
}

var dbServer
var dbConn = TestServer.start(config)
  .then(
    function (server) {
      dbServer = server
      return DB.connect(config[config.db.backend])
    }
  )

test(
  'ping',
  function (t) {
    t.plan(1)
    return dbConn
      .then(function (db) {
        return db.ping()
      })
      .then(function () {
        t.pass('Got the ping ok')
      }, function (err) {
        throw err
      })
  }
)


test(
  'get email record',
  function (t) {
    t.plan(1)

    var accountData
    var db

    return dbConn
      .then(function (dbObj) {
        db = dbObj
        accountData = createTestAccount()

        return db.pool.put(
          '/account/' + accountData.uid.toString('hex'),
          unbuffer(accountData)
        )
      })
      .then(function () {
        return db.emailRecord(accountData.email)
      })
      .then(function (account) {
        t.false(account.emailVerified, false)
        t.end()
      }, function (err) {
        throw err
      })
  }
)

test(
  'teardown',
  function (t) {
    return dbConn.then(function(db) {
      return db.close()
    }).then(function() {
      return dbServer.stop()
    }).then(function () {
      t.end()
    })
  }
)
