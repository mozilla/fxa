/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var mysql = require('mysql')
var P = require('../promise')

module.exports = function (log, error) {

  // http://dev.mysql.com/doc/refman/5.5/en/error-messages-server.html
  var LOCK_ERRNOS = [ 1205, 1206, 1213, 1689 ]

  // make a pool of connections that we can draw from
  function MySql(options) {

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
    log.stat(stats)
  }

  // this will be called from outside this file
  MySql.connect = function(options) {
    // check that the database patch level is what we expect (or one above)
    var mysql = new MySql(options)

    return mysql.readOne("SELECT value FROM dbMetadata WHERE name = ?", options.patchKey)
      .then(
        function (result) {
          mysql.patchLevel = +result.value
          if (
            mysql.patchLevel < options.patchLevel ||
            mysql.patchLevel > options.patchLevel + 1
          ) {
            throw new Error('dbIncorrectPatchLevel')
          }
          log.trace({
            op: 'MySql.connect',
            patchLevel: mysql.patchLevel,
            patchLevelRequired: options.patchLevel
          })
          return mysql
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
  var CREATE_ACCOUNT = 'INSERT INTO accounts' +
    ' (uid, normalizedEmail, email, emailCode, emailVerified, kA, wrapWrapKb,' +
    ' authSalt, verifierVersion, verifyHash, verifierSetAt, createdAt)' +
    ' VALUES (?, LOWER(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'

  MySql.prototype.createAccount = function (uid, data) {
    data.normalizedEmail = data.email
    data.createdAt = data.verifierSetAt = Date.now()

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
        data.createdAt
      ]
    )
  }

  var CREATE_SESSION_TOKEN = 'INSERT INTO sessionTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createSessionToken = function (tokenId, sessionToken) {
    return this.write(
      CREATE_SESSION_TOKEN,
      [
        tokenId,
        sessionToken.data,
        sessionToken.uid,
        sessionToken.createdAt
      ]
    )
  }

  var CREATE_KEY_FETCH_TOKEN = 'INSERT INTO keyFetchTokens' +
    ' (tokenId, authKey, uid, keyBundle, createdAt)' +
    ' VALUES (?, ?, ?, ?, ?)'

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

  var CREATE_ACCOUNT_RESET_TOKEN = 'REPLACE INTO accountResetTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

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

  var CREATE_PASSWORD_FORGOT_TOKEN = 'REPLACE INTO passwordForgotTokens' +
    ' (tokenId, tokenData, uid, passCode, createdAt, tries)' +
    ' VALUES (?, ?, ?, ?, ?, ?)'

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

  var CREATE_PASSWORD_CHANGE_TOKEN = 'REPLACE INTO passwordChangeTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

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

  // READ

  var ACCOUNT_EXISTS = 'SELECT uid FROM accounts WHERE normalizedEmail = LOWER(?)'

  MySql.prototype.accountExists = function (email) {
    return this.readOne(ACCOUNT_EXISTS, Buffer(email, 'hex').toString('utf8'))
  }

  var ACCOUNT_DEVICES = 'SELECT tokenId as id FROM sessionTokens WHERE uid = ?'

  MySql.prototype.accountDevices = function (uid) {
    return this.read(ACCOUNT_DEVICES, uid)
  }

  var SESSION_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt,' +
    ' a.emailVerified, a.email, a.emailCode, a.verifierSetAt' +
    ' FROM sessionTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.sessionToken = function (id) {
    return this.readOne(SESSION_TOKEN, id)
  }

  var KEY_FETCH_TOKEN = 'SELECT t.authKey, t.uid, t.keyBundle, t.createdAt,' +
  ' a.emailVerified, a.verifierSetAt' +
  ' FROM keyFetchTokens t, accounts a' +
  ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.keyFetchToken = function (id) {
    return this.readOne(KEY_FETCH_TOKEN, id)
  }

  var ACCOUNT_RESET_TOKEN = 'SELECT t.uid, t.tokenData, t.createdAt,' +
    ' a.verifierSetAt' +
    ' FROM accountResetTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.accountResetToken = function (id) {
    return this.readOne(ACCOUNT_RESET_TOKEN, id)
  }

  var PASSWORD_FORGOT_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt,' +
    ' t.passCode, t.tries, a.email, a.verifierSetAt' +
    ' FROM passwordForgotTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.passwordForgotToken = function (id) {
    return this.readOne(PASSWORD_FORGOT_TOKEN, id)
  }

  var PASSWORD_CHANGE_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt, a.verifierSetAt' +
    ' FROM passwordChangeTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.passwordChangeToken = function (id) {
    return this.readOne(PASSWORD_CHANGE_TOKEN, id)
  }

  var EMAIL_RECORD = 'SELECT uid, email, normalizedEmail, emailVerified, emailCode,' +
    ' kA, wrapWrapKb, verifierVersion, verifyHash, authSalt, verifierSetAt' +
    ' FROM accounts' +
    ' WHERE normalizedEmail = LOWER(?)'

  MySql.prototype.emailRecord = function (email) {
    return this.readOne(EMAIL_RECORD, Buffer(email, 'hex').toString('utf8'))
  }

  var ACCOUNT = 'SELECT uid, email, normalizedEmail, emailCode, emailVerified, kA,' +
    ' wrapWrapKb, verifierVersion, verifyHash, authSalt, verifierSetAt, createdAt' +
    ' FROM accounts WHERE uid = ?'

  MySql.prototype.account = function (uid) {
    return this.readOne(ACCOUNT, uid)
  }

  // UPDATE

  var UPDATE_PASSWORD_FORGOT_TOKEN = 'UPDATE passwordForgotTokens' +
    ' SET tries = ? WHERE tokenId = ?'

  MySql.prototype.updatePasswordForgotToken = function (tokenId, token) {
    return this.write(UPDATE_PASSWORD_FORGOT_TOKEN, [token.tries, tokenId])
  }

  // DELETE

  MySql.prototype.deleteAccount = function (uid) {
    return this.transaction(
      function (connection) {
        var tables = [
          'sessionTokens',
          'keyFetchTokens',
          'accountResetTokens',
          'passwordChangeTokens',
          'passwordForgotTokens',
          'accounts'
        ]
        var queries = deleteFromTablesWhereUid(connection, tables, uid)
        return P.all(queries)
      }
    )
  }

  var DELETE_SESSION_TOKEN = 'DELETE FROM sessionTokens WHERE tokenId = ?'

  MySql.prototype.deleteSessionToken = function (tokenId) {
    return this.write(DELETE_SESSION_TOKEN, [tokenId])
  }

  var DELETE_KEY_FETCH_TOKEN = 'DELETE FROM keyFetchTokens WHERE tokenId = ?'

  MySql.prototype.deleteKeyFetchToken = function (tokenId) {
    return this.write(DELETE_KEY_FETCH_TOKEN, [tokenId])
  }

  var DELETE_ACCOUNT_RESET_TOKEN = 'DELETE FROM accountResetTokens WHERE tokenId = ?'

  MySql.prototype.deleteAccountResetToken = function (tokenId) {
    return this.write(DELETE_ACCOUNT_RESET_TOKEN, [tokenId])
  }

  var DELETE_PASSWORD_FORGOT_TOKEN = 'DELETE FROM passwordForgotTokens WHERE tokenId = ?'

  MySql.prototype.deletePasswordForgotToken = function (tokenId) {
    return this.write(DELETE_PASSWORD_FORGOT_TOKEN, [tokenId])
  }

  var DELETE_PASSWORD_CHANGE_TOKEN = 'DELETE FROM passwordChangeTokens WHERE tokenId = ?'

  MySql.prototype.deletePasswordChangeToken = function (tokenId) {
    return this.write(DELETE_PASSWORD_CHANGE_TOKEN, [tokenId])
  }

  // BATCH

  var RESET_ACCOUNT = 'UPDATE accounts' +
    ' SET verifyHash = ?, authSalt = ?, wrapWrapKb = ?, verifierSetAt = ?,' +
    ' verifierVersion = ?' +
    ' WHERE uid = ?'

  MySql.prototype.resetAccount = function (uid, data) {
    return this.transaction(
      function (connection) {
        var tables = [
          'sessionTokens',
          'keyFetchTokens',
          'accountResetTokens',
          'passwordChangeTokens',
          'passwordForgotTokens'
        ]
        var queries = deleteFromTablesWhereUid(connection, tables, uid)
        queries.push(
          query(
            connection,
            RESET_ACCOUNT,
            [
              data.verifyHash,
              data.authSalt,
              data.wrapWrapKb,
              Date.now(),
              data.verifierVersion,
              uid
            ]
          )
        )

        return P.all(queries)
      }
    )
  }

  var VERIFY_EMAIL = 'UPDATE accounts SET emailVerified = true WHERE uid = ?'

  MySql.prototype.verifyEmail = function (uid) {
    return this.write(VERIFY_EMAIL, [uid])
  }

  MySql.prototype.forgotPasswordVerified = function (tokenId, accountResetToken) {
    return this.transaction(
      function (connection) {
        return P.all([
          query(
            connection,
            DELETE_PASSWORD_FORGOT_TOKEN,
            [tokenId]
          ),
          query(
            connection,
            CREATE_ACCOUNT_RESET_TOKEN,
            [
              accountResetToken.tokenId,
              accountResetToken.data,
              accountResetToken.uid,
              accountResetToken.createdAt
            ]
          ),
          query(
            connection,
            VERIFY_EMAIL,
            [accountResetToken.uid]
          )
        ])
      }
    )
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

  MySql.prototype.readOne = function (sql, param) {
    return this.read(sql, param).then(firstResult)
  }

  MySql.prototype.read = function (sql, param) {
    return this.singleQuery('SLAVE*', sql, [param])
      .catch(
        function (err) {
          log.error({ op: 'MySql.read', sql: sql, id: param, err: err })
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
          if (err.errno === 1062) {
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
      this.getClusterConnection,
      [1040, 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET']
    )
  }

  function firstResult(results) {
    if (!results.length) { throw error.notFound() }
    return results[0]
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

  function deleteFromTablesWhereUid(connection, tables, uid) {
    return tables.map(
      function (table) {
        return query(connection, 'DELETE FROM ' + table + ' WHERE uid = ?', uid)
      }
    )
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

  return MySql
}
