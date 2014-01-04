/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var mysql = require('mysql');
var schema = require('fs').readFileSync(__dirname + '/schema.sql', { encoding: 'utf8'})

module.exports = function (
  log,
  error,
  AuthToken,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  SrpToken,
  PasswordForgotToken,
  PasswordChangeToken
  ) {

  // make a pool of connections that we can draw from
  function MySql(options) {
    this.poolCluster = mysql.createPoolCluster()

    // add MASTER and SLAVE
    this.poolCluster.add('MASTER', options.master)
    this.poolCluster.add('SLAVE', options.slave)
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
            database : database,
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
                    var mysql = new MySql(options)
                    d.resolve(mysql)
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
    var d = P.defer()
    this.poolCluster.end(function(err) {
      delete this.poolCluster
      return err ? d.reject(err) : d.resolve()
    }.bind(this));
    return d.promise
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

  MySql.prototype.createAccount = function (data) {
    log.trace(
      {
        op: 'MySql.createAccount',
        uid: data && data.uid,
        email: data && data.email
      }
    )
    var sql = 'INSERT INTO accounts (uid, email, emailCode, verified, kA, wrapWrapKb, authSalt, verifyHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [
            data.uid,
            data.email,
            data.emailCode,
            data.verified,
            data.kA,
            data.wrapWrapKb,
            data.authSalt,
            data.verifyHash
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
          'INSERT INTO sessionTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
          [sessionToken.tokenid, sessionToken.data, sessionToken.uid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(sessionToken)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.createKeyFetchToken = function (authToken) {
    log.trace({ op: 'MySql.createKeyFetchToken', uid: authToken && authToken.uid })
    var sql = 'INSERT INTO keyfetchTokens (tokenid, authKey, uid, keyBundle) VALUES (?, ?, ?, ?)'
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return KeyFetchToken.create(authToken)
      })
      .then(function (keyFetchToken) {
        var d = P.defer()
        con.query(
          sql,
          [keyFetchToken.tokenid, keyFetchToken.authKey, keyFetchToken.uid, keyFetchToken.keyBundle],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(keyFetchToken)
          }
        )
        return d.promise
      }.bind(this))
  }

  MySql.prototype.createAccountResetToken = function (token /* authToken|passwordForgotToken */) {
    log.trace({ op: 'MySql.createAccountResetToken', uid: token && token.uid })
    var sql = 'REPLACE INTO resetTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return AccountResetToken.create(token)
      })
      .then(function (accountResetToken) {
        var d = P.defer()
        con.query(
          sql,
          [accountResetToken.tokenid, accountResetToken.data, accountResetToken.uid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(accountResetToken)
          }
        )
        return d.promise
      }.bind(this))
  }

  MySql.prototype.createAuthToken = function (srpToken) {
    log.trace({ op: 'MySql.createAuthToken', uid: srpToken && srpToken.uid })
    var sql = 'INSERT INTO authTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return AuthToken.create(srpToken)
      })
      .then(function(authToken) {
        var d = P.defer()
        con.query(
          sql,
          [authToken.tokenid, authToken.data, authToken.uid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(authToken)
          }
        )
        return d.promise
      }.bind(this))
  }

  MySql.prototype.createSrpToken = function (emailRecord) {
    log.trace({ op: 'MySql.createSrpToken', uid: emailRecord && emailRecord.uid })
    var sql = 'INSERT INTO srpTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'

    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return SrpToken.create(emailRecord)
      })
      .then(function (srpToken) {
        var d = P.defer()
        con.query(
          sql,
          [srpToken.tokenid, srpToken.data, srpToken.uid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(srpToken)
          }
        )
        return d.promise
      }.bind(this))
  }

  MySql.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace({ op: 'MySql.createPasswordForgotToken', uid: emailRecord && emailRecord.uid })
    var sql = 'REPLACE INTO passwordForgotTokens (tokenid, tokendata, uid, passcode, created, tries) VALUES (?, ?, ?, ?, ?, ?)'
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return PasswordForgotToken.create(emailRecord)
      })
      .then(function (passwordForgotToken) {
        var d = P.defer()
        con.query(
          sql,
          [
            passwordForgotToken.tokenid,
            passwordForgotToken.data,
            passwordForgotToken.uid,
            passwordForgotToken.passcode,
            passwordForgotToken.created,
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

  MySql.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'MySql.createPasswordChangeToken', uid: data && data.uid })
    var sql = 'REPLACE INTO passwordChangeTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    var con
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return PasswordChangeToken.create(data)
      })
      .then(function (passwordChangeToken) {
        var d = P.defer()
        con.query(
          sql,
          [
            passwordChangeToken.tokenid,
            passwordChangeToken.data,
            passwordChangeToken.uid
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

  MySql.prototype.accountExists = function (email) {
    log.trace({ op: 'MySql.accountExists', email: email })
    var sql = 'SELECT uid FROM accounts WHERE email = ?'

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
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

  MySql.prototype.accountDevices = function (uid) {
    log.trace({ op: 'MySql.accountDevices', uid: uid })
    var sql = 'SELECT tokenid FROM sessionTokens WHERE uid = ?'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
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

  MySql.prototype.sessionToken = function (id) {
    log.trace({ op: 'MySql.sessionToken', id: id })
    var sql = 'SELECT t.tokendata, t.uid, a.verified, a.email, a.emailCode' +
              '  FROM sessionTokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            SessionToken.fromHex(result.tokendata, result)
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

  MySql.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'MySql.keyFetchToken', id: id })
    var sql = 'SELECT t.authKey, t.uid, t.keyBundle, a.verified ' +
              '  FROM keyfetchTokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
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

  MySql.prototype.accountResetToken = function (id) {
    log.trace({ op: 'MySql.accountResetToken', id: id })

    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          'SELECT uid, tokendata FROM resetTokens WHERE tokenid = ?',
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
        return AccountResetToken.fromHex(result.tokendata, result)
      })
      .then(function(accountResetToken) {
        return P(accountResetToken)
      })
  }

  MySql.prototype.authToken = function (id) {
    log.trace({ op: 'MySql.authToken', id: id })
    var sql = 'SELECT t.uid, t.tokendata, a.verified' +
              '  FROM authTokens t, accounts a' +
              '  WHERE t.tokenid = ? AND t.uid = a.uid'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            AuthToken.fromHex(result.tokendata, result)
              .done(
                function (authToken) {
                  return d.resolve(authToken)
                }
              )
          }
        )
        return d.promise
      })
  }

  MySql.prototype.srpToken = function (id) {
    log.trace({ op: 'MySql.srpToken', id: id })
    var sql = 'SELECT t.tokendata, t.uid, a.srp, a.passwordStretching ' +
              '  FROM srpTokens t, accounts a ' +
              '  WHERE t.tokenid = ? AND t.uid = a.uid'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            result.srp = JSON.parse(result.srp)
            result.passwordStretching = JSON.parse(result.passwordStretching)
            SrpToken.fromHex(result.tokendata, result)
              .done(
                function (srpToken) {
                  return d.resolve(srpToken)
                }
              )
          }
        )
        return d.promise
      })
  }

  MySql.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'MySql.passwordForgotToken', id: id })
    var sql = 'SELECT t.tokendata, t.uid, a.email, t.passcode, t.created, t.tries  ' +
              ' FROM passwordForgotTokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            PasswordForgotToken.fromHex(result.tokendata, result)
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

  MySql.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'MySql.passwordChangeToken', id: id })
    var sql = 'SELECT t.tokendata, t.uid ' +
              ' FROM passwordChangeTokens t WHERE t.tokenid = ?'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [id],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.invalidToken())
            var result = results[0]
            PasswordChangeToken.fromHex(result.tokendata, result)
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

  MySql.prototype.emailRecord = function (email) {
    log.trace({ op: 'MySql.emailRecord', email: email })
    var sql = 'SELECT uid, verified, emailCode, kA, wrapWrapKb, verifyHash, authSalt FROM accounts WHERE email = ?'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [email],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.unknownAccount())
            var result = results[0]
            return d.resolve({
              uid: result.uid,
              email: email,
              emailCode: result.emailCode,
              verified: !!result.verified,
              kA: result.kA,
              wrapWrapKb: result.wrapWrapKb,
              verifyHash: result.verifyHash,
              authSalt: result.authSalt
            })
          }
        )
        return d.promise
      })
  }

  MySql.prototype.account = function (uid) {

    log.trace({ op: 'MySql.account', uid: uid })
    var sql = 'SELECT email, emailCode, verified, kA, wrapWrapKb, verifyHash, authSalt ' +
              '  FROM accounts WHERE uid = ?'
    return this.getSlaveConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [uid],
          function (err, results) {
            con.release()
            if (err) return d.reject(err)
            if (!results.length) return d.reject(error.unknownAccount())
            var result = results[0]
            return d.resolve({
              uid: uid,
              email: result.email,
              emailCode: result.emailCode,
              verified: !!result.verified,
              kA: result.kA,
              wrapWrapKb: result.wrapWrapKb,
              verifyHash: result.verifyHash,
              authSalt: result.authSalt
            })
          }
        )
        return d.promise
      })
  }

  // UPDATE

  MySql.prototype.updatePasswordForgotToken = function (passwordForgotToken) {
    log.trace({ op: 'MySql.udatePasswordForgotToken', uid: passwordForgotToken && passwordForgotToken.uid })
    var sql = 'UPDATE passwordForgotTokens SET tries = ? WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [passwordForgotToken.tries, passwordForgotToken.tokenid],
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
        var tables = ['sessionTokens', 'keyfetchTokens', 'authTokens', 'srpTokens',
                      'resetTokens', 'passwordForgotTokens', 'accounts']
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

  MySql.prototype.deleteSessionToken = function (sessionToken) {
    log.trace(
      {
        op: 'MySql.deleteSessionToken',
        id: sessionToken && sessionToken.tokenid,
        uid: sessionToken && sessionToken.uid
      }
    )
    var sql = 'DELETE FROM sessionTokens WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [sessionToken.tokenid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    log.trace(
      {
        op: 'MySql.deleteKeyFetchToken',
        id: keyFetchToken && keyFetchToken.tokenid,
        uid: keyFetchToken && keyFetchToken.uid
      }
    )
    var sql = 'DELETE FROM keyfetchTokens WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [keyFetchToken.tokenid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.deleteAccountResetToken = function (accountResetToken) {
    log.trace(
      {
        op: 'MySql.deleteAccountResetToken',
        id: accountResetToken && accountResetToken.tokenid,
        uid: accountResetToken && accountResetToken.uid
      }
    )
    var sql = 'DELETE FROM resetTokens WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [accountResetToken.tokenid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.deleteAuthToken = function (authToken) {
    log.trace(
      {
        op: 'MySql.deleteAuthToken',
        id: authToken && authToken.tokenid,
        uid: authToken && authToken.uid
      }
    )
    var sql = 'DELETE FROM authTokens WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [authToken.tokenid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.deleteSrpToken = function (srpToken) {
    log.trace(
      {
        op: 'MySql.deleteSrpToken',
        id: srpToken && srpToken.tokenid,
        uid: srpToken && srpToken.uid
      }
    )
    var sql = 'DELETE FROM srpTokens WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [srpToken.tokenid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.deletePasswordForgotToken = function (passwordForgotToken) {
    log.trace(
      {
        op: 'MySql.deletePasswordForgotToken',
        id: passwordForgotToken && passwordForgotToken.tokenid,
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )
    var sql = 'DELETE FROM passwordForgotTokens WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [passwordForgotToken.tokenid],
          function (err) {
            con.release()
            if (err) return d.reject(err)
            d.resolve(true)
          }
        )
        return d.promise
      })
  }

  MySql.prototype.deletePasswordChangeToken = function (passwordChangeToken) {
    log.trace(
      {
        op: 'MySql.deletePasswordChangeToken',
        id: passwordChangeToken && passwordChangeToken.tokenid,
        uid: passwordChangeToken && passwordChangeToken.uid
      }
    )
    var sql = 'DELETE FROM passwordChangeToken WHERE tokenid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
          [passwordChangeToken.tokenid],
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

  MySql.prototype.resetAccount = function (accountResetToken, data) {
    log.trace({ op: 'MySql.resetAccount', uid: accountResetToken && accountResetToken.uid })
    var con
    return this.getMasterConnection()
      .then(function(newCon) {
        con = newCon
        return beginTransaction(con)
      })
      .then(function() {
        var tables = ['sessionTokens', 'keyfetchTokens', 'authTokens', 'srpTokens',
                      'resetTokens', 'passwordForgotTokens']
        var all = [];
        tables.forEach(function(tablename) {
          all.push(deleteFromTableUsingUid(con, tablename, accountResetToken.uid))
        })
        return P.all(all)
      })
      .then(function() {
        var d = P.defer()
        var sql = 'UPDATE accounts SET verifyHash = ?, authSalt = ?, wrapWrapKb = ? ' +
                  ' WHERE uid = ?'
        con.query(
          sql,
          [
            data.verifyHash,
            data.authSalt,
            data.wrapWrapKb,
            accountResetToken.uid,
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

  MySql.prototype.authFinish = function (srpToken) {
    log.trace({ op: 'MySql.authFinish', uid: srpToken && srpToken.uid })
    // Order of events:
    // (1) make an AuthToken
    // (2) get a connection
    // (3) start a transaction
    // (4) delete from srpTokens
    // (5) insert into authTokens
    // (6) commit transaction
    // (7) release connection
    // (8) resolve with the new authToken
    var con
    var authToken
    return this.getMasterConnection()
      .then(function(thisCon) {
        con = thisCon
        return beginTransaction(con)
      })
      .then(function() {
        return AuthToken.create(srpToken)
      })
      .then(function (newAuthToken) {
        authToken = newAuthToken
        var d = P.defer()
        con.query(
          'DELETE FROM srpTokens WHERE tokenid = ?',
          [srpToken.tokenid],
          function(err) {
            if (err) d.reject(err)
            d.resolve()
          }
        )
        return d.promise
      })
      .then(function() {
        var d = P.defer()
        con.query(
          'INSERT INTO authTokens(tokenid, tokendata, uid) VALUES (?, ?, ?)',
          [authToken.tokenid, authToken.data, authToken.uid],
          function(err) {
            if (err) d.reject(err)
            d.resolve(authToken)
          }
        )
        return d.promise
      })
      .then(function() {
          return commitTransaction(con).then(function() {
            con.release()
          })
      })
      .then(function() {
          return P(authToken)
      })
  }

  MySql.prototype.createSession = function (authToken) {
    log.trace({ op: 'MySql.createSession', uid: authToken && authToken.uid })
    var con
    return P.all(
      [
        KeyFetchToken.create(authToken),
        SessionToken.create(authToken)
      ]
    )
    .then(function (tokens) {
      var keyFetchToken = tokens[0]
      var sessionToken = tokens[1]

      return this.getMasterConnection()
        .then(function(thisCon) {
          con = thisCon
          return beginTransaction(con)
        })
        .then(function(thisCon) {
          var d = P.defer()
          con.query(
            'DELETE FROM authTokens WHERE tokenid = ?',
            [authToken.tokenid],
            function(err) {
              if (err) return d.reject(err)
              d.resolve()
            }
          )
          return d.promise
        })
        .then(function() {
          var d = P.defer()
          con.query(
            'INSERT INTO keyfetchTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
            [keyFetchToken.tokenid, keyFetchToken.data, keyFetchToken.uid],
            function(err) {
              if (err) return d.reject(err)
              d.resolve()
            }
          )
          return d.promise
        })
        .then(function() {
          var d = P.defer()
          con.query(
            'INSERT INTO sessionTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
            [sessionToken.tokenid, sessionToken.data, sessionToken.uid],
            function(err) {
              if (err) return d.reject(err)
              // now commit and release
              commitTransaction(con).then(function() {
                con.release()
                d.resolve({
                  keyFetchToken: keyFetchToken,
                  sessionToken: sessionToken
                })
              })
            }
          )
          return d.promise
        })
    }.bind(this))
  }

  MySql.prototype.verifyEmail = function (account) {
    log.trace({ op: 'MySql.verifyEmail', uid: account && account.uid })
    var sql = 'UPDATE accounts SET verified = true WHERE uid = ?'
    return this.getMasterConnection()
      .then(function(con) {
        var d = P.defer()
        con.query(
          sql,
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

  MySql.prototype.createPasswordChange = function (authToken) {
    log.trace({ op: 'MySql.createPasswordChange', uid: authToken && authToken.uid })
    var con
    return P.all(
      [
        KeyFetchToken.create(authToken),
        AccountResetToken.create(authToken)
      ]
    )
    .then(function (tokens) {
      var keyFetchToken = tokens[0]
      var accountResetToken = tokens[1]

      return this.getMasterConnection()
        .then(function(thisCon) {
          con = thisCon
          return beginTransaction(con)
        })
        .then(function(thisCon) {
          var d = P.defer()
          con.query(
            'DELETE FROM authTokens WHERE tokenid = ?',
            [authToken.tokenid],
            function(err) {
              if (err) return d.reject(err)
              d.resolve()
            }
          )
          return d.promise
        })
        .then(function() {
          var d = P.defer()
          con.query(
            'INSERT INTO keyfetchTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
            [keyFetchToken.tokenid, keyFetchToken.data, keyFetchToken.uid],
            function(err) {
              if (err) return d.reject(err)
              d.resolve()
            }
          )
          return d.promise
        })
        .then(function() {
          var d = P.defer()
          con.query(
            'REPLACE INTO resetTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
            [accountResetToken.tokenid, accountResetToken.data, accountResetToken.uid],
            function(err) {
              if (err) return d.reject(err)
              d.resolve()
            }
          )
          return d.promise
        })
        .then(function() {
            return commitTransaction(con)
        })
        .then(function() {
          con.release()
          return P({
            keyFetchToken: keyFetchToken,
            accountResetToken: accountResetToken
          })
        })
    }.bind(this))
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
          'DELETE FROM passwordForgotTokens WHERE tokenid = ?',
          [passwordForgotToken.tokenid],
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
          'REPLACE INTO resetTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
          [accountResetToken.tokenid, accountResetToken.data, accountResetToken.uid],
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
          })
      })
      .then(function() {
          return P(accountResetToken)
      })
  }

  // helper functions
  MySql.prototype.getMasterConnection = function() {
    var d = P.defer()
    this.poolCluster.getConnection('MASTER', function(err, connection) {
      if (err) return d.reject(err)
      d.resolve(connection)
    })
    return d.promise
  }

  // helper functions
  MySql.prototype.getSlaveConnection = function() {
    var d = P.defer()
    this.poolCluster.getConnection('SLAVE*', function(err, connection) {
      if (err) return d.reject(err)
      d.resolve(connection)
    })
    return d.promise
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
