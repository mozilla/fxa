/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var butil = require('../../lib/crypto/butil')
var unbuffer = butil.unbuffer
var config = require('../../mailer/config').getProperties()
var TestServer = require('../test_mailer_server')

var testHelper = require('../mailer_helper')

var DB = require('../../lib/senders/db')()

describe('mailer db', () => {
  let dbServer, dbConn

  before(() => {
    return dbConn = TestServer.start(config)
      .then(server => {
        dbServer = server
        return DB.connect(config[config.db.backend])
      })
  })

  after(() => {
    return dbConn.then(db => {
      return db.close()
    }).then(() => {
      return dbServer.stop()
    })
  })

  it('ping', () => {
    return dbConn
      .then(function (db) {
        return db.ping()
      })
      .then(function () {
        assert.ok('Got the ping ok')
      }, function (err) {
        throw err
      })
  })

  it('get email record', () => {
    var accountData
    var db

    return dbConn
      .then(function (dbObj) {
        db = dbObj
        accountData = testHelper.createTestAccount()

        return db.pool.put(
          '/account/' + accountData.uid.toString('hex'),
          unbuffer(accountData)
        )
      })
      .then(function () {
        return db.emailRecord(accountData.email)
      })
      .then(function (account) {
        assert.equal(account.emailVerified, false)
      }, function (err) {
        throw err
      })
  })

  it('get account by uid', () => {
    var accountData
    var db

    return dbConn
      .then(function (dbObj) {
        db = dbObj
        accountData = testHelper.createTestAccount()

        return db.pool.put(
          '/account/' + accountData.uid.toString('hex'),
          unbuffer(accountData)
        )
      })
      .then(function () {
        return db.account(accountData.uid)
      })
      .then(function (account) {
        assert.equal(account.emailVerified, false)
      }, function (err) {
        throw err
      })
  })

  it('throws db errors', () => {
    var db

    return dbConn
      .then(function (dbObj) {
        db = dbObj
        return db.emailRecord('unknownEmail@restmail.net')
      })
      .then(function () {
        assert.fail()
      }, function (err) {
        assert.ok(err)
        return db.emailRecord('unknownEmail@restmail.net')

      })
      .then(function () {
        assert.fail()
      }, function (err) {
        assert.ok(err)
      })
  })
})
