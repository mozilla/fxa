/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var mysql = require('./mysql_wrapper')

module.exports = function (
  config,
  log,
  error,
  AuthToken,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  SrpToken,
  ForgotPasswordToken
  ) {

  var schema = ''

  function MySql(options) {
    this.client = mysql.createClient(options)
  }

  function saveTo(collection) {
    return function (object) {
      collection[object.id] = object
      return object
    }
  }

  // The lazy way
  function deleteUid(uid, collection) {
    var keys = Object.keys(collection)
    for (var i = 0; i < keys.length; i++) {
      if (collection[keys[i]].uid === uid) {
        delete collection[keys[i]]
      }
    }
  }

  // Don't look at me
  function createSchema(options) {
    var d = P.defer()
    var dbname = options.database
    delete options.database
    var client = mysql.createClient(options)
    client.query(
      'CREATE DATABASE IF NOT EXISTS ' + dbname,
      function (err) {
        if (err) return d.reject(err)
        client.useDatabase(
          dbname,
          function (err) {
            if (err) return d.reject(err)
            client.query(
              schema,
              function (err) {
                if (err) return d.reject(err)
                client.end(
                  function (err) {
                    log.error({ op: 'MySql.createSchemaEnd', err: err.message })
                  }
                )
                options.database = dbname
                return d.resolve(new MySql(options))
              }
            )
          }
        )
      }
    )
    return d.promise
  }

  MySql.connect = function () {
    var options = config
    if (options.create_schema) {
      return createSchema(options)
    }
    return P(new MySql(options))
  }


  MySql.prototype.ping = function () {
    var d = P.defer()
    this.client.ping(
      function (err) {
        return err ? d.reject(err) : d.resolve(true)
      }
    )
    return d.promise
  }

  // CREATE

  MySql.prototype.createAccount = function (data) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.createAccount',
        uid: data && data.uid,
        email: data && data.email
      }
    )
    var sql = 'INSERT INTO accounts (uid, email, emailCode, verified, srp, kA, wrapKb, passwordStretching) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    this.client.query(
      sql,
      [
        data.uid,
        data.email,
        data.emailCode,
        data.verified,
        JSON.stringify(data.srp),
        data.kA,
        data.wrapKb,
        JSON.stringify(data.passwordStretching)
      ],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(data)
      }
    )
    return d.promise
  }

  MySql.prototype.createSessionToken = function (authToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createSessionToken', uid: authToken && authToken.uid })
    var sql = 'INSERT INTO sessionTokens (id, uid, data) VALUES (?, ?, ?)'
    SessionToken.create(authToken.uid)
      .then(
        function (sessionToken) {
          this.client.query(
            sql,
            [sessionToken.id, sessionToken.uid, sessionToken.data],
            function (err) {
              if (err) return d.reject(err)
              d.resolve(sessionToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createKeyFetchToken = function (authToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createKeyFetchToken', uid: authToken && authToken.uid })
    var sql = 'INSERT INTO keyFetchTokens (id, uid, data) VALUES (?, ?, ?)'
    KeyFetchToken.create(authToken.uid)
      .then(
        function (keyFetchToken) {
          this.client.query(
            sql,
            [keyFetchToken.id, keyFetchToken.uid, keyFetchToken.data],
            function (err) {
              if (err) return d.reject(err)
              d.resolve(keyFetchToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createAccountResetToken = function (token /* authToken|forgotPasswordToken */) {
    var d = P.defer()
    log.trace({ op: 'MySql.createAccountResetToken', uid: token && token.uid })
    var sql = 'REPLACE INTO accountResetTokens (id, uid, data) VALUES (?, ?, ?)'
  }

  MySql.prototype.createAuthToken = function (srpToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createAuthToken', uid: srpToken && srpToken.uid })
    var sql = 'INSERT INTO authTokens (id, uid, data) VALUES (?, ?, ?)'
    AuthToken.create(srpToken.uid)
      .then(
        function (authToken) {
          this.client.query(
            sql,
            [authToken.id, authToken.uid, authToken.data],
            function (err) {
              if (err) return d.reject(err)
              d.resolve(authToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createSrpToken = function (emailRecord) {
    var d = P.defer()
    log.trace({ op: 'MySql.createSrpToken', uid: emailRecord && emailRecord.uid })
    var sql = 'INSERT INTO srpTokens (id, uid, s, v, b) VALUES (?, ?, ?, ?, ?)'
    SrpToken.create(emailRecord)
      .then(
        function (srpToken) {
          this.client.query(
            sql,
            [srpToken.id, srpToken.uid, srpToken.s, srpToken.v, srpToken.b],
            function (err) {
              if (err) return d.reject(err)
              d.resolve(srpToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createForgotPasswordToken = function (emailRecord) {
    var d = P.defer()
    log.trace({ op: 'MySql.createForgotPasswordToken', uid: emailRecord && emailRecord.uid })
    var sql = 'REPLACE INTO forgotPasswordTokens (id, uid, data, email, passcode, created, tries) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ForgotPasswordToken.create(emailRecord.uid, emailRecord.email)
      .then(
        function (forgotPasswordToken) {
          this.client.query(
            sql,
            [
              forgotPasswordToken.id,
              forgotPasswordToken.uid,
              forgotPasswordToken.data,
              forgotPasswordToken.email,
              forgotPasswordToken.passcode,
              forgotPasswordToken.created,
              forgotPasswordToken.tries
            ],
            function (err) {
              if (err) return d.reject(err)
              d.resolve(forgotPasswordToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  // READ

  MySql.prototype.accountExists = function (email) {
    var d = P.defer()
    log.trace({ op: 'MySql.accountExists', email: email })
    var sql = 'SELECT uid FROM accounts WHERE email = ?'
    this.client.query(
      sql,
      [email],
      function (err, results) {
        if (err) return d.reject(err)
        d.resolve(!!results.length)
      }
    )
    return d.promise
  }

  MySql.prototype.accountDevices = function (uid) {
    var d = P.defer()
    log.trace({ op: 'MySql.accountDevices', uid: uid })
    var sql = 'SELECT id FROM sessionTokens WHERE uid = ?'
    this.client.query(
      sql,
      [uid],
      function (err, results) {
        if (err) return d.reject(err)
        d.resolve(results)
      }
    )
    return d.promise
  }

  MySql.prototype.sessionToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.sessionToken', id: id })
    var sql = 'SELECT t.data AS data, t.uid AS uid, a.verified AS verified, a.email AS email, a.emailcode AS emailcode FROM sessionTokens t, accounts a WHERE t.id = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        SessionToken.fromHex(result.data)
          .done(
            function (sessionToken) {
              sessionToken.uid = result.uid
              sessionToken.verified = result.verified
              sessionToken.email = result.email
              sessionToken.emailCode = result.emailcode
              return d.resolve(sessionToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.keyFetchToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.keyFetchToken', id: id })
    var sql = 'SELECT t.data AS data, t.uid AS uid, a.verified AS verified, a.kA AS ka, a.wrapKb AS wrapkb FROM keyfetch_tokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        KeyFetchToken.fromHex(result.data)
          .done(
            function (keyFetchToken) {
              keyFetchToken.uid = result.uid
              keyFetchToken.kA = result.ka
              keyFetchToken.wrapKb = result.wrapkb
              keyFetchToken.verified = result.verified
              return d.resolve(keyFetchToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.accountResetToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.accountResetToken', id: id })
    var sql = 'SELECT uid, data FROM accountResetTokens WHERE id = ?'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        AccountResetToken.fromHex(result.data)
          .done(
            function (accountResetToken) {
              accountResetToken.uid = result.uid
              return d.resolve(accountResetToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.authToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.authToken', id: id })
    var sql = 'SELECT uid, data FROM authTokens WHERE id = ?'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        AuthToken.fromHex(result.data)
          .done(
            function (authToken) {
              authToken.uid = result.uid
              return d.resolve(authToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.srpToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.srpToken', id: id })
    var sql = 'SELECT uid, bits, s, v, b FROM srpTokens WHERE id = ?'
    // TODO merge srp 0.2 first
    return d.promise
  }

  MySql.prototype.forgotPasswordToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.forgotPasswordToken', id: id })
    var sql = 'SELECT uid, data, email, passcode, created, tries FROM forgotPasswordTokens WHERE id = ?'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        ForgotPasswordToken.fromHex(result.data)
          .done(
            function (forgotPasswordToken) {
              forgotPasswordToken.uid = result.uid
              forgotPasswordToken.email = result.email
              forgotPasswordToken.passcode = result.passcode
              forgotPasswordToken.created = result.created
              forgotPasswordToken.tries = result.tries
              return d.resolve(forgotPasswordToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.emailRecord = function (email) { // TODO authdata
    var d = P.defer()
    log.trace({ op: 'MySql.emailRecord', email: email })
    var sql = 'SELECT uid, srp, passwordStretching FROM accounts WHERE email = ?'
    this.client.query(
      sql,
      [email],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        return d.resolve({
          uid: result.uid,
          srp: JSON.parse(result.srp),
          passwordStretching: JSON.parse(result.passwordStretching)
        })
      }
    )
    return d.promise
  }

  MySql.prototype.account = function (uid) {
    var d = P.defer()
    log.trace({ op: 'MySql.account', uid: uid })
    var sql = 'SELECT email, emailCode, verified, srp, kA, wrapKb, passwordStretching FROM accounts WHERE uid = ?'
    this.client.query(
      sql,
      [uid],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        return d.resolve({
          uid: uid,
          email: result.email,
          emailCode: result.emailcode,
          verified: result.verified,
          kA: result.ka,
          wrapKb: result.wrapkb,
          srp: JSON.parse(result.srp),
          passwordStretching: JSON.parse(result.passwordstretching)
        })
      }
    )
    return d.promise
  }

  // UPDATE

  MySql.prototype.updateForgotPasswordToken = function (forgotPasswordToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.udateForgotPasswordToken', uid: forgotPasswordToken && forgotPasswordToken.uid })
    var sql = 'UPDATE forgotPasswordTokens SET tries = ? WHERE id = ?'
    this.client.query(
      sql,
      [forgotPasswordToken.tries, id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  // DELETE

  MySql.prototype.deleteAccount = function (authToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.deleteAccount', uid: authToken && authToken.uid })
    var sql = 'BEGIN TRANSACTION\n' +
      'DELETE FROM sessionTokens WHERE uid = ?\n' +
      'DELETE FROM keyFetchTokens WHERE uid = ?\n' +
      'DELETE FROM authTokens WHERE uid = ?\n' +
      'DELETE FROM srpTokens WHERE uid = ?\n' +
      'DELETE FROM accountResetTokens WHERE uid = ?\n' +
      'DELETE FROM forgotPasswordTokens WHERE uid = ?\n' +
      'DELETE FROM accounts WHERE uid = ?\n' +
      'COMMIT'
    this.client.query(
      sql,
      [authToken.uid], //TODO ??
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.deleteSessionToken = function (sessionToken) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.deleteSessionToken',
        id: sessionToken && sessionToken.id,
        uid: sessionToken && sessionToken.uid
      }
    )
    var sql = 'DELETE FROM sessionTokens WHERE id = ?'
    this.client.query(
      sql,
      [sessionToken.id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.deleteKeyFetchToken',
        id: keyFetchToken && keyFetchToken.id,
        uid: keyFetchToken && keyFetchToken.uid
      }
    )
    var sql = 'DELETE FROM keyFetchTokens WHERE id = ?'
    this.client.query(
      sql,
      [keyFetchToken.id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.deleteAccountResetToken = function (accountResetToken) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.deleteAccountResetToken',
        id: accountResetToken && accountResetToken.id,
        uid: accountResetToken && accountResetToken.uid
      }
    )
    var sql = 'DELETE FROM accountResetTokens WHERE id = ?'
    this.client.query(
      sql,
      [accountResetToken.id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.deleteAuthToken = function (authToken) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.deleteAuthToken',
        id: authToken && authToken.id,
        uid: authToken && authToken.uid
      }
    )
    var sql = 'DELETE FROM authTokens WHERE id = ?'
    this.client.query(
      sql,
      [authToken.id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.deleteSrpToken = function (srpToken) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.deleteSrpToken',
        id: srpToken && srpToken.id,
        uid: srpToken && srpToken.uid
      }
    )
    var sql = 'DELETE FROM srpTokens WHERE id = ?'
    this.client.query(
      sql,
      [srpToken.id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.deleteForgotPasswordToken = function (forgotPasswordToken) {
    var d = P.defer()
    log.trace(
      {
        op: 'MySql.deleteForgotPasswordToken',
        id: forgotPasswordToken && forgotPasswordToken.id,
        uid: forgotPasswordToken && forgotPasswordToken.uid
      }
    )
    var sql = 'DELETE FROM forgotPasswordTokens WHERE id = ?'
    this.client.query(
      sql,
      [forgotPasswordToken.id],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  // BATCH

  MySql.prototype.resetAccount = function (accountResetToken, data) {
    var d = P.defer()
    log.trace({ op: 'MySql.resetAccount', uid: accountResetToken && accountResetToken.uid })
    // TODO if wrapKb not changed
    var sql = 'BEGIN TRANSACTION\n' +
      'UPDATE accounts SET srp = ?, wrapKb = ?, passwordStretching = ? WHERE uid = ?\n' +
      'DELETE FROM sessionTokens WHERE uid = ?\n' +
      // ...
      'COMMIT'
    this.client.query(
      sql,
      [
        JSON.stringify(data.srp),
        data.wrapKb,
        JSON.stringify(data.passwordStretching),
        accountResetToken.uid,
      ],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.authFinish = function (srpToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.authFinish', uid: srpToken && srpToken.uid })
    var sql = 'BEGIN TRANSACTION\n' +
      'DELETE FROM srpTokens WHERE id = ?\n' +
      'INSERT INTO authTokens (id, uid, data) VALUES (?, ?, ?)\n' +
      'COMMIT'
    AuthToken.create(srpToken.uid)
      .then(
        function (authToken) {
          this.client.query(
            sql,
            [srpToken.id, authToken.id, authToken.uid, authToken.data], // TODO
            function (err) {
              if (err) return d.reject(err)
              d.resolve(authToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createSession = function (authToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createSession', uid: authToken && authToken.uid })
    var sql = 'BEGIN TRANSACTION\n' +
      'DELETE FROM authTokens WHERE id = ?\n' +
      'INSERT INTO keyFetchTokens (id, uid, data) VALUES (?, ?, ?)\n' +
      'INSERT INTO sessionTokens (id, uid, data) VALUES (?, ?, ?)\n' +
      'COMMIT'
    P.all(
      [
        KeyFetchToken.create(authToken.uid),
        SessionToken.create(authToken.uid)
      ]
    )
    .then(
      function (tokens) {
        var keyFetchToken = tokens[0]
        var sessionToken = tokens[1]

        this.client.query(
          sql,
          [
            authToken.id,
            keyFetchToken.id,
            keyFetchToken.uid,
            keyFetchToken.data,
            sessionToken.id,
            sessionToken.uid,
            sessionToken.data
          ], //TODO
          function (err) {
            if (err) return d.reject(err)
            d.resolve({
              keyFetchToken: keyFetchToken,
              sessionToken: sessionToken
            })
          }
        )
      }.bind(this)
    )
    return d.promise
  }

  MySql.prototype.verifyEmail = function (account) {
    var d = P.defer()
    log.trace({ op: 'MySql.verifyEmail', uid: account && account.uid })
    var sql = 'UPDATE accounts SET verified = true WHERE uid = ?'
    this.client.query(
      sql,
      [account.uid],
      function (err) {
        if (err) return d.reject(err)
        d.resolve(true)
      }
    )
    return d.promise
  }

  MySql.prototype.createPasswordChange = function (authToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createPasswordChange', uid: authToken && authToken.uid })
    var sql = 'BEGIN TRANSACTION\n' +
      'DELETE FROM authTokens WHERE id = ?\n' +
      'INSERT INTO keyFetchTokens (id, uid, data) VALUES (?, ?, ?)\n' +
      'REPLACE INTO accountResetTokens (id, uid, data) VALUES (?, ?, ?)\n' +
      'COMMIT'
    P.all(
      [
        KeyFetchToken.create(authToken.uid),
        AccountResetToken.create(authToken.uid)
      ]
    )
    .then(
      function (tokens) {
        var keyFetchToken = tokens[0]
        var accountResetToken = tokens[1]

        this.client.query(
          sql,
          [
            authToken.id,
            keyFetchToken.id,
            keyFetchToken.uid,
            keyFetchToken.data,
            accountResetToken.id,
            accountResetToken.uid,
            accountResetToken.data
          ], //TODO
          function (err) {
            if (err) return d.reject(err)
            d.resolve({
              keyFetchToken: keyFetchToken,
              accountResetToken: accountResetToken
            })
          }
        )
      }.bind(this)
    )
    return d.promise
  }

  MySql.prototype.forgotPasswordVerified = function (forgotPasswordToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.forgotPasswordVerified', uid: forgotPasswordToken && forgotPasswordToken.uid })
    var sql = 'BEGIN TRANSACTION\n' +
      'DELETE FROM forgotPasswordTokens WHERE id = ?\n' +
      'REPLACE INTO accountResetTokens (id, uid, data) VALUES (?, ?, ?)\n' +
      'COMMIT'
    AccountResetToken.create(forgotPasswordToken.uid)
      .then(
        function (accountResetToken) {
          this.client.query(
          sql,
          [
            forgotPasswordToken.id,
            accountResetToken.id,
            accountResetToken.uid,
            accountResetToken.data
          ],
          function (err) {
            if (err) return d.reject(err)
            d.resolve(accountResetToken)
          }
        )
        }.bind(this)
      )
    return d.promise
  }

  return MySql
}
