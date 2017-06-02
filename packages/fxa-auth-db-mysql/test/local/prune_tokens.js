/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const TOKEN_PRUNE_AGE = 24 * 60 * 60 * 1000 * 2 // two days

const assert = require('insist')
const crypto = require('crypto')
const dbServer = require('../../fxa-auth-db-server')
const log = require('../lib/log')
const DB = require('../../lib/db/mysql')(log, dbServer.errors)
const fake = require('../../fxa-auth-db-server/test/fake')
// shallow copy, but it's all we need
const config = Object.assign({}, require('../../config'))
config.pruneTokensMaxAge = 24 * 60 * 60 * 1000 // one day setting for tests


describe('prune tokens', () => {

  let db
  before(() => {
    return DB.connect(config).then(db_ => {
      db = db_
      return db.ping()
    })
  })

  it(
    'prune tokens',
    () => {
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
          return db.passwordForgotToken(user.passwordForgotTokenId)
        })
        .then(function() {
          var sql = 'SELECT * FROM unblockCodes WHERE uid = ?'
          return db.read(sql, [user.accountId])
        })
        .then(function(res) {
          assert.equal(res[0].uid.toString('hex'), user.accountId.toString('hex'))
        })
        .then(function() {
          // prune older tokens
          return db.pruneTokens()
        })
        .then(function() {
          // now check that all tokens for this uid have been deleted
          return db.accountResetToken(user.accountResetTokenId)
          .then(function(accountResetToken) {
            assert(false, 'The above accountResetToken() call should fail, since the accountResetToken has been deleted')
          }, function(err) {
            assert.equal(err.code, 404, 'accountResetToken() fails with the correct code')
            assert.equal(err.errno, 116, 'accountResetToken() fails with the correct errno')
            assert.equal(err.error, 'Not Found', 'accountResetToken() fails with the correct error')
            assert.equal(err.message, 'Not Found', 'accountResetToken() fails with the correct message')
          })
        })
        .then(function() {
          return db.passwordForgotToken(user.passwordForgotTokenId)
          .then(function(passwordForgotToken) {
            assert(false, 'The above passwordForgotToken() call should fail, since the passwordForgotToken has been pruned')
          }, function(err) {
            assert.equal(err.code, 404, 'passwordForgotToken() fails with the correct code')
            assert.equal(err.errno, 116, 'passwordForgotToken() fails with the correct errno')
            assert.equal(err.error, 'Not Found', 'passwordForgotToken() fails with the correct error')
            assert.equal(err.message, 'Not Found', 'passwordForgotToken() fails with the correct message')
          })
        })
        .then(function() {
          var sql = 'SELECT * FROM unblockCodes WHERE uid = ?'
          return db.read(sql, [user.accountId])
        })
        .then(function(res) {
          assert.equal(res.length, 0, 'no unblock codes for that user')
        })
    }
  )

  after(() => db.close())
})
