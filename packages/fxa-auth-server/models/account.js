/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (P, tokens, RecoveryEmail, db, config, error) {

  var domain = config.domain
  var SessionToken = tokens.SessionToken
  var AccountResetToken = tokens.AccountResetToken
  var AuthToken = tokens.AuthToken

  function Account() {
    this.uid = null
    this.email = null
    this.verified = false
    this.kA = null
    this.wrapKb = null
    this.srp = null
    this.passwordStretching = null
    // references
    this.authTokenId = null
    this.resetTokenId = null
    this.sessionTokenIds = null
    this.recoveryEmailCodes = null
  }

  Account.hydrate = function (object) {
    if (!object) return null
    if (object.value) object = object.value
    var a = new Account()
    a.uid = object.uid
    a.email = object.email
    a.verified = !!object.verified
    a.srp = object.srp
    a.kA = object.kA
    a.wrapKb = object.wrapKb
    a.passwordStretching = object.passwordStretching
    a.authTokenId = object.authTokenId
    a.resetTokenId = object.resetTokenId
    a.sessionTokenIds = object.sessionTokenIds || {}
    a.recoveryEmailCodes = object.recoveryEmailCodes || {}
    return a
  }

  Account.create = function (options) {
    return Account
      .exists(options.email)
      .then(
        function (exists) {
          if (exists) {
            throw error.accountExists(options.email)
          }
          var account = Account.hydrate(options)
          if (config.dev && config.dev.verified) {
            account.verified = true
          }
          return RecoveryEmail
            .create(account.uid, account.email, true, account.verified)
            .then(
              function (rm) {
                account.recoveryEmailCodes[rm.code] = true
              }
            )
            .then(
              function () {
                return account.save(true)
              }
            )
        }
      )
  }

  function deleteIndex(email) {
    return db.delete(email + '/uid')
  }

  function deleteRecord(uid) {
    return db.delete(uid + '/user')
  }

  Account.del = function (uid) {
    return Account
      .get(uid)
      .then(
        function (account) {
          return account ? account.del() : P(null)
        }
      )
  }

  Account.principal = function (uid) {
    return uid + '@' + domain
  }

  Account.getId = function (email) {
    return db
      .get(email + '/uid')
      .then(
        function (uid) {
          return uid ? uid.value : null
        }
      )
  }

  Account.exists = function (email) {
    return Account
      .getId(email)
      .then(
        function (uid) {
          return !!uid
        }
      )
  }

  Account.getByEmail = function (email) {
    return Account.getId(email).then(Account.get)
  }

  Account.get = function (uid) {
    return db
      .get(uid + '/user')
      .then(Account.hydrate)
  }

  Account.save = function (uid, value) {
    return db.set(uid + '/user', value).then(function () { return value })
  }

  Account.verify = function (recoveryEmail) {
    if (recoveryEmail.primary && recoveryEmail.verified) {
      return Account.get(recoveryEmail.uid)
        .then(
          function (account) {
            if (!account.verified && recoveryEmail.uid === account.uid) {
              account.verified = true
              return account.save()
            }
            else {
              return P(account)
            }
          }
        )
    }
    else {
      return Account.get(recoveryEmail.uid)
    }
  }

  Account.prototype.principal = function () {
    return Account.principal(this.uid)
  }

  Account.prototype.addSessionToken = function (token) {
    this.sessionTokenIds[token.id] = true
    return this.save()
  }

  Account.prototype.setResetToken = function (token) {
    var set = function () {
      this.resetTokenId = token.id
      return this.save()
    }.bind(this)
    if (this.resetTokenId !== null) {
      return AccountResetToken
        .del(this.resetTokenId)
        .then(set)
    }
    return set()
  }

  Account.prototype.setAuthToken = function (token) {
    var set = function () {
      this.authTokenId = token.id
      return this.save()
    }.bind(this)
    if (this.authTokenId !== null) {
      return AuthToken
        .del(this.authTokenId)
        .then(set)
    }
    return set()
  }

  Account.prototype.deleteSessionToken = function (id) {
    delete this.sessionTokenIds[id]
    return SessionToken.del(id)
      .then(this.save.bind(this))
  }

  Account.prototype.sessionTokens = function () {
    var ids = Object.keys(this.sessionTokenIds)
    var tokens = []
    for (var i = 0; i < ids.length; i++) {
      tokens.push(SessionToken.get(ids[i]))
    }
    return P.all(tokens)
  }

  Account.prototype.deleteAllTokens = function () {
    var ids = Object.keys(this.sessionTokenIds)
    var tokens = []
    for (var i = 0; i < ids.length; i++) {
      tokens.push(SessionToken.del(ids[i]))
    }
    tokens.push(AccountResetToken.del(this.resetTokenId))
    this.resetTokenId = null
    this.sessionTokenIds = {}
    return P.all(tokens)
  }

  Account.prototype.addRecoveryEmail = function (rm) {
    this.recoveryEmailCodes[rm.code] = true
    return this.save()
  }

  Account.prototype.recoveryEmails = function () {
    var codes = Object.keys(this.recoveryEmailCodes)
    var methods = []
    for (var i = 0; i < codes.length; i++) {
      methods.push(RecoveryEmail.get(this.uid, codes[i]))
    }
    return P.all(methods)
  }

  Account.prototype.deleteAllRecoveryEmails = function () {
    var codes = Object.keys(this.recoveryEmailCodes)
    var methods = []
    for (var i = 0; i < codes.length; i++) {
      methods.push(RecoveryEmail.del(this.uid, codes[i]))
    }
    this.recoveryEmailCodes = {}
    return P.all(methods)
  }

  Account.prototype.save = function (isNew) {
    if (isNew) {
      return db
        .set(this.email + '/uid', this.uid)
        .then(Account.save.bind(null, this.uid, this))
    }
    else {
      return Account.save(this.uid, this)
    }
  }

  Account.prototype.reset = function (form) {
    //this.kA = null // TODO
    this.wrapKb = form.wrapKb
    this.srp = form.srp
    this.passwordStretching = form.passwordStretching
    return this.deleteAllTokens()
      .then(this.save.bind(this))
  }

  Account.prototype.del = function () {
    return this.deleteAllTokens()
      .then(this.deleteAllRecoveryEmails.bind(this))
      .then(deleteRecord.bind(null, this.uid))
      .then(deleteIndex.bind(null, this.email))
      .then(function () { return {} })
  }

  return Account
}

