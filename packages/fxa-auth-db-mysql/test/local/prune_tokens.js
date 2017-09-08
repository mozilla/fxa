/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict'

const TOKEN_PRUNE_AGE = 24 * 60 * 60 * 1000 * 2 // two days

const ROOT_DIR = '../..'

const assert = require('insist')
const crypto = require('crypto')
const dbServer = require(`${ROOT_DIR}/fxa-auth-db-server`)
const log = require('../lib/log')
const P = require(`${ROOT_DIR}/lib/promise`)
const DB = require(`${ROOT_DIR}/lib/db/mysql`)(log, dbServer.errors)
const fake = require(`${ROOT_DIR}/fxa-auth-db-server/test/fake`)
// shallow copy, but it's all we need
const config = Object.assign({}, require(`${ROOT_DIR}/config`))
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
      const signinCode = crypto.randomBytes(6).toString('hex')
      const signinCodeHash = crypto.createHash('sha256').update(signinCode).digest()
      return db.createAccount(user.accountId, user.account)
        .then(function() {
          return db.createPasswordForgotToken(user.passwordForgotTokenId, user.passwordForgotToken)
        })
        .then(function() {
          return db.forgotPasswordVerified(user.accountResetTokenId, user.accountResetToken)
        })
        .then(() => {
          return P.all([
            db.createPasswordForgotToken(user.passwordForgotTokenId, user.passwordForgotToken),
            db.createUnblockCode(user.accountId, unblockCode),
            db.createSessionToken(user.sessionTokenId, user.sessionToken),
            db.createSigninCode(signinCode, user.accountId, Date.now() - TOKEN_PRUNE_AGE)
          ])
        })
        .then(() => {
          // Set createdAt to be older than prune date
          const sql = {
            accountResetToken: 'UPDATE accountResetTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            passwordForgotToken: 'UPDATE passwordForgotTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            sessionToken: 'UPDATE sessionTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            unblockCode: 'UPDATE unblockCodes SET createdAt = createdAt - ? WHERE uid = ?'
          }
          return P.all([
            db.write(sql.accountResetToken, [TOKEN_PRUNE_AGE, user.accountResetTokenId]),
            db.write(sql.passwordForgotToken, [TOKEN_PRUNE_AGE, user.passwordForgotTokenId]),
            db.write(sql.sessionToken, [TOKEN_PRUNE_AGE, user.sessionTokenId]),
            db.write(sql.unblockCode, [TOKEN_PRUNE_AGE, user.accountId])
          ])
        })
        // check tokens exist
        .then(() => {
          return P.all([
            db.accountResetToken(user.accountResetTokenId),
            db.passwordForgotToken(user.passwordForgotTokenId),
            db.sessionToken(user.sessionTokenId)
          ])
        })
        .then(function() {
          var sql = 'SELECT * FROM unblockCodes WHERE uid = ?'
          return db.read(sql, [user.accountId])
        })
        .then(function(res) {
          assert.equal(res[0].uid.toString('hex'), user.accountId.toString('hex'))
        })
        .then(() => {
          return db.read('SELECT * FROM signinCodes WHERE hash = ?', [signinCodeHash])
        })
        .then(res => {
          assert.equal(res[0].hash.toString('hex'), signinCodeHash.toString('hex'))
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
        .then(() => {
          return db.sessionToken(user.sessionTokenId)
            .then(
              () => assert(false, 'db.sessionToken should have failed'),
              err => {
                assert.equal(err.code, 404, 'db.sessionToken returned correct err.code')
                assert.equal(err.errno, 116, 'db.sessionToken returned correct err.errno')
                assert.equal(err.error, 'Not Found', 'db.sessionToken returned correct err.error')
                assert.equal(err.message, 'Not Found', 'db.sessionToken returned correct err.message')
              }
            )
        })
        .then(function() {
          var sql = 'SELECT * FROM unblockCodes WHERE uid = ?'
          return db.read(sql, [user.accountId])
        })
        .then(function(res) {
          assert.equal(res.length, 0, 'no unblock codes for that user')
        })
        .then(() => {
          return db.read('SELECT * FROM signinCodes WHERE hash = ?', [signinCodeHash])
        })
        .then(res => {
          assert.equal(res.length, 0, 'db.read should return an empty recordset')
        })
    }
  )

  after(() => db.close())
})
