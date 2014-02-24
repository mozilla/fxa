/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var mysql = require('mysql');
var schema = require('fs').readFileSync(__dirname + '/schema.sql', { encoding: 'utf8'})

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

  // this will connect to mysql, create the database
  // then create the schema, prior to returning an
  // instance of MySql
  function createSchema(options) {
    log.trace( { op: 'MySql.createSchema' } )

    var d = P.defer()

    // To create the schema we need to switch multipleStatements on
    // as well as connecting without a database name, but switching to it
    // once it has been created.
    options.master.multipleStatements = true
    var database = options.master.database
    delete options.master.database

    var client = mysql.createConnection(options.master)

    log.trace( { op: 'MySql.createSchema:CreateDatabase' } )
    client.query(
      'CREATE DATABASE IF NOT EXISTS ' + database + ' CHARACTER SET utf8 COLLATE utf8_unicode_ci',
      function (err) {
        if (err) {
          log.error({ op: 'MySql.createSchema:CreateDatabase', err: err.message })
          return d.reject(err)
        }
        log.trace( { op: 'MySql.createSchema : changing user' } )
        client.changeUser(
          {
            user     : options.master.user,
            password : options.master.password,
            database : database
          },
          function (err) {
            if (err) {
              log.error({ op: 'MySql.createSchema:ChangeUser', err: err.message })
              return d.reject(err)
            }
            log.trace( { op: 'MySql.createSchema:MakingTheSchema' } )
            client.query(
              schema,
              function (err) {
                if (err) {
                  log.trace( { op: 'MySql.createSchema:ClosingTheClient', err: err.message } )
                  return d.reject(err)
                }
                client.end(
                  function (err) {
                    if (err) {
                      log.error({ op: 'MySql.createSchema:End', err: err.message })
                      return d.reject(err)
                    }

                    // put these options back
                    options.master.database = database
                    delete options.master.multipleStatements

                    // create the mysql class
                    d.resolve(new MySql(options))
                  }
                )
              }
            )
          }
        )
      }
    )
    return d.promise
  }

  // this will be called from outside this file
  MySql.connect = function(options) {
    if (options.createSchema) {
      return createSchema(options)
    }
    return P(new MySql(options))
  }

  MySql.prototype.close = function () {
    this.poolCluster.end()
    clearInterval(this.statInterval)
    return P()
  }

  MySql.prototype.ping = function () {
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.ping(function (err) {
          con.release()
          return err ? d.reject(err) : d.resolve()
        })
        return d.promise
      })
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

    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
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
          ],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(data)
          }
        )
        return d.promise
      })
  }

  var CREATE_SESSION_TOKEN = 'INSERT INTO sessionTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createSessionToken = function (authToken) {
    log.trace({ op: 'MySql.createSessionToken', uid: authToken && authToken.uid })

    var con

    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return SessionToken.create(authToken)
      })
      .then(function(sessionToken) {
        var d = P.defer()
        con.query(
          CREATE_SESSION_TOKEN,
          [
            sessionToken.tokenId,
            sessionToken.data,
            sessionToken.uid,
            sessionToken.createdAt
          ],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(sessionToken)
          }
        )
        return d.promise
      })
  }

  var CREATE_KEY_FETCH_TOKEN = 'INSERT INTO keyFetchTokens' +
    ' (tokenId, authKey, uid, keyBundle, createdAt)' +
    ' VALUES (?, ?, ?, ?, ?)'

  MySql.prototype.createKeyFetchToken = function (authToken) {
    log.trace({ op: 'MySql.createKeyFetchToken', uid: authToken && authToken.uid })
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return KeyFetchToken.create(authToken)
      })
      .then(function (keyFetchToken) {
        var d = P.defer()
        con.query(
          CREATE_KEY_FETCH_TOKEN,
          [
            keyFetchToken.tokenId,
            keyFetchToken.authKey,
            keyFetchToken.uid,
            keyFetchToken.keyBundle,
            keyFetchToken.createdAt
          ],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(keyFetchToken)
          }
        )
        return d.promise
      }.bind(this))
  }

  var CREATE_ACCOUNT_RESET_TOKEN = 'REPLACE INTO accountResetTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createAccountResetToken = function (token /* authToken|passwordForgotToken */) {
    log.trace({ op: 'MySql.createAccountResetToken', uid: token && token.uid })
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return AccountResetToken.create(token)
      })
      .then(function (accountResetToken) {
        var d = P.defer()
        con.query(
          CREATE_ACCOUNT_RESET_TOKEN,
          [
            accountResetToken.tokenId,
            accountResetToken.data,
            accountResetToken.uid,
            accountResetToken.createdAt
          ],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(accountResetToken)
          }
        )
        return d.promise
      }.bind(this))
  }

  var CREATE_PASSWORD_FORGOT_TOKEN = 'REPLACE INTO passwordForgotTokens' +
    ' (tokenId, tokenData, uid, passCode, createdAt, tries)' +
    ' VALUES (?, ?, ?, ?, ?, ?)'

  MySql.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace({ op: 'MySql.createPasswordForgotToken', uid: emailRecord && emailRecord.uid })
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return PasswordForgotToken.create(emailRecord)
      })
      .then(function (passwordForgotToken) {
        var d = P.defer()
        con.query(
          CREATE_PASSWORD_FORGOT_TOKEN,
          [
            passwordForgotToken.tokenId,
            passwordForgotToken.data,
            passwordForgotToken.uid,
            passwordForgotToken.passCode,
            passwordForgotToken.createdAt,
            passwordForgotToken.tries
          ],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(passwordForgotToken)
          }
        )
        return d.promise
      })
  }

  var CREATE_PASSWORD_CHANGE_TOKEN = 'REPLACE INTO passwordChangeTokens' +
    ' (tokenId, tokenData, uid, createdAt)' +
    ' VALUES (?, ?, ?, ?)'

  MySql.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'MySql.createPasswordChangeToken', uid: data && data.uid })
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return PasswordChangeToken.create(data)
      })
      .then(function (passwordChangeToken) {
        var d = P.defer()
        con.query(
          CREATE_PASSWORD_CHANGE_TOKEN,
          [
            passwordChangeToken.tokenId,
            passwordChangeToken.data,
            passwordChangeToken.uid,
            passwordChangeToken.createdAt
          ],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(passwordChangeToken)
          }
        )
        return d.promise
      })
  }

  // READ

  var ACCOUNT_EXISTS = 'SELECT uid FROM accounts WHERE normalizedEmail = LOWER(?)'

  MySql.prototype.accountExists = function (email) {
    log.trace({ op: 'MySql.accountExists', email: email })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          ACCOUNT_EXISTS,
          [email],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(!!results.length)
          }
        )
      return d.promise
      })
  }

  var ACCOUNT_DEVICES = 'SELECT tokenId FROM sessionTokens WHERE uid = ?'

  MySql.prototype.accountDevices = function (uid) {
    log.trace({ op: 'MySql.accountDevices', uid: uid })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          ACCOUNT_DEVICES,
          [uid],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(results)
          }
        )
        return d.promise
      })
  }

