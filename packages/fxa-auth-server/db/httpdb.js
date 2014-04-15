/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('../requestp')

var butil = require('../crypto/butil')
var unbuffer = butil.unbuffer
var bufferize = butil.bufferize

module.exports = function (
  P,
  log,
  error,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  PasswordForgotToken,
  PasswordChangeToken) {

  function DB(options) {
    this.url = options.url
  }

  DB.connect = function (options) {
    var db = new DB(options)

    return request(
      {
        method: 'GET',
        url: db.url,
        json: true
      }
    )
    .then(
      function (api) {
        // TODO: transition to api version
        // patchLevel is mysql specific
        if (
          api.patchLevel < options.patchLevel ||
          api.patchLevel > options.patchLevel + 1
        ) {
          throw error.dbIncorrectPatchLevel(api.patchLevel, options.patchLevel)
        }
        return db
      }
    )
  }

  DB.prototype.close = function () {
    return P()
  }

  DB.prototype.ping = function () {
    return request(this.url + '/__heartbeat__')
  }

  // CREATE

  DB.prototype.createAccount = function (data) {
    log.trace(
      {
        op: 'DB.createAccount',
        uid: data && data.uid,
        email: data && data.email
      }
    )
    data.createdAt = data.verifierSetAt = Date.now()
    data.normalizedEmail = data.email.toLowerCase()
    return request(
      {
        method: 'PUT',
        url: this.url + '/account/' + data.uid.toString('hex'),
        json: unbuffer(data)
      }
    )
    .then(
      function () {
        return data
      },
      function (err) {
        if (err.statusCode === 409) {
          err = error.accountExists(data.email)
        }
        throw err
      }
    )
  }

  DB.prototype.createSessionToken = function (authToken) {
    log.trace({ op: 'DB.createSessionToken', uid: authToken && authToken.uid })
    return SessionToken.create(authToken)
      .then(
        function (sessionToken) {
          return request(
            {
              method: 'PUT',
              url: this.url + '/sessionToken/' + sessionToken.id,
              json: unbuffer(
                {
                  tokenId: sessionToken.tokenId,
                  data: sessionToken.data,
                  uid: sessionToken.uid,
                  createdAt: sessionToken.createdAt
                },
                'inplace'
              )
            }
          )
          .then(
            function () {
              return sessionToken
            }
          )
        }.bind(this)
      )
  }

  DB.prototype.createKeyFetchToken = function (authToken) {
    log.trace({ op: 'DB.createKeyFetchToken', uid: authToken && authToken.uid })
    return KeyFetchToken.create(authToken)
      .then(
        function (keyFetchToken) {
          return request(
            {
              method: 'PUT',
              url: this.url + '/keyFetchToken/' + keyFetchToken.id,
              json: unbuffer(
                {
                  tokenId: keyFetchToken.tokenId,
                  authKey: keyFetchToken.authKey,
                  uid: keyFetchToken.uid,
                  keyBundle: keyFetchToken.keyBundle,
                  createdAt: keyFetchToken.createdAt
                },
                'inplace'
              )
            }
          )
          .then(
            function () {
              return keyFetchToken
            }
          )
        }.bind(this)
      )
  }

  DB.prototype.createAccountResetToken = function (token /* authToken|passwordForgotToken */) {
    log.trace({ op: 'DB.createAccountResetToken', uid: token && token.uid })
    return AccountResetToken.create(token)
      .then(
        function (accountResetToken) {
          return request(
            {
              method: 'PUT',
              url: this.url + '/accountResetToken/' + accountResetToken.id,
              json: unbuffer(
                {
                  tokenId: accountResetToken.tokenId,
                  data: accountResetToken.data,
                  uid: accountResetToken.uid,
                  createdAt: accountResetToken.createdAt
                },
                'inplace'
              )
            }
          )
          .then(
            function () {
              return accountResetToken
            }
          )
        }.bind(this)
      )
  }

  DB.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace({ op: 'DB.createPasswordForgotToken', uid: emailRecord && emailRecord.uid })
    return PasswordForgotToken.create(emailRecord)
      .then(
        function (passwordForgotToken) {
          return request(
            {
              method: 'PUT',
              url: this.url + '/passwordForgotToken/' + passwordForgotToken.id,
              json: unbuffer(
                {
                  tokenId: passwordForgotToken.tokenId,
                  data: passwordForgotToken.data,
                  uid: passwordForgotToken.uid,
                  passCode: passwordForgotToken.passCode,
                  createdAt: passwordForgotToken.createdAt,
                  tries: passwordForgotToken.tries
                },
                'inplace'
              )
            }
          )
          .then(
            function () {
              return passwordForgotToken
            }
          )
        }.bind(this)
      )
  }

  DB.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'DB.createPasswordChangeToken', uid: data.uid })
    return PasswordChangeToken.create(data)
      .then(
        function (passwordChangeToken) {
          return request(
            {
              method: 'PUT',
              url: this.url + '/passwordChangeToken/' + passwordChangeToken.id,
              json: unbuffer(
                {
                  tokenId: passwordChangeToken.tokenId,
                  data: passwordChangeToken.data,
                  uid: passwordChangeToken.uid,
                  createdAt: passwordChangeToken.createdAt
                },
                'inplace'
              )
            }
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

  DB.prototype.accountExists = function (email) {
    log.trace({ op: 'DB.accountExists', email: email })
    return request(
      {
        method: 'HEAD',
        url: this.url + '/emailRecord/' + Buffer(email, 'utf8').toString('hex'),
        json: true
      }
    )
    .then(
      function () {
        return true
      },
      function (err) {
        if (err.statusCode === 404) {
          return false
        }
        throw err
      }
    )
  }

  DB.prototype.accountDevices = function (uid) {
    log.trace({ op: 'DB.accountDevices', uid: uid })
    return request(
      {
        method: 'GET',
        url: this.url + '/account/' + uid.toString('hex') + '/devices',
        json: true
      }
    )
  }

  DB.prototype.sessionToken = function (id) {
    log.trace({ op: 'DB.sessionToken', id: id })
    return request(
      {
        method: 'GET',
        url: this.url + '/sessionToken/' + id.toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        return SessionToken.fromHex(data.tokenData, data)
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.invalidToken()
        }
        throw err
      }
    )
  }

  DB.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'DB.keyFetchToken', id: id })
    return request(
      {
        method: 'GET',
        url: this.url + '/keyFetchToken/' + id.toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        return KeyFetchToken.fromId(id, data)
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.invalidToken()
        }
        throw err
      }
    )
  }

  DB.prototype.accountResetToken = function (id) {
    log.trace({ op: 'DB.accountResetToken', id: id })
    return request(
      {
        method: 'GET',
        url: this.url + '/accountResetToken/' + id.toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        return AccountResetToken.fromHex(data.tokenData, data)
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.invalidToken()
        }
        throw err
      }
    )
  }

  DB.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'DB.passwordForgotToken', id: id })
    return request(
      {
        method: 'GET',
        url: this.url + '/passwordForgotToken/' + id.toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        return PasswordForgotToken.fromHex(data.tokenData, data)
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.invalidToken()
        }
        throw err
      }
    )
  }

  DB.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'DB.passwordChangeToken', id: id })
    return request(
      {
        method: 'GET',
        url: this.url + '/passwordChangeToken/' + id.toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        return PasswordChangeToken.fromHex(data.tokenData, data)
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.invalidToken()
        }
        throw err
      }
    )
  }

  DB.prototype.emailRecord = function (email) {
    log.trace({ op: 'DB.emailRecord', email: email })
    return request(
      {
        method: 'GET',
        url: this.url + '/emailRecord/' + Buffer(email, 'utf8').toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        data.emailVerified = !!data.emailVerified
        return data
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.unknownAccount(email)
        }
        throw err
      }
    )
  }

  DB.prototype.account = function (uid) {
    log.trace({ op: 'DB.account', uid: uid })
    return request(
      {
        method: 'GET',
        url: this.url + '/account/' + uid.toString('hex'),
        json: true
      }
    )
    .then(
      function (body) {
        var data = bufferize(body)
        data.emailVerified = !!data.emailVerified
        return data
      },
      function (err) {
        if (err.statusCode === 404) {
          err = error.unknownAccount()
        }
        throw err
      }
    )
  }

  // UPDATE

  DB.prototype.updatePasswordForgotToken = function (token) {
    log.trace({ op: 'DB.udatePasswordForgotToken', uid: token && token.uid })
    return request(
      {
        method: 'POST',
        url: this.url + '/passwordForgotToken/' + token.id + '/update',
        json: {
          tries: token.tries
        }
      }
    )
  }

  // DELETE

  DB.prototype.deleteAccount = function (authToken) {
    log.trace({ op: 'DB.deleteAccount', uid: authToken && authToken.uid })
    return request(
      {
        method: 'DELETE',
        url: this.url + '/account/' + authToken.uid.toString('hex'),
        json: true
      }
    )
  }

  DB.prototype.deleteSessionToken = function (sessionToken) {
    log.trace(
      {
        op: 'DB.deleteSessionToken',
        id: sessionToken && sessionToken.id,
        uid: sessionToken && sessionToken.uid
      }
    )
    return request(
      {
        method: 'DELETE',
        url: this.url + '/sessionToken/' + sessionToken.id,
        json: true
      }
    )
  }

  DB.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    log.trace(
      {
        op: 'DB.deleteKeyFetchToken',
        id: keyFetchToken && keyFetchToken.id,
        uid: keyFetchToken && keyFetchToken.uid
      }
    )
    return request(
      {
        method: 'DELETE',
        url: this.url + '/keyFetchToken/' + keyFetchToken.id,
        json: true
      }
    )
  }

  DB.prototype.deleteAccountResetToken = function (accountResetToken) {
    log.trace(
      {
        op: 'DB.deleteAccountResetToken',
        id: accountResetToken && accountResetToken.id,
        uid: accountResetToken && accountResetToken.uid
      }
    )
    return request(
      {
        method: 'DELETE',
        url: this.url + '/accountResetToken/' + accountResetToken.id,
        json: true
      }
    )
  }

  DB.prototype.deletePasswordForgotToken = function (passwordForgotToken) {
    log.trace(
      {
        op: 'DB.deletePasswordForgotToken',
        id: passwordForgotToken && passwordForgotToken.id,
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )
    return request(
      {
        method: 'DELETE',
        url: this.url + '/passwordForgotToken/' + passwordForgotToken.id,
        json: true
      }
    )
  }

  DB.prototype.deletePasswordChangeToken = function (passwordChangeToken) {
    log.trace(
      {
        op: 'DB.deletePasswordChangeToken',
        id: passwordChangeToken && passwordChangeToken.id,
        uid: passwordChangeToken && passwordChangeToken.uid
      }
    )
    return request(
      {
        method: 'DELETE',
        url: this.url + '/passwordChangeToken/' + passwordChangeToken.id,
        json: true
      }
    )
  }

  // BATCH

  DB.prototype.resetAccount = function (accountResetToken, data) {
    log.trace({ op: 'DB.resetAccount', uid: accountResetToken && accountResetToken.uid })
    return request(
      {
        method: 'POST',
        url: this.url + '/account/' + accountResetToken.uid.toString('hex') + '/reset',
        json: unbuffer(data)
      }
    )
  }

  DB.prototype.verifyEmail = function (account) {
    log.trace({ op: 'DB.verifyEmail', uid: account && account.uid })
    return request(
      {
        method: 'POST',
        url: this.url + '/account/' + account.uid.toString('hex') + '/verifyEmail',
        json: true
      }
    )
  }

  DB.prototype.forgotPasswordVerified = function (passwordForgotToken) {
    log.trace({ op: 'DB.forgotPasswordVerified', uid: passwordForgotToken && passwordForgotToken.uid })
    return AccountResetToken.create(passwordForgotToken)
      .then(
        function (accountResetToken) {
          return request(
            {
              method: 'POST',
              url: this.url + '/passwordForgotToken/' + passwordForgotToken.id + '/verified',
              json: unbuffer(
                {
                  tokenId: accountResetToken.tokenId,
                  data: accountResetToken.data,
                  uid: accountResetToken.uid,
                  createdAt: accountResetToken.createdAt
                },
                'inplace'
              )
            }
          )
          .then(
            function () {
              return accountResetToken
            }
          )
        }.bind(this)
      )
  }

  return DB
}
