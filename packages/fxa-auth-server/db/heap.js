/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

  function Heap() {
    this.sessionTokens = {}
    this.keyFetchTokens = {}
    this.accountResetTokens = {}
    this.passwordForgotTokens = {}
    this.passwordChangeTokens = {}
    this.accounts = {}
    this.emailRecords = {}
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
      if (collection[keys[i]].uid.toString('hex') === uid.toString('hex')) {
        delete collection[keys[i]]
      }
    }
  }

  Heap.connect = function () {
    return P(new Heap())
  }

  Heap.prototype.close = function () {
    return P(true)
  }

  Heap.prototype.ping = function () {
    return P(true)
  }

  // CREATE

  Heap.prototype.createAccount = function (data) {
    log.trace(
      {
        op: 'Heap.createAccount',
        uid: data && data.uid,
        email: data && data.email
      }
    )
    data.createdAt = data.verifierSetAt = Date.now()
    data.normalizedEmail = data.email.toLowerCase()
    this.accounts[data.uid.toString('hex')] = data
    this.emailRecords[data.normalizedEmail] = data.uid.toString('hex')
    data.devices = {}
    return P(data)
  }

  Heap.prototype.createSessionToken = function (authToken) {
    log.trace({ op: 'Heap.createSessionToken', uid: authToken && authToken.uid })
    return SessionToken.create(authToken)
      .then(saveTo(this.sessionTokens))
      .then(
        function (sessionToken) {
          var account = this.accounts[sessionToken.uid.toString('hex')]
          account.devices[sessionToken.id] = sessionToken
          return sessionToken
        }.bind(this)
      )
  }

  Heap.prototype.createKeyFetchToken = function (authToken) {
    log.trace({ op: 'Heap.createKeyFetchToken', uid: authToken && authToken.uid })
    return KeyFetchToken.create(authToken)
      .then(saveTo(this.keyFetchTokens))
  }

  Heap.prototype.createAccountResetToken = function (token /* authToken|passwordForgotToken */) {
    log.trace({ op: 'Heap.createAccountResetToken', uid: token && token.uid })
    return AccountResetToken.create(token)
      .then(
        function (accountResetToken) {
          var account = this.accounts[accountResetToken.uid.toString('hex')]
          if (!account) { return P.reject(error.unknownAccount()) }
          account.accountResetToken = accountResetToken.id
          return accountResetToken
        }.bind(this)
      )
      .then(saveTo(this.accountResetTokens))
  }

  Heap.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace({ op: 'Heap.createPasswordForgotToken', uid: emailRecord && emailRecord.uid })
    return PasswordForgotToken.create(emailRecord)
      .then(
        function (passwordForgotToken) {
          var account = this.accounts[passwordForgotToken.uid.toString('hex')]
          if (!account) { return P.reject(error.unknownAccount()) }
          account.passwordForgotToken = passwordForgotToken.id
          return passwordForgotToken
        }.bind(this)
      )
      .then(saveTo(this.passwordForgotTokens))
  }

  Heap.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'Heap.createPasswordChangeToken', uid: data.uid })
    return PasswordChangeToken.create(data)
      .then(
        function (passwordChangeToken) {
          var account = this.accounts[passwordChangeToken.uid.toString('hex')]
          if (!account) { return P.reject(error.unknownAccount()) }
          account.passwordChangeToken = passwordChangeToken.id
          return passwordChangeToken
        }.bind(this)
      )
      .then(saveTo(this.passwordChangeTokens))
  }

  // READ

  Heap.prototype.accountExists = function (email) {
    log.trace({ op: 'Heap.accountExists', email: email })
    return P(!!this.emailRecords[email.toLowerCase()])
  }

  Heap.prototype.accountDevices = function (uid) {
    log.trace({ op: 'Heap.accountDevices', uid: uid })
    return this.account(uid)
      .then(
        function (account) {
          return Object.keys(account.devices).map(
            function (id) {
              return account.devices[id]
            }
          )
        }
      )
  }

  Heap.prototype.sessionToken = function (id) {
    log.trace({ op: 'Heap.sessionToken', id: id })
    var sessionToken = this.sessionTokens[id.toString('hex')]
    if (!sessionToken) { return P.reject(error.invalidToken()) }
    var account = this.accounts[sessionToken.uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    sessionToken.email = account.email
    sessionToken.emailCode = account.emailCode
    sessionToken.emailVerified = account.emailVerified
    return P(sessionToken)
  }

  Heap.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'Heap.keyFetchToken', id: id })
    var keyFetchToken = this.keyFetchTokens[id.toString('hex')]
    if (!keyFetchToken) { return P.reject(error.invalidToken()) }
    var account = this.accounts[keyFetchToken.uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    keyFetchToken.kA = account.kA
    keyFetchToken.wrapWrapKb = account.wrapWrapKb
    keyFetchToken.emailVerified = account.emailVerified
    return P(keyFetchToken)
  }

  Heap.prototype.accountResetToken = function (id) {
    log.trace({ op: 'Heap.accountResetToken', id: id })
    var accountResetToken = this.accountResetTokens[id.toString('hex')]
    if (!accountResetToken) { return P.reject(error.invalidToken()) }
    return P(accountResetToken)
  }

  Heap.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'Heap.passwordForgotToken', id: id })
    var passwordForgotToken = this.passwordForgotTokens[id.toString('hex')]
    if (!passwordForgotToken) { return P.reject(error.invalidToken()) }
    var account = this.accounts[passwordForgotToken.uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    passwordForgotToken.email = account.email
    return P(passwordForgotToken)
  }

  Heap.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'Heap.passwordChangeToken', id: id })
    var passwordChangeToken = this.passwordChangeTokens[id.toString('hex')]
    if (!passwordChangeToken) { return P.reject(error.invalidToken()) }
    return P(passwordChangeToken)
  }

  Heap.prototype.emailRecord = function (email) {
    log.trace({ op: 'Heap.emailRecord', email: email })
    var uid = this.emailRecords[email.toLowerCase()]
    if (!uid) { return P.reject(error.unknownAccount(email)) }
    return this.account(uid)
  }

  Heap.prototype.account = function (uid) {
    log.trace({ op: 'Heap.account', uid: uid })
    var account = this.accounts[uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    return P(account)
  }

  // UPDATE

  Heap.prototype.updatePasswordForgotToken = function (passwordForgotToken) {
    log.trace({ op: 'Heap.udatePasswordForgotToken', uid: passwordForgotToken && passwordForgotToken.uid })
    return P(true)
  }

  // DELETE

  Heap.prototype.deleteAccount = function (authToken) {
    log.trace({ op: 'Heap.deleteAccount', uid: authToken && authToken.uid })
    var account = this.accounts[authToken.uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    deleteUid(account.uid, this.sessionTokens)
    deleteUid(account.uid, this.keyFetchTokens)
    deleteUid(account.uid, this.accountResetTokens)
    deleteUid(account.uid, this.passwordForgotTokens)
    delete this.emailRecords[account.email]
    delete this.accounts[account.uid.toString('hex')]
    return P(true)
  }

  Heap.prototype.deleteSessionToken = function (sessionToken) {
    log.trace(
      {
        op: 'Heap.deleteSessionToken',
        id: sessionToken && sessionToken.id,
        uid: sessionToken && sessionToken.uid
      }
    )
    var account = this.accounts[sessionToken.uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    delete account.devices[sessionToken.id]
    delete this.sessionTokens[sessionToken.id]
    return P(true)
  }

  Heap.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    log.trace(
      {
        op: 'Heap.deleteKeyFetchToken',
        id: keyFetchToken && keyFetchToken.id,
        uid: keyFetchToken && keyFetchToken.uid
      }
    )
    delete this.keyFetchTokens[keyFetchToken.id]
    return P(true)
  }

  Heap.prototype.deleteAccountResetToken = function (accountResetToken) {
    log.trace(
      {
        op: 'Heap.deleteAccountResetToken',
        id: accountResetToken && accountResetToken.id,
        uid: accountResetToken && accountResetToken.uid
      }
    )
    delete this.accountResetTokens[accountResetToken.id]
    return P(true)
  }

  Heap.prototype.deletePasswordForgotToken = function (passwordForgotToken) {
    log.trace(
      {
        op: 'Heap.deletePasswordForgotToken',
        id: passwordForgotToken && passwordForgotToken.id,
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )
    delete this.passwordForgotTokens[passwordForgotToken.id]
    return P(true)
  }

  Heap.prototype.deletePasswordChangeToken = function (passwordChangeToken) {
    log.trace(
      {
        op: 'Heap.deletePasswordChangeToken',
        id: passwordChangeToken && passwordChangeToken.id,
        uid: passwordChangeToken && passwordChangeToken.uid
      }
    )
    delete this.passwordChangeTokens[passwordChangeToken.id]
    return P(true)
  }

  // BATCH

  Heap.prototype.resetAccount = function (accountResetToken, data) {
    log.trace({ op: 'Heap.resetAccount', uid: accountResetToken && accountResetToken.uid })
    var account = this.accounts[accountResetToken.uid.toString('hex')]
    if (!account) { return P.reject(error.unknownAccount()) }
    account.verifyHash = data.verifyHash
    account.wrapWrapKb = data.wrapWrapKb
    account.authSalt = data.authSalt
    account.verifierVersion = data.verifierVersion
    account.devices = {}
    account.accountResetToken = null
    account.passwordForgotToken = null
    deleteUid(account.uid, this.sessionTokens)
    deleteUid(account.uid, this.keyFetchTokens)
    deleteUid(account.uid, this.accountResetTokens)
    deleteUid(account.uid, this.passwordForgotTokens)
    return P(true)
  }

  Heap.prototype.verifyEmail = function (account) {
    log.trace({ op: 'Heap.verifyEmail', uid: account && account.uid })
    account.emailVerified = true
    return P(true)
  }

  Heap.prototype.forgotPasswordVerified = function (passwordForgotToken) {
    log.trace({ op: 'Heap.forgotPasswordVerified', uid: passwordForgotToken && passwordForgotToken.uid })
    var account = this.accounts[passwordForgotToken.uid.toString('hex')]
    if (account) { account.emailVerified = true }
    return this.deletePasswordForgotToken(passwordForgotToken)
      .then(this.createAccountResetToken.bind(this, passwordForgotToken))
  }

  return Heap
}
