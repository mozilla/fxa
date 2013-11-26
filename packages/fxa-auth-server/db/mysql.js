/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var mysql = require('mysql');
var schema = require('fs').readFileSync(__dirname + '/schema.sql', { encoding: 'utf8'})

function uuidToBuffer(uuid) {
  return new Buffer(uuid.replace(/-/g, ''), 'hex');
}

function bufferToUuid(buf) {
  var str = buf.toString('hex');
  var uuid = str.slice(0, 8) + '-' + str.slice(8, 12) + '-' + str.slice(12, 16) + '-' + str.slice(16, 20) + '-' + str.slice(20, 32);
  return uuid;
}

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

  function MySql(options) {
    this.client = mysql.createConnection(options)
  }

  // Don't look at me
  function createSchema(options) {
    var d = P.defer()
    var dbname = options.database
    delete options.database
    options.multipleStatements = true
    var client = mysql.createConnection(options)
    client.query(
      'CREATE DATABASE IF NOT EXISTS ' + dbname,
      function (err) {
        if (err) return d.reject(err)
        client.changeUser(
          {
            user     : options.user,
            password : options.password,
            database : dbname,
          },
          function (err) {
            if (err) return d.reject(err)
            client.query(
              schema,
              function (err) {
                if (err) return d.reject(err)
                client.end(
                  function (err) {
                    if (err) {
                      log.error({ op: 'MySql.createSchemaEnd', err: err.message })
                    }
                  }
                )
                options.database = dbname
                options.multipleStatements = false

                // create the mysql class
                var mysql = new MySql(options)
                mysql.client.connect(function(err) {
                  if (err) return d.reject(err)
                  d.resolve(mysql)
                })
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

    var d = P.defer()
    var mysql = new MySql(options)
    mysql.connect(function(err) {
      if (err) return d.reject(err)
      d.resolve(mysql)
    })
    return d.promise
  }

  MySql.prototype.close = function () {
    var d = P.defer()
    this.client.end(
      function () {
        // TODO no idea what this returns
        log.trace({ op: 'MySql.end', args: arguments })
        d.resolve(true)
      }
    )
    return d.promise
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
        uuidToBuffer(data.uid),
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
    var sql = 'INSERT INTO sessionTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    SessionToken.create(authToken)
      .then(
        function (sessionToken) {
          this.client.query(
            sql,
            [sessionToken.id, sessionToken.data, uuidToBuffer(sessionToken.uid)],
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
    var sql = 'INSERT INTO keyfetchTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    KeyFetchToken.create(authToken)
      .then(
        function (keyFetchToken) {
          this.client.query(
            sql,
            [keyFetchToken.id, keyFetchToken.data, uuidToBuffer(keyFetchToken.uid)],
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
    var sql = 'REPLACE INTO resetTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    AccountResetToken.create(token)
      .then(
        function (accountResetToken) {
          this.client.query(
            sql,
            [accountResetToken.id, accountResetToken.data, uuidToBuffer(accountResetToken.uid)],
            function (err) {
              if (err) return d.reject(err)
              d.resolve(accountResetToken)
            }
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createAuthToken = function (srpToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createAuthToken', uid: srpToken && srpToken.uid })
    var sql = 'INSERT INTO authTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    AuthToken.create(srpToken)
      .then(
        function (authToken) {
          this.client.query(
            sql,
            [authToken.id, authToken.data, uuidToBuffer(authToken.uid)],
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
    var sql = 'INSERT INTO srpTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)'
    SrpToken.create(emailRecord)
      .then(
        function (srpToken) {
          this.client.query(
            sql,
            [srpToken.id, srpToken.data, uuidToBuffer(srpToken.uid)],
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
    var sql = 'REPLACE INTO forgotpwdTokens (tokenid, tokendata, uid, passcode, created, tries) VALUES (?, ?, ?, ?, ?, ?)'
    ForgotPasswordToken.create(emailRecord)
      .then(
        function (forgotPasswordToken) {
          this.client.query(
            sql,
            [
              forgotPasswordToken.id,
              forgotPasswordToken.data,
              uuidToBuffer(forgotPasswordToken.uid),
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
    var sql = 'SELECT tokenid AS id FROM sessionTokens WHERE uid = ?'
    this.client.query(
      sql,
      [uuidToBuffer(uid)],
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
    var sql = 'SELECT t.tokendata, t.uid, a.verified, a.email, a.emailCode' +
              '  FROM sessionTokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        SessionToken.fromHex(result.tokendata, result)
          .done(
            function (sessionToken) {
              sessionToken.uid = bufferToUuid(sessionToken.uid)
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
    var sql = 'SELECT t.tokendata, t.uid, a.verified, a.kA, a.wrapKb ' +
              '  FROM keyfetchTokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        KeyFetchToken.fromHex(result.tokendata, result)
          .done(
            function (keyFetchToken) {
              keyFetchToken.uid = bufferToUuid(keyFetchToken.uid)
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
    var sql = 'SELECT uid, tokendata FROM resetTokens WHERE tokenid = ?'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        AccountResetToken.fromHex(result.tokendata, result)
          .done(
            function (accountResetToken) {
              accountResetToken.uid = bufferToUuid(accountResetToken.uid)
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
    var sql = 'SELECT t.uid, t.tokendata, a.verified' +
              '  FROM authTokens t, accounts a' +
              '  WHERE t.tokenid = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        AuthToken.fromHex(result.tokendata, result)
          .done(
            function (authToken) {
              authToken.uid = bufferToUuid(authToken.uid)
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
    var sql = 'SELECT t.tokendata, t.uid, a.srp, a.passwordStretching ' +
              '  FROM srpTokens t, accounts a ' +
              '  WHERE t.tokenid = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        result.srp = JSON.parse(result.srp)
        result.passwordStretching = JSON.parse(result.passwordStretching)
        SrpToken.fromHex(result.tokendata, result)
          .done(
            function (srpToken) {
              srpToken.uid = bufferToUuid(srpToken.uid)
              return d.resolve(srpToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.forgotPasswordToken = function (id) {
    var d = P.defer()
    log.trace({ op: 'MySql.forgotPasswordToken', id: id })
    var sql = 'SELECT t.tokendata, t.uid, a.email, t.passcode, t.created, t.tries  ' +
              ' FROM forgotpwdTokens t, accounts a WHERE t.tokenid = ? AND t.uid = a.uid'
    this.client.query(
      sql,
      [id],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.invalidToken())
        var result = results[0]
        ForgotPasswordToken.fromHex(result.tokendata, result)
          .done(
            function (forgotPasswordToken) {
              forgotPasswordToken.uid = bufferToUuid(forgotPasswordToken.uid)
              return d.resolve(forgotPasswordToken)
            }
          )
      }
    )
    return d.promise
  }

  MySql.prototype.emailRecord = function (email) {
    var d = P.defer()
    log.trace({ op: 'MySql.emailRecord', email: email })
    var sql = 'SELECT uid, verified, srp, passwordStretching FROM accounts WHERE email = ?'
    this.client.query(
      sql,
      [email],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.unknownAccount())
        var result = results[0]
        return d.resolve({
          uid: bufferToUuid(result.uid),
          email: email,
          verified: !!result.verified,
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
    var sql = 'SELECT email, emailCode, verified, srp, kA, wrapKb, passwordStretching ' +
              '  FROM accounts WHERE uid = ?'
    this.client.query(
      sql,
      [uuidToBuffer(uid)],
      function (err, results) {
        if (err) return d.reject(err)
        if (!results.length) return d.reject(error.unknownAccount())
        var result = results[0]
        return d.resolve({
          uid: uid,
          email: result.email,
          emailCode: result.emailCode,
          verified: !!result.verified,
          kA: result.kA,
          wrapKb: result.wrapKb,
          srp: JSON.parse(result.srp),
          passwordStretching: JSON.parse(result.passwordStretching)
        })
      }
    )
    return d.promise
  }

  // UPDATE

  MySql.prototype.updateForgotPasswordToken = function (forgotPasswordToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.udateForgotPasswordToken', uid: forgotPasswordToken && forgotPasswordToken.uid })
    var sql = 'UPDATE forgotpwdTokens SET tries = ? WHERE tokenid = ?'
    this.client.query(
      sql,
      [forgotPasswordToken.tries, forgotPasswordToken.id],
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
    d.resolve(true)
    d = d.promise
    log.trace({ op: 'MySql.deleteAccount', uid: authToken && authToken.uid })
    // TODO: transactions not working with our mysql driver.
    // For now we just delete in a safe, sensible order.
    var tables = ['sessionTokens', 'keyfetchTokens', 'authTokens', 'srpTokens',
                  'resetTokens', 'forgotpwdTokens', 'accounts']
    tables.forEach(function(table) {
      var sql = 'DELETE FROM ' + table + ' WHERE uid = ?'
      d = d.then(function() {
        var d2 = P.defer()
        this.client.query(
          sql,
          [uuidToBuffer(authToken.uid)],
          function (err) {
            if (err) return d2.reject(err)
            d2.resolve(true)
          }
        )
        return d2.promise
      }.bind(this))
    }.bind(this))
    return d
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
    var sql = 'DELETE FROM sessionTokens WHERE tokenid = ?'
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
    var sql = 'DELETE FROM keyfetchTokens WHERE tokenid = ?'
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
    var sql = 'DELETE FROM resetTokens WHERE tokenid = ?'
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
    var sql = 'DELETE FROM authTokens WHERE tokenid = ?'
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
    var sql = 'DELETE FROM srpTokens WHERE tokenid = ?'
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
    var sql = 'DELETE FROM forgotpwdTokens WHERE tokenid = ?'
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
    d.resolve(true)
    d = d.promise
    log.trace({ op: 'MySql.resetAccount', uid: accountResetToken && accountResetToken.uid })
    // TODO if wrapKb not changed
    // TODO: transactions not working with our mysql driver.
    // For now we just delete in a safe, sensible order.
    var tables = ['sessionTokens', 'keyfetchTokens', 'authTokens', 'srpTokens',
                  'resetTokens', 'forgotpwdTokens']
    tables.forEach(function(table) {
      var sql = 'DELETE FROM ' + table + ' WHERE uid = ?'
      d = d.then(function() {
        var d2 = P.defer()
        this.client.query(
          sql,
          [uuidToBuffer(accountResetToken.uid)],
          function (err) {
            if (err) return d2.reject(err)
            d2.resolve(true)
          }
        )
        return d2.promise
      }.bind(this))
    }.bind(this))
    // Once all state is reset, we can update the account.
    d = d.then(function() {
      var d2 = P.defer()
      var sql = 'UPDATE accounts SET srp = ?, wrapKb = ?, passwordStretching = ? ' +
                ' WHERE uid = ?'
      this.client.query(
        sql,
        [
          JSON.stringify(data.srp),
          data.wrapKb,
          JSON.stringify(data.passwordStretching),
          uuidToBuffer(accountResetToken.uid),
        ],
        function (err) {
          if (err) return d2.reject(err)
          d2.resolve(true)
        }
      )
      return d2.promise
    }.bind(this))
    return d
  }

  MySql.prototype.authFinish = function (srpToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.authFinish', uid: srpToken && srpToken.uid })
    // TODO: transactions not working with our mysql driver.
    // For now we just delete in a sensible order.
    AuthToken.create(srpToken)
      .then(
        function (authToken) {
          this.client.query(
            'DELETE FROM srpTokens WHERE tokenid = ?',
            [srpToken.id],
            function (err) {
              if (err) return d.reject(err)
              this.client.query(
                'INSERT INTO authTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
                [authToken.id, authToken.data, uuidToBuffer(authToken.uid)],
                function (err) {
                  if (err) return d.reject(err)
                  d.resolve(authToken)
                }
              )
            }.bind(this)
          )
        }.bind(this)
      )
    return d.promise
  }

  MySql.prototype.createSession = function (authToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.createSession', uid: authToken && authToken.uid })
    // TODO: transactions not working with nodejs driver.
    // For now, we just insert one after the other and hope for best. :-(
    P.all(
      [
        KeyFetchToken.create(authToken),
        SessionToken.create(authToken)
      ]
    )
    .then(
      function (tokens) {
        var keyFetchToken = tokens[0]
        var sessionToken = tokens[1]

        this.client.query(
          'DELETE FROM authTokens WHERE tokenid = ?',
          [authToken.id],
          function (err) {
            if (err) return d.reject(err)
            this.client.query(
              'INSERT INTO keyfetchTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
              [keyFetchToken.id, keyFetchToken.data, uuidToBuffer(keyFetchToken.uid)],
              function(err) {
                if (err) return d.reject(err)
                this.client.query(
                  'INSERT INTO sessionTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
                  [sessionToken.id, sessionToken.data, uuidToBuffer(sessionToken.uid)],
                  function(err) {
                    if (err) return d.reject(err)
                    d.resolve({
                      keyFetchToken: keyFetchToken,
                      sessionToken: sessionToken
                    })
                  }
                )
              }.bind(this)
            )
          }.bind(this)
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
      [uuidToBuffer(account.uid)],
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
    P.all(
      [
        KeyFetchToken.create(authToken),
        AccountResetToken.create(authToken)
      ]
    )
    .then(
      function (tokens) {
        var keyFetchToken = tokens[0]
        var accountResetToken = tokens[1]

        this.client.query(
          'DELETE FROM authTokens WHERE tokenid = ?',
          [authToken.id],
          function (err) {
            if (err) return d.reject(err)
            this.client.query(
              'INSERT INTO keyfetchTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
              [keyFetchToken.id, keyFetchToken.data, uuidToBuffer(keyFetchToken.uid)],
              function(err) {
                if (err) return d.reject(err)
                this.client.query(
                  'REPLACE INTO resetTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
                  [accountResetToken.id, accountResetToken.data, uuidToBuffer(accountResetToken.uid)],
                  function(err) {
                    if (err) return d.reject(err)
                    d.resolve({
                      keyFetchToken: keyFetchToken,
                      accountResetToken: accountResetToken
                    })
                  }
                )
              }.bind(this)
            )
          }.bind(this)
        )
      }.bind(this)
    )
    return d.promise
  }

  MySql.prototype.forgotPasswordVerified = function (forgotPasswordToken) {
    var d = P.defer()
    log.trace({ op: 'MySql.forgotPasswordVerified', uid: forgotPasswordToken && forgotPasswordToken.uid })
    AccountResetToken.create(forgotPasswordToken)
      .then(
        function (accountResetToken) {
          this.client.query(
          'DELETE FROM forgotpwdTokens WHERE tokenid = ?',
          [forgotPasswordToken.id],
          function (err) {
            if (err) return d.reject(err)
            this.client.query(
              'REPLACE INTO resetTokens (tokenid, tokendata, uid) VALUES (?, ?, ?)',
              [accountResetToken.id, accountResetToken.data, uuidToBuffer(accountResetToken.uid)],
              function (err) {
              if (err) return d.reject(err)
                d.resolve(accountResetToken)
              }
            )
          }.bind(this)
        )
        }.bind(this)
      )
    return d.promise
  }

  return MySql
}
