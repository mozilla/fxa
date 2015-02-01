/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('fxa-auth-db-server')
var test = require('../ptaptest')
var log = { trace: console.log, error: console.log, info: console.log }
var DB = require('../../db/mysql')(log, dbServer.errors)
var fake = require('fxa-auth-db-server/test/fake')
var config = require('../../config')

var oneDay = 24 * 60 * 60 * 1000

DB.connect(config)
  .then(
    function (db) {

      test(
        'ping',
        function (t) {
          t.plan(1);
          return db.ping()
          .then(function(account) {
            t.pass('Got the ping ok')
          }, function(err) {
            t.fail('Should not have arrived here')
          })
        }
      )

      test(
        'prune tokens',
        function (t) {
          t.plan(9);
          var user = fake.newUserDataBuffer()
          return db.createAccount(user.accountId, user.account)
            .then(function() {
              return db.createAccountResetToken(user.accountResetTokenId, user.accountResetToken)
            })
            .then(function() {
              // now set it to be a day ago
              var sql = "UPDATE accountResetTokens SET createdAt = createdAt - ? WHERE tokenId = ?"
              return db.write(sql, [ oneDay, user.accountResetTokenId ])
            })
            .then(function(sdf) {
              return db.createPasswordForgotToken(user.passwordForgotTokenId, user.passwordForgotToken)
            })
            .then(function() {
              // now set it to be a day ago
              var sql = "UPDATE passwordForgotTokens SET createdAt = createdAt - ? WHERE tokenId = ?"
              return db.write(sql, [ oneDay, user.passwordForgotTokenId ])
            })
            .then(function() {
              // set pruneLastRun to be zero, so we know it will run
              var sql = "UPDATE dbMetadata SET value = '0' WHERE name = 'prune-last-ran'"
              return db.write(sql, [])
            })
            .then(function() {
              // prune older tokens
              return db.pruneTokens()
            })
            .then(function() {
              // now check that all tokens for this uid have been deleted
              return db.accountResetToken(user.accountResetTokenId)
            })
            .then(function(accountResetToken) {
              t.fail('The above accountResetToken() call should fail, since the accountResetToken has been deleted')
            }, function(err) {
              t.equal(err.code, 404, 'accountResetToken() fails with the correct code')
              t.equal(err.errno, 116, 'accountResetToken() fails with the correct errno')
              t.equal(err.error, 'Not Found', 'accountResetToken() fails with the correct error')
              t.equal(err.message, 'Not Found', 'accountResetToken() fails with the correct message')
            })
            .then(function() {
              return db.passwordForgotToken(user.passwordForgotTokenId)
            })
            .then(function(passwordForgotToken) {
              t.fail('The above passwordForgotToken() call should fail, since the passwordForgotToken has been pruned')
            }, function(err) {
              t.equal(err.code, 404, 'passwordForgotToken() fails with the correct code')
              t.equal(err.errno, 116, 'passwordForgotToken() fails with the correct errno')
              t.equal(err.error, 'Not Found', 'passwordForgotToken() fails with the correct error')
              t.equal(err.message, 'Not Found', 'passwordForgotToken() fails with the correct message')
            })
            .then(function(token) {
              t.pass('No errors found during tests')
            }, function(err) {
              t.fail(err)
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
