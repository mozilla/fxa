/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const TOKEN_PRUNE_AGE = 24 * 60 * 60 * 1000 * 2; // two days

const ROOT_DIR = '../..';

const { assert } = require('chai');
const crypto = require('crypto');
const dbServer = require(`${ROOT_DIR}/db-server`);
const log = require('../lib/log');
const P = require(`${ROOT_DIR}/lib/promise`);
const DB = require(`${ROOT_DIR}/lib/db/mysql`)(log, dbServer.errors);
const fake = require(`${ROOT_DIR}/db-server/test/fake`);
// shallow copy, but it's all we need
const config = Object.assign({}, require(`${ROOT_DIR}/config`));
config.pruneTokensMaxAge = 24 * 60 * 60 * 1000; // one day setting for tests

describe('prune tokens', () => {
  let db;
  before(() => {
    return DB.connect(config).then((db_) => {
      db = db_;
      return db.ping();
    });
  });

  it('prune tokens', () => {
    const user = fake.newUserDataBuffer();
    const unblockCode = crypto.randomBytes(4).toString('hex');
    const signinCode = crypto.randomBytes(6).toString('hex');
    const signinCodeHash = crypto
      .createHash('sha256')
      .update(signinCode)
      .digest();
    const unprunableSessionTokenId = crypto.randomBytes(16).toString('hex');
    const tokenVerificationId = crypto.randomBytes(8).toString('hex');
    const unverifiedKeyFetchToken = Object.assign({}, user.keyFetchToken, {
      tokenVerificationId,
    });
    const initialPrunedUntilValue = Date.now() - TOKEN_PRUNE_AGE * 2 + 1;
    return (
      db
        .createAccount(user.accountId, user.account)
        .then(function () {
          return db.createPasswordForgotToken(
            user.passwordForgotTokenId,
            user.passwordForgotToken
          );
        })
        .then(function () {
          return db.forgotPasswordVerified(
            user.accountResetTokenId,
            user.accountResetToken
          );
        })
        .then(() => {
          return P.all([
            db.createKeyFetchToken(
              user.keyFetchTokenId,
              unverifiedKeyFetchToken
            ),
            db.createPasswordForgotToken(
              user.passwordForgotTokenId,
              user.passwordForgotToken
            ),
            db.createUnblockCode(user.accountId, unblockCode),
            db.createSessionToken(user.sessionTokenId, user.sessionToken),
            db.createSessionToken(unprunableSessionTokenId, user.sessionToken),
            db.createSigninCode(
              signinCode,
              user.accountId,
              Date.now() - TOKEN_PRUNE_AGE
            ),
            db.write(
              "UPDATE dbMetadata SET value = ? WHERE name = 'sessionTokensPrunedUntil'",
              [initialPrunedUntilValue]
            ),
          ]);
        })
        .then(() => {
          // Set createdAt to be older than prune date
          const sql = {
            accountResetToken:
              'UPDATE accountResetTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            keyFetchToken:
              'UPDATE keyFetchTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            passwordForgotToken:
              'UPDATE passwordForgotTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            sessionToken:
              'UPDATE sessionTokens SET createdAt = createdAt - ? WHERE tokenId = ?',
            unblockCode:
              'UPDATE unblockCodes SET createdAt = createdAt - ? WHERE uid = ?',
          };
          return P.all([
            db.write(sql.accountResetToken, [
              TOKEN_PRUNE_AGE,
              user.accountResetTokenId,
            ]),
            db.write(sql.keyFetchToken, [
              TOKEN_PRUNE_AGE,
              user.keyFetchTokenId,
            ]),
            db.write(sql.passwordForgotToken, [
              TOKEN_PRUNE_AGE,
              user.passwordForgotTokenId,
            ]),
            db.write(sql.sessionToken, [TOKEN_PRUNE_AGE, user.sessionTokenId]),
            db.write(sql.sessionToken, [
              TOKEN_PRUNE_AGE * 2,
              unprunableSessionTokenId,
            ]),
            db.write(sql.unblockCode, [TOKEN_PRUNE_AGE, user.accountId]),
          ]);
        })
        // check tokens exist
        .then(() => {
          return P.all([
            db.accountResetToken(user.accountResetTokenId),
            db.keyFetchToken(user.keyFetchTokenId),
            db.passwordForgotToken(user.passwordForgotTokenId),
            db.sessionToken(user.sessionTokenId),
            db.sessionToken(unprunableSessionTokenId),
          ]);
        })
        .then(function () {
          var sql = 'SELECT * FROM unblockCodes WHERE uid = ?';
          return db.read(sql, [user.accountId]);
        })
        .then(function (res) {
          assert.equal(
            res[0].uid.toString('hex'),
            user.accountId.toString('hex')
          );
        })
        .then(() => {
          return db.read('SELECT * FROM signinCodes WHERE hash = ?', [
            signinCodeHash,
          ]);
        })
        .then((res) => {
          assert.equal(
            res[0].hash.toString('hex'),
            signinCodeHash.toString('hex')
          );
        })
        .then(function () {
          // prune older tokens
          return db.pruneTokens();
        })
        .then(function () {
          // now check that all tokens for this uid have been deleted
          return db.accountResetToken(user.accountResetTokenId).then(
            function (accountResetToken) {
              assert(
                false,
                'The above accountResetToken() call should fail, since the accountResetToken has been deleted'
              );
            },
            function (err) {
              assert.equal(
                err.code,
                404,
                'accountResetToken() fails with the correct code'
              );
              assert.equal(
                err.errno,
                116,
                'accountResetToken() fails with the correct errno'
              );
              assert.equal(
                err.error,
                'Not Found',
                'accountResetToken() fails with the correct error'
              );
              assert.equal(
                err.message,
                'Not Found',
                'accountResetToken() fails with the correct message'
              );
            }
          );
        })
        .then(function () {
          return db.passwordForgotToken(user.passwordForgotTokenId).then(
            function (passwordForgotToken) {
              assert(
                false,
                'The above passwordForgotToken() call should fail, since the passwordForgotToken has been pruned'
              );
            },
            function (err) {
              assert.equal(
                err.code,
                404,
                'passwordForgotToken() fails with the correct code'
              );
              assert.equal(
                err.errno,
                116,
                'passwordForgotToken() fails with the correct errno'
              );
              assert.equal(
                err.error,
                'Not Found',
                'passwordForgotToken() fails with the correct error'
              );
              assert.equal(
                err.message,
                'Not Found',
                'passwordForgotToken() fails with the correct message'
              );
            }
          );
        })
        .then(() => {
          return db.sessionToken(user.sessionTokenId).then(
            () => assert(false, 'db.sessionToken should have failed'),
            (err) => {
              assert.equal(
                err.code,
                404,
                'db.sessionToken returned correct err.code'
              );
              assert.equal(
                err.errno,
                116,
                'db.sessionToken returned correct err.errno'
              );
              assert.equal(
                err.error,
                'Not Found',
                'db.sessionToken returned correct err.error'
              );
              assert.equal(
                err.message,
                'Not Found',
                'db.sessionToken returned correct err.message'
              );
            }
          );
        })
        .then(function () {
          var sql = 'SELECT * FROM unblockCodes WHERE uid = ?';
          return db.read(sql, [user.accountId]);
        })
        .then(function (res) {
          assert.lengthOf(res, 0);
        })
        .then(() => {
          return db.read('SELECT * FROM signinCodes WHERE hash = ?', [
            signinCodeHash,
          ]);
        })
        .then((res) => {
          assert.lengthOf(res, 0);
        })
        // The unprunable session token should still exist
        .then(() => db.sessionToken(unprunableSessionTokenId))
        // The key-fetch token should still exist
        .then(() =>
          db.keyFetchTokenWithVerificationStatus(user.keyFetchTokenId)
        )
        .then((keyFetchToken) => {
          // unverifiedTokens must not be pruned if they belong to keyFetchTokens
          assert.equal(keyFetchToken.tokenVerificationId, tokenVerificationId);
        })
        .then(() => {
          // 'sessionTokensPrunedUntil' should have increased after pruning
          const sql =
            "SELECT value FROM dbMetadata WHERE name = 'sessionTokensPrunedUntil'";
          return db.read(sql);
        })
        .then((res) => {
          assert.lengthOf(res, 1);
          assert.ok(res[0].value, 'sessionTokensPrunedUntil is not falsy');
          const updatedPrunedUntilValue = parseInt(res[0].value, 10);
          assert.isAbove(updatedPrunedUntilValue, initialPrunedUntilValue);
          // Prune again, so we can check that it gracefully handles
          // the case when there's nothing to prune.
          return db
            .pruneTokens()
            .then(() => {
              const sql =
                "SELECT value FROM dbMetadata WHERE name = 'sessionTokensPrunedUntil'";
              return db.read(sql);
            })
            .then((res) => {
              assert.lengthOf(res, 1);
              assert.ok(res[0].value, 'sessionTokensPrunedUntil is not falsy');
              assert.equal(
                parseInt(res[0].value, 10),
                updatedPrunedUntilValue,
                'sessionTokensPrunedUntil did not change'
              );
            });
        })
    );
  });

  after(() => db.close());
});
