/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */


process.env.PRUNE_TOKENS_MAX_AGE = 24 * 60 * 60 * 1000 // one day setting for tests
var TOKEN_PRUNE_AGE = 24 * 60 * 60 * 1000 * 2 // two days

var crypto = require('crypto')
var dbServer = require('../../fxa-auth-db-server')
var test = require('tap').test
var log = require('../lib/log')
var DB = require('../../lib/db/mysql')(log, dbServer.errors)
var fake = require('../../fxa-auth-db-server/test/fake')
var config = require('../../config')


DB.connect(config)
  .then(
    function (db) {

      test(
        'ping',
        function (t) {
          t.plan(1)
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
          t.plan(14)
          var user = fake.newUserDataBuffer()
          var unblockCode = crypto.randomBytes(4).toString('hex')
          return db.createAccount(user.accountId, user.account)
            .then(function() {
              return db.createPasswordForgotToken(user.passwordForgotTokenId, user.passwordForgotToken)
            })
            .then(function() {
              return db.forgotPasswordVerified(user.accountResetTokenId, user.accountResetToken)
            })
            .then(function () {
              return db.createUnblockCode(user.accountId, unblockCode)
            })
            .then(function() {
              // now set it to be older than prune date
              var sql = 'UPDATE accountResetTokens SET createdAt = createdAt - ? WHERE tokenId = ?'
              return db.write(sql, [TOKEN_PRUNE_AGE, user.accountResetTokenId])
            })
            .then(function(sdf) {
              return db.createPasswordForgotToken(user.passwordForgotTokenId, user.passwordForgotToken)
            })
            .then(function() {
              // now set it to be older than prune date
              var sql = 'UPDATE passwordForgotTokens SET createdAt = createdAt - ? WHERE tokenId = ?'
              return db.write(sql, [TOKEN_PRUNE_AGE, user.passwordForgotTokenId])
            })
            .then(function() {
              // now set it to be older than prune date
              var sql = 'UPDATE unblockCodes SET createdAt = createdAt - ? WHERE uid = ?'
              return db.write(sql, [TOKEN_PRUNE_AGE, user.accountId])
            })
            // check token exist
            .then(function() {
              // now check that all tokens for this uid have been deleted
              return db.accountResetToken(user.accountResetTokenId)
            })
            .then(function() {
              t.ok('accountResetToken exists')
            }, function(err) {
              t.fail('accountResetToken should still exist')
            })
            .then(function() {
              return db.passwordForgotToken(user.passwordForgotTokenId)
            })
            .then(function() {
              t.ok('passwordForgotToken exists')
            }, function(err) {
              t.fail('passwordForgotToken should still exist')
            })
            .then(function() {
              var sql = 'SELECT * FROM unblockCodes WHERE uid = ?'
              return db.read(sql, [user.accountId])
            })
            .then(function(res) {
              t.ok('Unblock code exists')
              t.equal(res[0].uid.toString('hex'), user.accountId.toString('hex'))
            }, function(err) {
              t.fail('no errors during the unblock query')
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
            .then(function() {
              var sql = 'SELECT * FROM unblockCodes WHERE uid = ?'
              return db.read(sql, [user.accountId])
            })
            .then(function(res) {
              t.equal(res.length, 0, 'no unblock codes for that user')
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
