/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var mysql = require('mysql')

module.exports = function (
  P,
  log,
  error,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  PasswordForgotToken,
  PasswordChangeToken
  ) {

  // http://dev.mysql.com/doc/refman/5.5/en/error-messages-server.html
  var LOCK_ERRNOS = [ 1205, 1206, 1213, 1689 ]

  // make a pool of connections that we can draw from
  function MySql(options) {

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

    return mysql.read("SELECT value FROM dbMetadata WHERE name = ?", options.patchKey)
      .then(
        function (results) {
          if (!results.length) { throw error.dbIncorrectPatchLevel() }
          var patchLevel = +results[0].value
          if ( patchLevel !== options.patchLevel && patchLevel !== options.patchLevel + 1 ) {
            throw error.dbIncorrectPatchLevel(patchLevel, options.patchLevel)
          }
          log.trace({
            op: 'MySql.connect',
            patchLevel: patchLevel,
            patchLevelRequired: options.patchLevel
          })
          return mysql
        },
        function(err) {
          console.log(err)
          // If this error means that dbMetadata does not exist, assume patch level 2 for now
          if ( err.code === 'ER_NO_SUCH_TABLE' ) {
            // for now, this is ok
            return mysql
          }
          // re-throw so the caller gets the problem
          throw err
        }
      )
  }

  MySql.prototype.close = function () {
    this.poolCluster.end()
    clearInterval(this.statInterval)
    return P()
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

  MySql.prototype.createAccount = function (data) {
    log.trace(
      {
        op: 'MySql.createAccount',
        uid: data && data.uid,
        email: data && data.email
      }
    )
    data.normalizedEmail = data.email
    data.createdAt = data.verifierSetAt = Date.now()

    return this.write(
      CREATE_ACCOUNT,
      [
        data.uid,
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
    .then(
      function () {
        return data
      },
      function (err) {
        log.error({ op: 'MySql.createAccount.1', err: err })
        if (err.errno === 1062) {
          err = error.accountExists(data.email)
        }
        throw err
      }
    )
  }

  var CREATE_SESSION_TOKEN = 'INSERT INTO sessionTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createSessionToken = function (authToken) {
    log.trace({ op: 'MySql.createSessionToken', uid: authToken && authToken.uid })

    return SessionToken.create(authToken)
      .then(
        function (sessionToken) {
          return this.write(
            CREATE_SESSION_TOKEN,
            [
              sessionToken.tokenId,
              sessionToken.data,
              sessionToken.uid,
              sessionToken.createdAt
            ]
          )
          .then(
            function () {
              return sessionToken
            }
          )
        }.bind(this)
      )
  }

  var CREATE_KEY_FETCH_TOKEN = 'INSERT INTO keyFetchTokens' +
    ' (tokenId, authKey, uid, keyBundle, createdAt)' +
    ' VALUES (?, ?, ?, ?, ?)'

  MySql.prototype.createKeyFetchToken = function (authToken) {
    log.trace({ op: 'MySql.createKeyFetchToken', uid: authToken && authToken.uid })

    return KeyFetchToken.create(authToken)
      .then(
        function (keyFetchToken) {
          return this.write(
            CREATE_KEY_FETCH_TOKEN,
            [
              keyFetchToken.tokenId,
              keyFetchToken.authKey,
              keyFetchToken.uid,
              keyFetchToken.keyBundle,
              keyFetchToken.createdAt
            ]
          )
          .then(
            function () {
              return keyFetchToken
            }
          )
        }.bind(this)
      )
  }

  var CREATE_ACCOUNT_RESET_TOKEN = 'REPLACE INTO accountResetTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createAccountResetToken = function (token) {
    log.trace({ op: 'MySql.createAccountResetToken', uid: token && token.uid })

    return AccountResetToken.create(token)
      .then(
        function (accountResetToken) {
          return this.write(
            CREATE_ACCOUNT_RESET_TOKEN,
            [
              accountResetToken.tokenId,
              accountResetToken.data,
              accountResetToken.uid,
              accountResetToken.createdAt
            ]
          )
          .then(
            function () {
              return accountResetToken
            }
          )
        }.bind(this)
      )
  }

  var CREATE_PASSWORD_FORGOT_TOKEN = 'REPLACE INTO passwordForgotTokens' +
    ' (tokenId, tokenData, uid, passCode, createdAt, tries)' +
    ' VALUES (?, ?, ?, ?, ?, ?)'

  MySql.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace(
      {
        op: 'MySql.createPasswordForgotToken',
        uid: emailRecord && emailRecord.uid
      }
    )

    return PasswordForgotToken.create(emailRecord)
      .then(
        function (passwordForgotToken) {
          return this.write(
            CREATE_PASSWORD_FORGOT_TOKEN,
            [
              passwordForgotToken.tokenId,
              passwordForgotToken.data,
              passwordForgotToken.uid,
              passwordForgotToken.passCode,
              passwordForgotToken.createdAt,
              passwordForgotToken.tries
            ]
          )
          .then(
            function () {
              return passwordForgotToken
            }
          )
        }.bind(this)
      )
  }

  var CREATE_PASSWORD_CHANGE_TOKEN = 'REPLACE INTO passwordChangeTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'MySql.createPasswordChangeToken', uid: data && data.uid })

    return PasswordChangeToken.create(data)
      .then(
        function (passwordChangeToken) {
          return this.write(
            CREATE_PASSWORD_CHANGE_TOKEN,
            [
              passwordChangeToken.tokenId,
              passwordChangeToken.data,
              passwordChangeToken.uid,
              passwordChangeToken.createdAt
            ]
          )
          .then(
            function () {
              return passwordChangeToken
            }
          )
        }.bind(this)
      )
  }

  // READ

  var ACCOUNT_EXISTS = 'SELECT uid FROM accounts WHERE normalizedEmail = LOWER(?)'

  MySql.prototype.accountExists = function (email) {
    log.trace({ op: 'MySql.accountExists', email: email })

    return this.read(ACCOUNT_EXISTS, email)
      .then(
        function (results) {
          return !!results.length
        }
      )
  }

  var ACCOUNT_DEVICES = 'SELECT tokenId FROM sessionTokens WHERE uid = ?'

  MySql.prototype.accountDevices = function (uid) {
    log.trace({ op: 'MySql.accountDevices', uid: uid })

    return this.read(ACCOUNT_DEVICES, uid)
  }

  var SESSION_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt,' +
    ' a.emailVerified, a.email, a.emailCode, a.verifierSetAt' +
    ' FROM sessionTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.sessionToken = function (id) {
    log.trace({ op: 'MySql.sessionToken', id: id })

    return this.read(SESSION_TOKEN, id)
      .then(
        function (results) {
          if (!results.length) { throw error.invalidToken() }
          return SessionToken.fromHex(results[0].tokenData, results[0])
        }
      )
  }

