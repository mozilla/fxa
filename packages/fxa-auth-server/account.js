module.exports = function (P, SessionToken, RecoveryMethod, db, domain) {

  function Account() {
    // <strings>
    this.uid = null
    this.email = null
    this.verified = null
    this.verifier = null
    this.salt = null
    this.kA = null
    this.wrapKb = null
    // </strings>
    this.params = null
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
    a.verified = object.verified
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
          return RecoveryMethod
            .create(account.email, true)
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

  Account.del = function (email) {
    return Account
      .getId(email)
      .then(deleteRecord)
      .then(deleteIndex.bind(null, email))
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
    return Account.getId(email).then(Account.getById)
  }

  Account.getById = function (uid) {
    return db
      .get(uid + '/user')
      .then(Account.hydrate)
  }

  Account.prototype.principal = function () {
    return Account.principal(this.uid)
  }

  Account.prototype.addSessionToken = function (token) {
    this.sessionTokenIds[token.id] = true
    return this.save()
  }

  Account.prototype.setResetToken = function (token) {
    this.resetTokenId = token.id
    return this.save()
  }

  Account.prototype.deleteSessionToken = function (id) {
    delete this.sessionTokenIds[id]
    return this.save()
  }

  Account.prototype.sessionTokens = function () {
    var ids = Object.keys(this.sessionTokenIds)
    var tokens = []
    for (var i = 0; i < ids.length; i++) {
      tokens.push(SessionToken.get(ids[i]))
    }
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

  function _save(uid, value) {
    return db.set(uid + '/user', value).then(function () { return value })
  }

  Account.prototype.save = function (isNew) {
    if (isNew) {
      return db
        .set(this.email + '/uid', this.uid)
        .then(_save.bind(null, this.uid, this))
    }
    else {
      return _save(this.uid, this)
    }
  }

  Account.prototype.reset = function (form) {
    var self = this
    //this.kA = null // TODO
    this.wrapKb = form.wrapKb
    this.verifier = form.verifier
    this.params = form.params
    this.resetTokenId = null
    return this.sessionTokens()
      .then(
        function (tokens) {
          self.sessionTokenIds = {}
          return P.all(tokens.map(function (t) { return t.del() }))
        }
      )
      .then(this.save.bind(this))
  }

  Account.prototype.del = function () {
    return Account.del(this.email)
  }

  return Account
}

