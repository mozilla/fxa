/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var P = require('../../lib/promise')
var butil = require('../../lib/crypto/butil')
var unbuffer = butil.unbuffer
var config = require('../../config').getProperties()
var TestServer = require('../test_mailer_server')
var testHelper = require('../mailer_helper')

var DB = require('../../lib/senders/db')()

describe('mailer reminder db', () => {
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

  it('fetchReminders', () => {
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

          assert.ok(reminderFound, 'fetched the created reminder')
        },
        function (err) {
          throw err
        }
      )
  })
})