var KEY_FETCH_TOKEN = 'SELECT t.authKey, t.uid, t.keyBundle, t.createdAt,' +
  ' a.emailVerified, a.verifierSetAt' +
  ' FROM keyFetchTokens t, accounts a' +
  ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'MySql.keyFetchToken', id: id })

    return this.read(KEY_FETCH_TOKEN, id)
      .then(
        function (results) {
          if (!results.length) { throw error.invalidToken() }
          return KeyFetchToken.fromId(id, results[0])
        }
      )
  }

  var ACCOUNT_RESET_TOKEN = 'SELECT t.uid, t.tokenData, t.createdAt,' +
    ' a.verifierSetAt' +
    ' FROM accountResetTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.accountResetToken = function (id) {
    log.trace({ op: 'MySql.accountResetToken', id: id })

    return this.read(ACCOUNT_RESET_TOKEN, id)
      .then(
        function (results) {
          if (!results.length) { throw error.invalidToken() }
          return AccountResetToken.fromHex(results[0].tokenData, results[0])
        }
      )
  }

  var PASSWORD_FORGOT_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt,' +
    ' t.passCode, t.tries, a.email, a.verifierSetAt' +
    ' FROM passwordForgotTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'MySql.passwordForgotToken', id: id })

    return this.read(PASSWORD_FORGOT_TOKEN, id)
      .then(
        function (results) {
          if (!results.length) { throw error.invalidToken() }
          return PasswordForgotToken.fromHex(results[0].tokenData, results[0])
        }
      )
  }

  var PASSWORD_CHANGE_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt, a.verifierSetAt' +
    ' FROM passwordChangeTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'MySql.passwordChangeToken', id: id })

    return this.read(PASSWORD_CHANGE_TOKEN, id)
      .then(
        function (results) {
          if (!results.length) { throw error.invalidToken() }
          return PasswordChangeToken.fromHex(results[0].tokenData, results[0])
        }
      )
  }

  var EMAIL_RECORD = 'SELECT uid, email, normalizedEmail, emailVerified, emailCode,' +
    ' kA, wrapWrapKb, verifierVersion, verifyHash, authSalt, verifierSetAt' +
    ' FROM accounts' +
    ' WHERE normalizedEmail = LOWER(?)'

  MySql.prototype.emailRecord = function (email) {
    log.trace({ op: 'MySql.emailRecord', email: email })

    return this.read(EMAIL_RECORD, email)
      .then(
        function (results) {
          if (!results.length) { throw error.unknownAccount(email) }
          var result = results[0]
          return {
            uid: result.uid,
            email: result.email,
            normalizedEmail: result.normalizedEmail,
            emailCode: result.emailCode,
            emailVerified: !!result.emailVerified,
            kA: result.kA,
            wrapWrapKb: result.wrapWrapKb,
            verifierVersion: result.verifierVersion,
            verifyHash: result.verifyHash,
            authSalt: result.authSalt,
            verifierSetAt: result.verifierSetAt
          }
        }
      )
  }

  var ACCOUNT = 'SELECT email, normalizedEmail, emailCode, emailVerified, kA,' +
    ' wrapWrapKb, verifierVersion, verifyHash, authSalt, verifierSetAt, createdAt' +
    ' FROM accounts WHERE uid = ?'

  MySql.prototype.account = function (uid) {

    log.trace({ op: 'MySql.account', uid: uid })

    return this.read(ACCOUNT, uid)
      .then(
        function (results) {
          if (!results.length) { throw error.unknownAccount() }
          var result = results[0]
          return {
            uid: uid,
            email: result.email,
            normalizedEmail: result.normalizedEmail,
            emailCode: result.emailCode,
            emailVerified: !!result.emailVerified,
            kA: result.kA,
            wrapWrapKb: result.wrapWrapKb,
            verifierVersion: result.verifierVersion,
            verifyHash: result.verifyHash,
            authSalt: result.authSalt,
            verifierSetAt: result.verifierSetAt,
            createdAt: result.createdAt
          }
        }
      )
  }

  // UPDATE

  var UPDATE_PASSWORD_FORGOT_TOKEN = 'UPDATE passwordForgotTokens' +
    ' SET tries = ? WHERE tokenId = ?'

  MySql.prototype.updatePasswordForgotToken = function (passwordForgotToken) {
    log.trace(
      {
        op: 'MySql.udatePasswordForgotToken',
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )

    return this.write(
      UPDATE_PASSWORD_FORGOT_TOKEN,
      [
        passwordForgotToken.tries,
        passwordForgotToken.tokenId
      ]
    )
  }

  // DELETE

  MySql.prototype.deleteAccount = function (authToken) {
    log.trace({ op: 'MySql.deleteAccount', uid: authToken && authToken.uid })

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
        var queries = deleteFromTablesWhereUid(connection, tables, authToken.uid)
        return P.all(queries)
      }
    )
  }

  var DELETE_SESSION_TOKEN = 'DELETE FROM sessionTokens WHERE tokenId = ?'

  MySql.prototype.deleteSessionToken = function (sessionToken) {
    log.trace(
      {
        op: 'MySql.deleteSessionToken',
        id: sessionToken && sessionToken.tokenId,
        uid: sessionToken && sessionToken.uid
      }
    )

    return this.write(
      DELETE_SESSION_TOKEN,
      [sessionToken.tokenId]
    )
  }

  var DELETE_KEY_FETCH_TOKEN = 'DELETE FROM keyFetchTokens WHERE tokenId = ?'

  MySql.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    log.trace(
      {
        op: 'MySql.deleteKeyFetchToken',
        id: keyFetchToken && keyFetchToken.tokenId,
        uid: keyFetchToken && keyFetchToken.uid
      }
    )
    return this.write(
      DELETE_KEY_FETCH_TOKEN,
      [keyFetchToken.tokenId]
    )
  }

  var DELETE_ACCOUNT_RESET_TOKEN = 'DELETE FROM accountResetTokens WHERE tokenId = ?'

  MySql.prototype.deleteAccountResetToken = function (accountResetToken) {
    log.trace(
      {
        op: 'MySql.deleteAccountResetToken',
        id: accountResetToken && accountResetToken.tokenId,
        uid: accountResetToken && accountResetToken.uid
      }
    )
    return this.write(
      DELETE_ACCOUNT_RESET_TOKEN,
      [accountResetToken.tokenId]
    )
  }

  var DELETE_PASSWORD_FORGOT_TOKEN = 'DELETE FROM passwordForgotTokens WHERE tokenId = ?'

  MySql.prototype.deletePasswordForgotToken = function (passwordForgotToken) {
    log.trace(
      {
        op: 'MySql.deletePasswordForgotToken',
        id: passwordForgotToken && passwordForgotToken.tokenId,
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )
    return this.write(
      DELETE_PASSWORD_FORGOT_TOKEN,
      [passwordForgotToken.tokenId]
    )
  }

  var DELETE_PASSWORD_CHANGE_TOKEN = 'DELETE FROM passwordChangeTokens WHERE tokenId = ?'

  MySql.prototype.deletePasswordChangeToken = function (passwordChangeToken) {
    log.trace(
      {
        op: 'MySql.deletePasswordChangeToken',
        id: passwordChangeToken && passwordChangeToken.tokenId,
        uid: passwordChangeToken && passwordChangeToken.uid
      }
    )
    return this.write(
      DELETE_PASSWORD_CHANGE_TOKEN,
      [passwordChangeToken.tokenId]
    )
  }

  // BATCH

  var RESET_ACCOUNT = 'UPDATE accounts' +
    ' SET verifyHash = ?, authSalt = ?, wrapWrapKb = ?, verifierSetAt = ?,' +
    ' verifierVersion = ?' +
    ' WHERE uid = ?'

  MySql.prototype.resetAccount = function (accountResetToken, data) {
    log.trace(
      {
        op: 'MySql.resetAccount',
        uid: accountResetToken && accountResetToken.uid
      }
    )

    return this.transaction(
      function (connection) {
        var tables = [
          'sessionTokens',
          'keyFetchTokens',
          'accountResetTokens',
          'passwordChangeTokens',
          'passwordForgotTokens'
        ]
        var queries = deleteFromTablesWhereUid(
          connection,
          tables,
          accountResetToken.uid
        )
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
              accountResetToken.uid
            ]
          )
        )

        return P.all(queries)
      }
    )
  }

  var VERIFY_EMAIL = 'UPDATE accounts SET emailVerified = true WHERE uid = ?'

  MySql.prototype.verifyEmail = function (account) {
    log.trace({ op: 'MySql.verifyEmail', uid: account && account.uid })

    return this.write(
      VERIFY_EMAIL,
      [account.uid]
    )
  }

  MySql.prototype.forgotPasswordVerified = function (passwordForgotToken) {
    log.trace(
      {
        op: 'MySql.forgotPasswordVerified',
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )

    return this.transaction(
      function (connection) {
        return AccountResetToken.create(passwordForgotToken)
          .then(
            function (accountResetToken) {
              var queries = []
              queries.push(
                query(
                  connection,
                  DELETE_PASSWORD_FORGOT_TOKEN,
                  [passwordForgotToken.tokenId]
                )
              )
              queries.push(
                query(
                  connection,
                  CREATE_ACCOUNT_RESET_TOKEN,
                  [
                    accountResetToken.tokenId,
                    accountResetToken.data,
                    accountResetToken.uid,
                    accountResetToken.createdAt
                  ]
                )
              )
              queries.push(
                query(
                  connection,
                  VERIFY_EMAIL,
                  [passwordForgotToken.uid]
                )
              )
              return P.all(queries)
                .then(
                  function () {
                    return accountResetToken
                  }
                )
            }
          )
      }
    )
  }

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
                .then(
                  function (result) { return result },
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
  }

  MySql.prototype.read = function (sql, param) {
    return this.singleQuery('SLAVE*', sql, [param])
  }

  MySql.prototype.write = function (sql, params) {
    return this.singleQuery('MASTER', sql, params)
  }

  MySql.prototype.getConnection = function (name) {
    return retryable(
      connect.bind(this, name),
      [1040, 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET']
    )
    .then(
      null,
      function (err) {
        throw error.serviceUnavailable()
      }
    )
  }

  function connect(name) {
    var d = P.defer()
    this.poolCluster.getConnection(
      name,
      function (err, connection) {
        if (err) {
          log.error({ op: 'MySql.connection', err: err })
          return d.reject(err)
        }
        d.resolve(connection)
      }
    )
    return d.promise
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
      log.error({ op: 'MySql.retryable', err: err })
      if (errnos.indexOf(err.errno) === -1) {
        throw err
      }
      return fn()
    }
    return fn().then(success, failure)
  }

  return MySql
}
