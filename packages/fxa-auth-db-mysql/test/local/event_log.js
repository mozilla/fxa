/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('fxa-auth-db-server')
var test = require('../ptaptest')
var log = { trace: console.log, error: console.log, info: console.log }
var DB = require('../../db/mysql')(log, dbServer.errors)
var fake = require('fxa-auth-db-server/test/fake')
var config = require('../../config')
var P = require('../../promise')


DB.connect(config)
  .then(
    function (db) {

      test(
        'account activity should generate event logs',
        function (t) {
          t.plan(14);
          var user = fake.newUserDataBuffer()
          var verifiedUser = fake.newUserDataBuffer()
          verifiedUser.account.emailVerified = true
          // First mark any events from previous tests as published.
          return db.processUnpublishedEvents(
            function (events) {
              t.ok(events, 'should find a list of events')
              return P.resolve()
            }
          )
          .then(function () {
            // Logs a 'create' event.
            return db.createAccount(user.accountId, user.account)
          })
          .then(function () {
            // Logs a 'create' event and a 'verify' event.
            return db.createAccount(verifiedUser.accountId,
                                    verifiedUser.account)
          })
          .then(function () {
            // Logs a 'verify' event.
            return db.verifyEmail(user.accountId)
          })
          .then(function () {
            // Logs a 'reset' event.
            return db.resetAccount(user.accountId, user.account)
          })
          .then(function () {
            // Logs a 'delete' event.
            return db.deleteAccount(verifiedUser.accountId)
          })
          .then(function () {
            // Find newly-logged events.
            return db.processUnpublishedEvents(
              function (events) {
                t.equal(events.length, 6)
                t.equal(events[0].typ, 'create')
                t.deepEqual(events[0].uid, user.accountId)
                t.equal(events[1].typ, 'create')
                t.deepEqual(events[1].uid, verifiedUser.accountId)
                t.equal(events[2].typ, 'verify')
                t.deepEqual(events[2].uid, verifiedUser.accountId)
                t.equal(events[3].typ, 'verify')
                t.deepEqual(events[3].uid, user.accountId)
                t.equal(events[4].typ, 'reset')
                t.deepEqual(events[4].uid, user.accountId)
                t.equal(events[5].typ, 'delete')
                t.deepEqual(events[5].uid, verifiedUser.accountId)
                return P.resolve()
              }
            )
          })
        }
      )

      test(
        'processUnpublishedEvents should provide mutual exclusion',
        function (t) {
          t.plan(2)
          return db.processUnpublishedEvents(
            function (events) {
              t.ok(events, 'first reader should receive events')
              return db.processUnpublishedEvents(
                function () {
                  t.fail('second reader should not receive events')
                  return P.resolve()
                }
              )
              .then(
                function () {
                  t.fail('processUnpublishedEvents shoud have thrown')
                },
                function (err) {
                  t.equal(err.message, 'event queue locked')
                }
              )
            }
          )
        }
      )

      test(
        'processUnpublishedEvents should mark events published on success',
        function (t) {
          t.plan(5)
          var user = fake.newUserDataBuffer()
          // Logs a 'create' event.
          return db.createAccount(user.accountId, user.account)
          .then(function () {
            return db.processUnpublishedEvents(
              function (events) {
                var lastEvent = events[events.length - 1]
                t.equal(lastEvent.typ, 'create')
                t.deepEqual(lastEvent.uid, user.accountId)
                return P.resolve()
              }
            )
          })
          .then(function () {
            // Logs a 'verify' event.
            return db.verifyEmail(user.accountId)
          })
          .then(function () {
            return db.processUnpublishedEvents(
              function (events) {
                // There should only be one unpublished event.
                t.equal(events.length, 1)
                t.equal(events[0].typ, 'verify')
                t.deepEqual(events[0].uid, user.accountId)
                return P.resolve()
              }
            )
          })
        }
      )

      test(
        'processUnpublishedEvents should leave events unpublished on error',
        function (t) {
          t.plan(6)
          var user = fake.newUserDataBuffer()
          var numEvents
          // Logs a 'create' event.
          return db.createAccount(user.accountId, user.account)
          .then(function () {
            return db.processUnpublishedEvents(
              function (events) {
                numEvents = events.length
                t.equal(events[numEvents - 1].typ, 'create')
                t.deepEqual(events[numEvents - 1].uid, user.accountId)
                return P.reject(new Error('ruh-roh'))
              }
            )
          })
          .then(
            function () {
              t.fail('it should have propagated the error')
            },
            function (err) {
              t.equal(err.message, 'ruh-roh')
            }
          )
          .then(function () {
            return db.processUnpublishedEvents(
              function (events) {
                // The events should be the same as before.
                t.equal(events.length, numEvents)
                t.equal(events[numEvents - 1].typ, 'create')
                t.deepEqual(events[numEvents - 1].uid, user.accountId)
                return P.resolve()
              }
            )
          })
        }
      )

      test(
        'processUnpublishedEvents should accept ack of only some events',
        function (t) {
          t.plan(7)
          var user = fake.newUserDataBuffer()
          user.account.emailVerified = true
          // Logs a 'create' and a 'verify' event.
          return db.createAccount(user.accountId, user.account)
          .then(function () {
            return db.processUnpublishedEvents(
              function (events) {
                t.equal(events[events.length - 2].typ, 'create')
                t.deepEqual(events[events.length - 2].uid, user.accountId)
                t.equal(events[events.length - 1].typ, 'verify')
                t.deepEqual(events[events.length - 1].uid, user.accountId)
                // Acknowledge all but the last event.
                return P.resolve(events.length - 1)
              }
            )
          })
          .then(function () {
            return db.processUnpublishedEvents(
              function (events) {
                // There should only be one unpublished event.
                t.equal(events.length, 1)
                t.equal(events[0].typ, 'verify')
                t.deepEqual(events[0].uid, user.accountId)
                return P.resolve()
              }
            )
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
