/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var test = tap.test

var P = require('../../lib/promise')
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
  'fetchReminders',
  function (t) {
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
        var rem1 = db.createVerificationReminder({
          type: 'first',
          uid: accountData.uid.toString('hex')
        })

        var rem2 = db.createVerificationReminder({
          type: 'second',
          uid: accountData.uid.toString('hex')
        })

        return P.all([rem1, rem2]).catch(function (err) {
          throw err
        })
      })
      .then(
        function () {
          return db.fetchReminders({
            // fetch reminders older than 'reminderTime'
            reminderTime: 1,
            reminderTimeOutdated: 5000,
            type: 'first',
            limit: 200
          })
        }
      )
      .then(
        function (reminders) {
          var reminderFound = false
          reminders.some(function (reminder) {
            if (reminder.uid === accountData.uid.toString('hex')) {
              reminderFound = true
              return true
            }
          })

          t.ok(reminderFound, 'fetched the created reminder')
          t.end()
        },
        function (err) {
          throw err
        }
      )
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