var SESSION_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt,' +
  ' a.emailVerified, a.email, a.emailCode, a.verifierSetAt' +
  ' FROM sessionTokens t, accounts a' +
  ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.sessionToken = function (id) {
    log.trace({ op: 'MySql.sessionToken', id: id })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          SESSION_TOKEN,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            SessionToken.fromHex(result.tokenData, result)
              .done(
                function (sessionToken) {
                  return d.resolve(sessionToken)
                }
              )
          }
        )
        return d.promise
      })
  }

var KEY_FETCH_TOKEN = 'SELECT t.authKey, t.uid, t.keyBundle, t.createdAt,' +
  ' a.emailVerified, a.verifierSetAt' +
  ' FROM keyFetchTokens t, accounts a' +
  ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'MySql.keyFetchToken', id: id })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          KEY_FETCH_TOKEN,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            KeyFetchToken.fromId(id, result)
              .done(
                function (keyFetchToken) {
                  return d.resolve(keyFetchToken)
                }
              )
          }
        )
        return d.promise
      })
  }

  var ACCOUNT_RESET_TOKEN = 'SELECT t.uid, t.tokenData, t.createdAt,' +
    ' a.verifierSetAt' +
    ' FROM accountResetTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.accountResetToken = function (id) {
    log.trace({ op: 'MySql.accountResetToken', id: id })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          ACCOUNT_RESET_TOKEN,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            d.resolve(results[0])
          }
        )
        return d.promise
      })
      .then(function(result) {
        return AccountResetToken.fromHex(result.tokenData, result)
      })
  }

  var PASSWORD_FORGOT_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt,' +
    ' t.passCode, t.tries, a.email, a.verifierSetAt' +
    ' FROM passwordForgotTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'MySql.passwordForgotToken', id: id })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          PASSWORD_FORGOT_TOKEN,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            PasswordForgotToken.fromHex(result.tokenData, result)
              .done(
                function (passwordForgotToken) {
                  return d.resolve(passwordForgotToken)
                }
              )
          }
        )
        return d.promise
      })
  }

  var PASSWORD_CHANGE_TOKEN = 'SELECT t.tokenData, t.uid, t.createdAt, a.verifierSetAt ' +
    ' FROM passwordChangeTokens t, accounts a' +
    ' WHERE t.tokenId = ? AND t.uid = a.uid'

  MySql.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'MySql.passwordChangeToken', id: id })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          PASSWORD_CHANGE_TOKEN,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            PasswordChangeToken.fromHex(result.tokenData, result)
              .done(
                function (passwordChangeToken) {
                  return d.resolve(passwordChangeToken)
                }
              )
          }
        )
        return d.promise
      })
  }

  var EMAIL_RECORD = 'SELECT uid, email, normalizedEmail, emailVerified, emailCode,' +
    ' kA, wrapWrapKb, verifierVersion, verifyHash, authSalt, verifierSetAt' +
    ' FROM accounts' +
    ' WHERE normalizedEmail = LOWER(?)'

  MySql.prototype.emailRecord = function (email) {
    log.trace({ op: 'MySql.emailRecord', email: email })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          EMAIL_RECORD,
          [email],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.unknownAccount(email))
            var result = results[0]
            return d.resolve({
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
            })
          }
        )
        return d.promise
      })
  }

  var ACCOUNT = 'SELECT email, normalizedEmail, emailCode, emailVerified, kA,' +
    ' wrapWrapKb, verifierVersion, verifyHash, authSalt, verifierSetAt, createdAt' +
    ' FROM accounts WHERE uid = ?'

  MySql.prototype.account = function (uid) {

    log.trace({ op: 'MySql.account', uid: uid })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          ACCOUNT,
          [uid],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.unknownAccount())
            var result = results[0]
            return d.resolve({
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
            })
          }
        )
        return d.promise
      })
  }

  // UPDATE

  var UPDATE_PASSWORD_FORGOT_TOKEN = 'UPDATE passwordForgotTokens' +
    ' SET tries = ? WHERE tokenId = ?'

  MySql.prototype.updatePasswordForgotToken = function (passwordForgotToken) {
    log.trace({ op: 'MySql.udatePasswordForgotToken', uid: passwordForgotToken && passwordForgotToken.uid })

    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          UPDATE_PASSWORD_FORGOT_TOKEN,
          [passwordForgotToken.tries, passwordForgotToken.tokenId],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  // DELETE

  MySql.prototype.deleteAccount = function (authToken) {
    log.trace({ op: 'MySql.deleteAccount', uid: authToken && authToken.uid })
    var con
    return this.getMasterConnection()
      .then(function(newCon) {
        con = newCon
        return beginTransaction(con)
      })
      .then(function() {
        var tables = [
          'sessionTokens',
          'keyFetchTokens',
          'accountResetTokens',
          'passwordChangeTokens',
          'passwordForgotTokens',
          'accounts'
        ]
        var all = [];
        tables.forEach(function(tablename) {
          all.push(deleteFromTableUsingUid(con, tablename, authToken.uid))
        })
        return P.all(all)
      })
      .then(function() {
        return commitTransaction(con).then(function() {
          con.release()
        })
      })
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
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          DELETE_SESSION_TOKEN,
          [sessionToken.tokenId],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
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
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          DELETE_KEY_FETCH_TOKEN,
          [keyFetchToken.tokenId],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
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
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          DELETE_ACCOUNT_RESET_TOKEN,
          [accountResetToken.tokenId],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
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
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          DELETE_PASSWORD_FORGOT_TOKEN,
          [passwordForgotToken.tokenId],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
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
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          DELETE_PASSWORD_CHANGE_TOKEN,
          [passwordChangeToken.tokenId],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  // BATCH

  var RESET_ACCOUNT = 'UPDATE accounts' +
    ' SET verifyHash = ?, authSalt = ?, wrapWrapKb = ?, verifierSetAt = ?,' +
    ' verifierVersion = ?' +
    ' WHERE uid = ?'

  MySql.prototype.resetAccount = function (accountResetToken, data) {
    log.trace({ op: 'MySql.resetAccount', uid: accountResetToken && accountResetToken.uid })
    var con
    return this.getMasterConnection()
      .then(function(newCon) {
        con = newCon
        return beginTransaction(con)
      })
      .then(function() {
        var tables = [
          'sessionTokens',
          'keyFetchTokens',
          'accountResetTokens',
          'passwordChangeTokens',
          'passwordForgotTokens'
        ]
        var all = [];
        tables.forEach(function(tablename) {
          all.push(deleteFromTableUsingUid(con, tablename, accountResetToken.uid))
        })
        return P.all(all)
      })
      .then(function() {
        var d = P.defer()
        con.query(
          RESET_ACCOUNT,
          [
            data.verifyHash,
            data.authSalt,
            data.wrapWrapKb,
            Date.now(),
            data.verifierVersion,
            accountResetToken.uid
          ],
          function (err) {
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
      .then(function() {
          return commitTransaction(con).then(function() {
            con.release()
          })
      })
  }

  var VERIFY_EMAIL = 'UPDATE accounts SET emailVerified = true WHERE uid = ?'

  MySql.prototype.verifyEmail = function (account) {
    log.trace({ op: 'MySql.verifyEmail', uid: account && account.uid })

    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          VERIFY_EMAIL,
          [account.uid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.forgotPasswordVerified = function (passwordForgotToken) {
    log.trace({ op: 'MySql.forgotPasswordVerified', uid: passwordForgotToken && passwordForgotToken.uid })

    var con
    var accountResetToken

    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return beginTransaction(con)
      })
      .then(function() {
        return AccountResetToken.create(passwordForgotToken)
      })
      .then(function(newAccountResetToken) {
        accountResetToken = newAccountResetToken
        var d = P.defer()
        con.query(
          DELETE_PASSWORD_FORGOT_TOKEN,
          [passwordForgotToken.tokenId],
          function (err) {
            if (err) return d.reject(err)
            d.resolve()
          }
        )
        return d.promise
      })
      .then(function() {
        var d = P.defer()
        con.query(
          CREATE_ACCOUNT_RESET_TOKEN,
          [
            accountResetToken.tokenId,
            accountResetToken.data,
            accountResetToken.uid,
            accountResetToken.createdAt
          ],
          function (err) {
            if (err) return d.reject(err)
            d.resolve(accountResetToken)
          }
        )
        return d.promise
      })
      .then(function(newAccountResetToken) {
          accountResetToken = newAccountResetToken
          return commitTransaction(con).then(function() {
            con.release()
            return accountResetToken
          })
      })
  }

  MySql.prototype.getConnection = function (name) {
    var d = P.defer()
    var self = this
    var retry = true
    function gotConnection(err, connection) {
      if (err) {
        log.error( { op: 'MySql.getConnection', name: name, err: err } )
        if (retry) {
          retry = false
          return self.poolCluster.getConnection(name, gotConnection)
        }
        return d.reject(error.serviceUnavailable())
      }
      d.resolve(connection)
    }
    this.poolCluster.getConnection(name, gotConnection)
    return d.promise
  }

  MySql.prototype.getMasterConnection = function() {
    return this.getConnection('MASTER')
  }

  MySql.prototype.getSlaveConnection = function() {
    return this.getConnection('SLAVE*')
  }

  function beginTransaction(client) {
    var d = P.defer()
    client.query('BEGIN', function(err, con) {
      if (err) return d.reject(err)
      d.resolve(con)
    })
    return d.promise
  }

  function commitTransaction(client) {
    var d = P.defer()
    client.query('COMMIT', function(err) {
      if (err) {
        client.query('ROLLBACK', function() {
          d.reject(err)
        })
        return
      }
      d.resolve()
    })
    return d.promise
  }

  function deleteFromTableUsingUid(client, table, uid) {
    var d = P.defer()

    var sql = 'DELETE FROM ' + table + ' WHERE uid = ?'
    client.query(
      sql,
      [uid],
      function(err, res) {
        if (err) return d.reject(err)
        d.resolve(res)
      }
    )

    return d.promise
  }

  return MySql
}
