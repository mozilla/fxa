/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var util = require('util')
var mysql = require('mysql')
var P = require('../promise')

var patch = require('./patch')

// http://dev.mysql.com/doc/refman/5.5/en/error-messages-server.html
const ER_TOO_MANY_CONNECTIONS = 1040
const ER_DUP_ENTRY = 1062
const ER_LOCK_WAIT_TIMEOUT = 1205
const ER_LOCK_TABLE_FULL = 1206
const ER_LOCK_DEADLOCK = 1213
const ER_LOCK_ABORTED = 1689

module.exports = function (log, error) {

  var LOCK_ERRNOS = [
    ER_LOCK_WAIT_TIMEOUT,
    ER_LOCK_TABLE_FULL,
    ER_LOCK_DEADLOCK,
    ER_LOCK_ABORTED
  ]

  // make a pool of connections that we can draw from
  function MySql(options) {
    this.options = options

    this.patchLevel = 0
    // poolCluster will remove the pool after `removeNodeErrorCount` errors.
    // We don't ever want to remove a pool because we only have one pool
    // for writing and reading each. Connection errors are mostly out of our
    // control for automatic recovery so monitoring of 503s is critical.
    // Since `removeNodeErrorCount` is Infinity `canRetry` must be false
    // to prevent inifinite retry attempts.
    this.poolCluster = mysql.createPoolCluster(
      {
        removeNodeErrorCount: Infinity,
        canRetry: false
      }
    )

    // Use separate pools for master and slave connections.
    this.poolCluster.add('MASTER', options.master)
    this.poolCluster.add('SLAVE', options.slave)
    this.getClusterConnection = P.promisify(this.poolCluster.getConnection, this.poolCluster)


    this.statInterval = setInterval(
      reportStats.bind(this),
      options.statInterval || 15000
    )
    this.statInterval.unref()

    // prune tokens every so often
    function prune() {
      this.pruneTokens().done(
        function() {
          log.info({ op: 'db.pruneTokens', msg: 'Finished' })
        },
        function(err) {
          log.error({ op: 'db.pruneTokens', err: err })
        }
      )

      var pruneIn = options.pruneEvery / 2 + Math.floor(Math.random() * options.pruneEvery)
      setTimeout(prune.bind(this), pruneIn).unref()
    }
    // start the pruning off, but only if enabled in config
    if ( options.enablePruning ) {
      prune.bind(this)()
    }
  }

  function reportStats() {
    var nodes = Object.keys(this.poolCluster._nodes).map(
      function (name) {
        return this.poolCluster._nodes[name]
      }.bind(this)
    )
    var stats = nodes.reduce(
      function (totals, node) {
        totals.errors += node.errorCount
        totals.connections += node.pool._allConnections.length
        totals.queue += node.pool._connectionQueue.length
        totals.free += node.pool._freeConnections.length
        return totals
      },
      {
        stat: 'mysql',
        errors: 0,
        connections: 0,
        queue: 0,
        free: 0
      }
    )
    log.info('stats', stats)
  }

  // this will be called from outside this file
  MySql.connect = function(options) {
    // check that the database patch level is what we expect (or one above)
    var mysql = new MySql(options)

    // Select : dbMetadata
    // Fields : value
    // Where  : name = $1
    var DB_METADATA = 'CALL dbMetadata_1(?)'

    return mysql.readFirstResult(DB_METADATA, [options.patchKey])
      .then(
        function (result) {
          mysql.patchLevel = +result.value

          log.info('connect', {
            patchLevel: mysql.patchLevel,
            patchLevelRequired: patch.level
          })

          if ( mysql.patchLevel >= patch.level ) {
            return mysql
          }

          throw new Error('dbIncorrectPatchLevel')
        }
      )
  }

  MySql.prototype.close = function () {
    this.poolCluster.end()
    clearInterval(this.statInterval)
    return P.resolve()
  }

  MySql.prototype.ping = function () {
    return this.getConnection('MASTER')
      .then(
        function(connection) {
          var d = P.defer()
          connection.ping(
            function (err) {
              connection.release()
              return err ? d.reject(err) : d.resolve()
            }
          )
          return d.promise
        }
      )
  }

  // CREATE

  // Insert : accounts
  // Values : uid = $1, normalizedEmail = $2, email = $3, emailCode = $4, emailVerified = $5, kA = $6, wrapWrapKb = $7, authSalt = $8, verifierVersion = $9, verifyHash = $10, verifierSetAt = $11, createdAt = $12, locale = $13, openid = $14, openidHash = $15
  var CREATE_ACCOUNT = 'CALL createAccount_3(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'

  MySql.prototype.createAccount = function (uid, data) {
    return this.write(
      CREATE_ACCOUNT,
      [
        uid,
        data.normalizedEmail,
        data.email,
        data.emailCode,
        data.emailVerified,
        data.kA,
        data.wrapWrapKb,
        data.authSalt,
        data.verifierVersion,
        data.verifyHash,
        data.verifierSetAt,
        data.createdAt,
        data.locale,
        data.openId,
        data.openId ? crypto.createHash('sha256').update(data.openId).digest() : null
      ]
    )
  }

  // Insert : sessionTokens
  // Values : tokenId = $1, tokenData = $2, uid = $3, createdAt = $4,
  //          uaBrowser = $5, uaBrowserVersion = $6, uaOS = $7,
  //          uaOSVersion = $8, uaDeviceType = $9
  var CREATE_SESSION_TOKEN = 'CALL createSessionToken_2(?, ?, ?, ?, ?, ?, ?, ?, ?)'

  MySql.prototype.createSessionToken = function (tokenId, sessionToken) {
    return this.write(
      CREATE_SESSION_TOKEN,
      [
        tokenId,
        sessionToken.data,
        sessionToken.uid,
        sessionToken.createdAt,
        sessionToken.uaBrowser,
        sessionToken.uaBrowserVersion,
        sessionToken.uaOS,
        sessionToken.uaOSVersion,
        sessionToken.uaDeviceType
      ]
    )
  }

  // Insert : keyFetchTokens
  // Values : tokenId = $1, authKey = $2, uid = $3, keyBundle = $4, createdAt = $5
  var CREATE_KEY_FETCH_TOKEN = 'CALL createKeyFetchToken_1(?, ?, ?, ?, ?)'

  MySql.prototype.createKeyFetchToken = function (tokenId, keyFetchToken) {
    return this.write(
      CREATE_KEY_FETCH_TOKEN,
      [
        tokenId,
        keyFetchToken.authKey,
        keyFetchToken.uid,
        keyFetchToken.keyBundle,
        keyFetchToken.createdAt
      ]
    )
  }

  // Insert : accountResetTokens
  // Values : tokenId = $1, tokenData = $2, uid = $3, createdAt = $4
  var CREATE_ACCOUNT_RESET_TOKEN = 'CALL createAccountResetToken_2(?, ?, ?, ?)'

  MySql.prototype.createAccountResetToken = function (tokenId, accountResetToken) {
    return this.write(
      CREATE_ACCOUNT_RESET_TOKEN,
      [
        tokenId,
        accountResetToken.data,
        accountResetToken.uid,
        accountResetToken.createdAt
      ]
    )
  }

  // Insert : passwordForgotTokens
  // Values : tokenId = $1, tokenData = $2, uid = $3, passCode = $4, createdAt = $5, tries = $6
  var CREATE_PASSWORD_FORGOT_TOKEN = 'CALL createPasswordForgotToken_2(?, ?, ?, ?, ?, ?)'

  MySql.prototype.createPasswordForgotToken = function (tokenId, passwordForgotToken) {
    return this.write(
      CREATE_PASSWORD_FORGOT_TOKEN,
      [
        tokenId,
        passwordForgotToken.data,
        passwordForgotToken.uid,
        passwordForgotToken.passCode,
        passwordForgotToken.createdAt,
        passwordForgotToken.tries
      ]
    )
  }

  // Insert : passwordChangeTokens
  // Values : tokenId = $1, tokenData = $2, uid = $3, createdAt = $4
  var CREATE_PASSWORD_CHANGE_TOKEN = 'CALL createPasswordChangeToken_2(?, ?, ?, ?)'

  MySql.prototype.createPasswordChangeToken = function (tokenId, passwordChangeToken) {
    return this.write(
      CREATE_PASSWORD_CHANGE_TOKEN,
      [
        tokenId,
        passwordChangeToken.data,
        passwordChangeToken.uid,
        passwordChangeToken.createdAt
      ]
    )
  }

  var UPSERT_DEVICE = 'CALL upsertDevice_1(?, ?, ?, ?, ?, ?, ?)'

  MySql.prototype.upsertDevice = function (uid, deviceId, deviceInfo) {
    return this.write(
      UPSERT_DEVICE,
      [
        uid,
        deviceId,
        deviceInfo.sessionTokenId,
        deviceInfo.name,
        deviceInfo.type,
        deviceInfo.createdAt,
        deviceInfo.callbackURL
      ]
    )
  }

  // READ

  // Select : accounts
  // Fields : uid
  // Where  : normalizedEmail = LOWER($1)
  var ACCOUNT_EXISTS = 'CALL accountExists_1(?)'

  MySql.prototype.accountExists = function (emailBuffer) {
    return this.readFirstResult(ACCOUNT_EXISTS, [emailBuffer.toString('utf8')])
  }

  // Select : accounts
  // Fields : uid
  // Where  : uid = $1 AND verifyHash = $2
  var CHECK_PASSWORD = 'CALL checkPassword_1(?, ?)'

  MySql.prototype.checkPassword = function (uid, hash) {
    return this.readFirstResult(
      CHECK_PASSWORD,
      [uid, hash.verifyHash]
    ).catch(function(err) {
      // If .readFirstResult() doesn't find anything, it returns an error.notFound()
      // so we need to convert that to an error.incorrectPassword()
      if ( err.errno === error.notFound().errno ) {
        throw error.incorrectPassword()
      }
      throw err
    })
  }

  // Select : devices d, sessionTokens s
  // Fields : d.uid, d.id, d.sessionTokenId, d.name, d.type, d.createdAt, d.callbackURL,
  //          s.uaBrowser, s.uaBrowserVersion, s.uaOS, s.uaOSVersion,
  //          s.uaDeviceType, s.lastAccessTime
  // Where  : d.uid = $1
  var ACCOUNT_DEVICES = 'CALL accountDevices_2(?)'

  MySql.prototype.accountDevices = function (uid) {
    return this.readOneFromFirstResult(ACCOUNT_DEVICES, [uid])
  }

  // Select : sessionTokens
  // Fields : id, uid, createdAt, uaBrowser, uaBrowserVersion,
  //          uaOS, uaOSVersion, uaDeviceType, lastAccessTime
  // Where  : uid = $1
  var SESSIONS = 'CALL sessions_1(?)'

  MySql.prototype.sessions = function (uid) {
    return this.readOneFromFirstResult(SESSIONS, [uid])
  }

  // Select : sessionTokens t, accounts a
  // Fields : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
  //          t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
  //          a.emailVerified, a.email, a.emailCode, a.verifierSetAt, a.locale,
  //          a.createdAt AS accountCreatedAt
  // Where  : t.tokenId = $1 AND t.uid = a.uid
  var SESSION_TOKEN = 'CALL sessionToken_3(?)'

  MySql.prototype.sessionToken = function (id) {
    return this.readFirstResult(SESSION_TOKEN, [id])
  }

  // Select : keyFetchTokens t, accounts a
  // Fields : t.authKey, t.uid, t.keyBundle, t.createdAt, a.emailVerified, a.verifierSetAt
  // Where  : t.tokenId = $1 AND t.uid = a.uid
  var KEY_FETCH_TOKEN = 'CALL keyFetchToken_1(?)'

  MySql.prototype.keyFetchToken = function (id) {
    return this.readFirstResult(KEY_FETCH_TOKEN, [id])
  }

  // Select : accountResetTokens t, accounts a
  // Fields : t.uid, t.tokenData, t.createdAt, a.verifierSetAt
  // Where  : t.tokenId = $1 AND t.uid = a.uid
  var ACCOUNT_RESET_TOKEN = 'CALL accountResetToken_1(?)'

  MySql.prototype.accountResetToken = function (id) {
    return this.readFirstResult(ACCOUNT_RESET_TOKEN, [id])
  }

  // Select : passwordForgotToken t, accounts a
  // Fields : t.uid, t.tokenData, t.createdAt, t.passCode, t.tries, a.email, a.verifierSetAt
  // Where  : t.tokenId = $1 AND t.uid = a.uid
  var PASSWORD_FORGOT_TOKEN = 'CALL passwordForgotToken_1(?)'
  MySql.prototype.passwordForgotToken = function (id) {
    return this.readFirstResult(PASSWORD_FORGOT_TOKEN, [id])
  }

  // Select : passwordChangeToken t, accounts a
  // Fields : t.uid, t.tokenData, t.createdAt, a.email, a.verifierSetAt
  // Where  : t.tokenId = $1 AND t.uid = a.uid
  var PASSWORD_CHANGE_TOKEN = 'CALL passwordChangeToken_2(?)'

  MySql.prototype.passwordChangeToken = function (id) {
    return this.readFirstResult(PASSWORD_CHANGE_TOKEN, [id])
  }

  // Select : accounts
  // Fields : uid, email, normalizedEmail, emailVerified, emailCode, kA, wrapWrapKb, verifierVersion, authSalt, verifierSetAt, lockedAt
  // Where  : accounts.normalizedEmail = LOWER($1)
  var EMAIL_RECORD = 'CALL emailRecord_3(?)'

  MySql.prototype.emailRecord = function (emailBuffer) {
    return this.readFirstResult(EMAIL_RECORD, [emailBuffer.toString('utf8')])
  }

  var OPENID_RECORD = 'CALL openIdRecord_1(?)'

  MySql.prototype.openIdRecord = function (openid) {
    var openidHash = crypto.createHash('sha256').update(openid).digest()
    return this.readFirstResult(OPENID_RECORD, [openidHash])
  }

  // Select : accounts
  // Fields : uid, email, normalizedEmail, emailVerified, emailCode, kA, wrapWrapKb, verifierVersion, authSalt, verifierSetAt, createdAt, locale, lockedAt
  // Where  : accounts.uid = LOWER($1)
  var ACCOUNT = 'CALL account_3(?)'

  MySql.prototype.account = function (uid) {
    return this.readFirstResult(ACCOUNT, [uid])
  }

  // UPDATE

  // Update : passwordForgotTokens
  // Set    : tries = $1
  // Where  : tokenId = $2
  var UPDATE_PASSWORD_FORGOT_TOKEN = 'CALL updatePasswordForgotToken_1(?, ?)'

  MySql.prototype.updatePasswordForgotToken = function (tokenId, token) {
    return this.write(UPDATE_PASSWORD_FORGOT_TOKEN, [token.tries, tokenId])
  }

  // Update : sessionTokens
  // Set    : uaBrowser = $1, uaBrowserVersion = $2, uaOS = $3, uaOSVersion = $4,
  //          uaDeviceType = $5, lastAccessTime = $6
  // Where  : tokenId = $7
  var UPDATE_SESSION_TOKEN = 'CALL updateSessionToken_1(?, ?, ?, ?, ?, ?, ?)'

  MySql.prototype.updateSessionToken = function (tokenId, token) {
    return this.write(
      UPDATE_SESSION_TOKEN,
      [
        token.uaBrowser,
        token.uaBrowserVersion,
        token.uaOS,
        token.uaOSVersion,
        token.uaDeviceType,
        token.lastAccessTime,
        tokenId
      ]
    )
  }

  // DELETE

  // Delete : sessionTokens, keyFetchTokens, accountResetTokens, passwordChangeTokens, passwordForgotTokens, accountUnlockCodes, accounts
  // Where  : uid = $1
  var DELETE_ACCOUNT = 'CALL deleteAccount_6(?)'

  MySql.prototype.deleteAccount = function (uid) {
    return this.write(DELETE_ACCOUNT, [uid])
  }

  // Delete : sessionTokens
  // Where  : tokenId = $1
  var DELETE_SESSION_TOKEN = 'CALL deleteSessionToken_1(?)'

  MySql.prototype.deleteSessionToken = function (tokenId) {
    return this.write(DELETE_SESSION_TOKEN, [tokenId])
  }

  // Delete : keyFetchTokens
  // Where  : tokenId = $1
  var DELETE_KEY_FETCH_TOKEN = 'CALL deleteKeyFetchToken_1(?)'

  MySql.prototype.deleteKeyFetchToken = function (tokenId) {
    return this.write(DELETE_KEY_FETCH_TOKEN, [tokenId])
  }

  // Delete : accountResetTokens
  // Where  : tokenId = $1
  var DELETE_ACCOUNT_RESET_TOKEN = 'CALL deleteAccountResetToken_1(?)'

  MySql.prototype.deleteAccountResetToken = function (tokenId) {
    return this.write(DELETE_ACCOUNT_RESET_TOKEN, [tokenId])
  }

  // Delete : passwordForgotTokens
  // Where  : tokenId = $1
  var DELETE_PASSWORD_FORGOT_TOKEN = 'CALL deletePasswordForgotToken_1(?)'

  MySql.prototype.deletePasswordForgotToken = function (tokenId) {
    return this.write(DELETE_PASSWORD_FORGOT_TOKEN, [tokenId])
  }

  // Delete : passwordChangeTokens
  // Where  : tokenId = $1
  var DELETE_PASSWORD_CHANGE_TOKEN = 'CALL deletePasswordChangeToken_1(?)'

  MySql.prototype.deletePasswordChangeToken = function (tokenId) {
    return this.write(DELETE_PASSWORD_CHANGE_TOKEN, [tokenId])
  }

  var DELETE_DEVICE = 'CALL deleteDevice_1(?, ?)'

  MySql.prototype.deleteDevice = function (uid, deviceId) {
    return this.write(DELETE_DEVICE, [uid, deviceId])
  }

  // BATCH

  // Step   : 1
  // Delete : sessionTokens, keyFetchTokens, accountResetTokens, passwordChangeTokens, passwordForgotTokens, accountUnlockCodes
  // Where  : uid = $1
  //
  // Step   : 2
  // Update : accounts
  // Set    : verifyHash = $2, authSalt = $3, wrapWrapKb = $4, verifierSetAt = $5, verifierVersion = $6
  // Where  : uid = $1
  var RESET_ACCOUNT = 'CALL resetAccount_4(?, ?, ?, ?, ?, ?)'

  MySql.prototype.resetAccount = function (uid, data) {
    return this.write(
      RESET_ACCOUNT,
      [uid, data.verifyHash, data.authSalt, data.wrapWrapKb, data.verifierSetAt, data.verifierVersion]
    )
  }

  // Update : accounts
  // Set    : emailVerified = true
  // Where  : uid = $1
  var VERIFY_EMAIL = 'CALL verifyEmail_2(?)'

  MySql.prototype.verifyEmail = function (uid) {
    return this.write(VERIFY_EMAIL, [uid])
  }

  // Step   : 1
  // Delete : passwordForgotTokens
  // Where  : tokenId = $1
  //
  // Step   : 2
  // Insert : accountResetTokens
  // Values : tokenId = $2, tokenData = $3, uid = $4, createdAt = $5
  //
  // Step   : 3
  // Update : accounts
  // Set    : emailVerified = true
  // Where  : uid = $4
  //
  // Step   : 4
  // Delete : accountUnlockCodes
  // Where  : uid = $4
  //
  var FORGOT_PASSWORD_VERIFIED = 'CALL forgotPasswordVerified_4(?, ?, ?, ?, ?)'

  MySql.prototype.forgotPasswordVerified = function (tokenId, accountResetToken) {
    return this.write(
      FORGOT_PASSWORD_VERIFIED,
      [
        tokenId,
        accountResetToken.tokenId,
        accountResetToken.data,
        accountResetToken.uid,
        accountResetToken.createdAt
      ]
    )
  }

  // Update : accounts
  // Set    : locale = $1
  // Where  : uid = $2
  var UPDATE_LOCALE = 'CALL updateLocale_1(?, ?)'

  MySql.prototype.updateLocale = function (uid, data) {
    return this.write(UPDATE_LOCALE, [data.locale, uid])
  }


  // Update : accounts
  // Set    : lockedAt = $2
  // Where  : uid = $1
  // Update : accountUnlockCodes
  // Set    : unlockCode = $3
  // Where  : uid = $1
  var LOCK_ACCOUNT = 'CALL lockAccount_2(?, ?, ?)'

  MySql.prototype.lockAccount = function (uid, data) {
    return this.write(LOCK_ACCOUNT, [uid, data.unlockCode, data.lockedAt])
  }

  // Update : accounts
  // Set    : lockedAt = null
  // Where  : uid = $1
  // Delete : accountUnlockCodes
  // Where  : uid = $1
  var UNLOCK_ACCOUNT = 'CALL unlockAccount_2(?)'

  MySql.prototype.unlockAccount = function (uid) {
    return this.write(UNLOCK_ACCOUNT, [uid])
  }

  // Select : accountUnlockCodes
  // Where  : uid = $1
  var GET_UNLOCK_CODE = 'call unlockCode_1(?)'

  MySql.prototype.unlockCode = function (uid) {
    return this.readFirstResult(GET_UNLOCK_CODE, [uid])
  }

  // Internal

  MySql.prototype.singleQuery = function (poolName, sql, params) {
    return this.getConnection(poolName)
      .then(
        function (connection) {
          return query(connection, sql, params)
            .then(
              function (result) {
                connection.release()
                return result
              },
              function (err) {
                connection.release()
                throw err
              }
            )
        }
      )
  }

  MySql.prototype.multipleQueries = function (poolName, queries, finalQuery) {
    return this.getConnection(poolName)
      .then(
        function (connection) {
          var results = []
          return P.each(
            queries,
            function (q) {
              return query(connection, q.sql, q.params)
                .then(
                  function (result) {
                    results.push(result)
                  }
                )
            }
          )
          .then(
            function () {
              return results
            }
          )
          .finally(
            function () {
              if (finalQuery) {
                return query(connection, finalQuery.sql, finalQuery.params)
                  .finally(finish)
              }

              finish()

              function finish () {
                connection.release()
              }
            }
          )
        }
      )
  }

  MySql.prototype.transaction = function (fn) {
    return retryable(
      function () {
        return this.getConnection('MASTER')
          .then(
            function (connection) {
              return query(connection, 'BEGIN')
                .then(
                  function () {
                    return fn(connection)
                  }
                )
                .then(
                  function (result) {
                    return query(connection, 'COMMIT')
                      .then(function () { return result })
                  }
                )
                .catch(
                  function (err) {
                    log.error({ op: 'MySql.transaction', err: err })
                    return query(connection, 'ROLLBACK')
                      .then(function () { throw err })
                  }
                )
                .then(
                  function (result) {
                    connection.release()
                    return result
                  },
                  function (err) {
                    connection.release()
                    throw err
                  }
                )
            }
          )
      }.bind(this),
      LOCK_ERRNOS
    )
    .catch(
      function (err) {
        throw error.wrap(err)
      }
    )
  }

  MySql.prototype.readFirstResult = function (sql, params) {
    return this.read(sql, params)
      .then(function(results) {
        // instead of the result being [result], it'll be [[result...]]
        if (!results.length) { throw error.notFound() }
        if (!results[0].length) { throw error.notFound() }
        return results[0][0]
      })
  }

  MySql.prototype.readOneFromFirstResult = function (sql, params) {
    return this.read(sql, params)
      .then(function(results) {
        // instead of the result being [result], it'll be [[result...]]
        if (!results.length) { throw error.notFound() }
        return results[0]
      })
  }

  MySql.prototype.read = function (sql, params) {
    return this.singleQuery('SLAVE*', sql, params)
      .catch(
        function (err) {
          log.error({ op: 'MySql.read', sql: sql, id: params, err: err })
          throw error.wrap(err)
        }
      )
  }

  MySql.prototype.readMultiple = function (queries, finalQuery) {
    return this.multipleQueries('SLAVE*', queries, finalQuery)
      .catch(
        function (err) {
          log.error({ op: 'MySql.readMultiple', err: err })
          throw error.wrap(err)
        }
      )
  }

  MySql.prototype.write = function (sql, params) {
    return this.singleQuery('MASTER', sql, params)
      .then(
        function (result) {
          log.trace({ op: 'MySql.write', sql: sql, result: result })
          return {}
        },
        function (err) {
          log.error({ op: 'MySql.write', sql: sql, err: err })
          if (err.errno === ER_DUP_ENTRY) {
            err = error.duplicate()
          }
          else {
            err = error.wrap(err)
          }
          throw err
        }
      )
  }

  MySql.prototype.getConnection = function (name) {
    return retryable(
      this.getClusterConnection.bind(this, name),
      [ER_TOO_MANY_CONNECTIONS, 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET']
    )
  }

  function query(connection, sql, params) {
    var d = P.defer()
    connection.query(
      sql,
      params || [],
      function (err, results) {
        if (err) { return d.reject(err) }
        d.resolve(results)
      }
    )
    return d.promise
  }

  function retryable(fn, errnos) {
    function success(result) {
      return result
    }
    function failure(err) {
      var errno = err.cause ? err.cause.errno : err.errno
      log.error({ op: 'MySql.retryable', err: err })
      if (errnos.indexOf(errno) === -1) {
        throw err
      }
      return fn()
    }
    return fn().then(success, failure)
  }

  // exposed for testing only
  MySql.prototype.retryable_ = retryable

  var PRUNE = 'CALL prune(?, ?)'
  MySql.prototype.pruneTokens = function () {
    log.info({  op : 'MySql.pruneTokens' })

    var now = Date.now()
    var pruneBefore = now - this.options.pruneEvery

    return this.write(
      PRUNE,
      [pruneBefore, now]
    )
  }

  // Execute a callback with an ordered list of unpublished events.
  //
  // This method will fetch the next batch of unpublished events from
  // the db and pass them to the provided callback, which should return
  // a promise.  If the callback completes successfully then the events
  // will be marked as published; if it completes with an error then the
  // events will remain unpublished and available for a subsequent fetch.
  //
  // If the callback succeeds in processing some, but not all, of the events
  // then it should return the number of events successfully processed.
  // We assume they're processed in order.
  //
  // The database enforces mutual exclusion of access to events in order to
  // prevent publication of duplicates.  If another client is currently
  // accessing the events, then the callback is not invoked and this method
  // will reject with an EventQueueLockedError error object.

  var GET_UNPUBLISHED_EVENTS = 'CALL getUnpublishedEvents_1()'
  var ACK_PUBLISHED_EVENTS = 'CALL ackPublishedEvents_1(?)'

  function EventQueueLockedError(message) {
    this.message = message || 'event queue locked'
    Error.captureStackTrace(this, EventQueueLockedError)
  }
  util.inherits(EventQueueLockedError, Error)

  MySql.prototype.processUnpublishedEvents = function (fn) {
    // Internally we use a db-level lock for mutual exclusion.
    // We have to call GET_LOCK() and RELEASE_LOCK() on the same
    // db connection or things will get very confused.
    return this.getConnection('MASTER')
      .then(
        function (connection) {
          // We must manually release this connection when we're done.
          return query(connection, GET_UNPUBLISHED_EVENTS, [])
            .then(
              function (results) {
                // Did we successfully acquire the lock?
                if (!results[0][0].lockAcquired) {
                  throw new EventQueueLockedError()
                }
                // We're now holding a db-level lock that must be released.
                // Luckily MySQL will clear it if our connection dies,
                // and we kill the connection in the event of error.
                var events = results[2]
                return P.resolve(events).then(fn)
                  .then(
                    function (numProcessed) {
                      var ackPos
                      // Default to acknowledging the entire list.
                      if (typeof numProcessed === 'undefined') {
                        numProcessed = events.length
                      }
                      if (numProcessed === 0) {
                        ackPos = 0
                      } else {
                        ackPos = events[numProcessed - 1].pos
                      }
                      // ACK_PUBLISHED_EVENTS will release the lock.
                      return query(connection, ACK_PUBLISHED_EVENTS, [ackPos])
                    }
                  )
              }
            )
            .then(
              function (res) {
                // All is well, return the connection to the pool.
                connection.release()
                return res
              },
              function (err) {
                // Something went wrong.  Unless we're sure we don't have the
                // lock, destroy the connection so we don't leave it hanging.
                if (err instanceof EventQueueLockedError) {
                  connection.release()
                } else {
                  log.error({
                    op: 'MySql.processUnpublishedEvents',
                    err: err
                  })
                  connection.destroy()
                }
                throw err
              }
            )
        }
      )
  }

  return MySql
}
