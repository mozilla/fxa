/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('fxa-auth-db-server')
var test = require('../ptaptest')
var log = { trace: console.log, error: console.log, info: console.log }
var DB = require('../../db/mysql')(log, dbServer.errors)
var fake = require('fxa-auth-db-server/test/fake')
var config = require('../../config')


DB.connect(config)
  .then(
    function (db) {

      test(
        'account activity should generate event logs',
        function (t) {
          t.plan(13);
          var curPos = 0
          var user = fake.newUserDataBuffer()
          var verifiedUser = fake.newUserDataBuffer()
          verifiedUser.account.emailVerified = true
          // First skip over any events that have already been logged.
          return db._getEventsSincePosition(0)
          .then(function (events) {
            curPos = events[events.length - 1].pos
          })
          .then(function () {
            // Logs a "create" event.
            return db.createAccount(user.accountId, user.account)
          })
          .then(function () {
            // Logs a "create" event and a "verify" event.
            return db.createAccount(verifiedUser.accountId,
                                    verifiedUser.account)
          })
          .then(function () {
            // Logs a "verify" event.
            return db.verifyEmail(user.accountId)
          })
          .then(function () {
            // Logs a "reset" event.
            return db.resetAccount(user.accountId, user.account)
          })
          .then(function () {
            // Logs a "delete" event.
            return db.deleteAccount(verifiedUser.accountId)
          })
          .then(function () {
            // Find newly-logged events.
            return db._getEventsSincePosition(curPos)
          })
          .then(function (events) {
            t.equal(events.length, 6)
            t.equal(events[0].typ, "create")
            t.equal(events[0].uid.toString(), user.accountId.toString())
            t.equal(events[1].typ, "create")
            t.equal(events[1].uid.toString(), verifiedUser.accountId.toString())
            t.equal(events[2].typ, "verify")
            t.equal(events[2].uid.toString(), verifiedUser.accountId.toString())
            t.equal(events[3].typ, "verify")
            t.equal(events[3].uid.toString(), user.accountId.toString())
            t.equal(events[4].typ, "reset")
            t.equal(events[4].uid.toString(), user.accountId.toString())
            t.equal(events[5].typ, "delete")
            t.equal(events[5].uid.toString(), verifiedUser.accountId.toString())
          })
        }
      )

      test(
        'teardown',
        function (t) {
          return db.close()
        }
      )

    }
  )
