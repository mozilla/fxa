/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (P, tokens, RecoveryMethod, db, config) {

  var domain = config.domain
  var SessionToken = tokens.SessionToken
  var AccountResetToken = tokens.AccountResetToken

  function Account() {
    this.uid = null
    this.email = null
    this.verified = false
    this.verifier = null
    this.salt = null
    this.kA = null
    this.wrapKb = null
    this.params = null
    // references
    this.resetTokenId = null
    this.sessionTokenIds = null
    this.recoveryMethodIds = null
  }

  Account.hydrate = function (object) {
    if (!object) return null
    if (object.value) object = object.value
    var a = new Account()
    a.uid = object.uid
    a.email = object.email
    a.verified = !!object.verified
    a.verifier = object.verifier
    a.salt = object.salt
    a.kA = object.kA
    a.wrapKb = object.wrapKb
    a.params = object.params
    a.resetTokenId = object.resetTokenId
    a.sessionTokenIds = object.sessionTokenIds || {}
    a.recoveryMethodIds = object.recoveryMethodIds || {}
    return a
  }

  Account.create = function (options) {
    return Account
      .exists(options.email)
      .then(
        function (exists) {
          if (exists) {
            throw new Error("AccountExists")
          }
          var account = Account.hydrate(options)
          if (config.dev.verified) {
            account.verified = true
          }
          return RecoveryMethod
            .create(account.uid, account.email, true, account.verified)
            .then(
              function (rm) {
                account.recoveryMethodIds[rm.id] = true
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

  Account.verify = function (recoveryMethod) {
    if (recoveryMethod.primary && recoveryMethod.verified) {
      return Account.get(recoveryMethod.uid)
        .then(
          function (account) {
            if (!account.verified && recoveryMethod.uid === account.uid) {
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
      return Account.get(recoveryMethod.uid)
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

  Account.prototype.addRecoveryMethod = function (rm) {
    this.recoveryMethodIds[rm.id] = true
    return this.save()
  }

  Account.prototype.recoveryMethods = function () {
    var ids = Object.keys(this.recoveryMethodIds)
    var methods = []
    for (var i = 0; i < ids.length; i++) {
      methods.push(RecoveryMethod.get(ids[i]))
    }
    return P.all(methods)
  }

  Account.prototype.deleteAllRecoveryMethods = function () {
    var ids = Object.keys(this.recoveryMethodIds)
    var methods = []
    for (var i = 0; i < ids.length; i++) {
      methods.push(RecoveryMethod.del(ids[i]))
    }
    this.recoveryMethodIds = {}
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
    this.verifier = form.verifier
    this.params = form.params
    return this.deleteAllTokens()
      .then(this.save.bind(this))
  }

  Account.prototype.del = function () {
    return this.deleteAllTokens()
      .then(this.deleteAllRecoveryMethods.bind(this))
      .then(deleteRecord.bind(null, this.uid))
      .then(deleteIndex.bind(null, this.email))
  }

  return Account
}

