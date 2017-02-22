/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var test = tap.test

var butil = require('../../lib/crypto/butil')
var unbuffer = butil.unbuffer
var config = require('../../config').getProperties()
var TestServer = require('../test_server')

var testHelpers = require('../helpers')

var DB = require('../../lib/db')()

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
        accountData = testHelpers.createTestAccount()

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
  'get account by uid',
  function (t) {
    t.plan(1)

    var accountData
    var db

    return dbConn
      .then(function (dbObj) {
        db = dbObj
        accountData = testHelpers.createTestAccount()

        return db.pool.put(
          '/account/' + accountData.uid.toString('hex'),
          unbuffer(accountData)
        )
      })
      .then(function () {
        return db.account(accountData.uid)
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
  'throws db errors',
  function (t) {
    t.plan(2)
    var db

    return dbConn
      .then(function (dbObj) {
        db = dbObj
        return db.emailRecord('unknownEmail@restmail.net')
      })
      .then(function () {
        t.notOk()
      }, function (err) {
        t.ok(err)
        return db.emailRecord('unknownEmail@restmail.net')

      })
      .then(function () {
        t.notOk()
      }, function (err) {
        t.ok(err)
        t.end()
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
