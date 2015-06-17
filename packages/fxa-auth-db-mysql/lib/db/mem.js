/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('bluebird')

// our data stores
var accounts = {}
var uidByNormalizedEmail = {}
var sessionTokens = {}
var keyFetchTokens = {}
var accountResetTokens = {}
var passwordChangeTokens = {}
var passwordForgotTokens = {}
var accountUnlockCodes = {}

module.exports = function (log, error) {

  function Memory(db) {}

  // CREATE
  Memory.prototype.createAccount = function (uid, data) {
    uid = uid.toString('hex')

    data.devices = {}

    data.lockedAt = null

    if ( accounts[uid] ) {
      return P.reject(error.duplicate())
    }

    if ( uidByNormalizedEmail[data.normalizedEmail] ) {
      return P.reject(error.duplicate())
    }

    accounts[uid.toString('hex')] = data
    uidByNormalizedEmail[data.normalizedEmail] = uid

    return P.resolve({})
  }

  Memory.prototype.createSessionToken = function (tokenId, sessionToken) {
    sessionToken.id = tokenId
    tokenId = tokenId.toString('hex')

    if ( sessionTokens[tokenId] ) {
      return P.reject(error.duplicate())
    }

    sessionTokens[tokenId] = {
      data: sessionToken.data,
      uid: sessionToken.uid,
      createdAt: sessionToken.createdAt,
    }

    var account = accounts[sessionToken.uid.toString('hex')]
    account.devices[tokenId] = sessionToken

    return P.resolve({})
  }

  Memory.prototype.createKeyFetchToken = function (tokenId, keyFetchToken) {
    tokenId = tokenId.toString('hex')

    if ( keyFetchTokens[tokenId] ) {
      return P.reject(error.duplicate())
    }

    keyFetchTokens[tokenId] = {
      authKey: keyFetchToken.authKey,
      uid: keyFetchToken.uid,
      keyBundle: keyFetchToken.keyBundle,
      createdAt: keyFetchToken.createdAt,
    }

    return P.resolve({})
  }

  Memory.prototype.createPasswordForgotToken = function (tokenId, passwordForgotToken) {
    tokenId = tokenId.toString('hex')

    if ( passwordForgotTokens[tokenId] ) {
      return P.reject(error.duplicate())
    }

    // Delete any passwordForgotTokens for this uid (since we're only
    // allowed one at a time).
    deleteByUid(passwordForgotToken.uid.toString('hex'), passwordForgotTokens)

    passwordForgotTokens[tokenId] = {
      tokenData: passwordForgotToken.data,
      uid: passwordForgotToken.uid,
      passCode: passwordForgotToken.passCode,
      tries: passwordForgotToken.tries,
      createdAt: passwordForgotToken.createdAt,
    }

    return P.resolve({})
  }

  Memory.prototype.createPasswordChangeToken = function (tokenId, passwordChangeToken) {
    tokenId = tokenId.toString('hex')

    if ( passwordChangeTokens[tokenId] ) {
      return P.reject(error.duplicate())
    }

    // Delete any passwordChangeTokens for this uid (since we're only
    // allowed one at a time).
    deleteByUid(passwordChangeToken.uid.toString('hex'), passwordChangeTokens)

    passwordChangeTokens[tokenId] = {
      tokenData: passwordChangeToken.data,
      uid: passwordChangeToken.uid,
      createdAt: passwordChangeToken.createdAt,
    }

    return P.resolve({})
  }

  Memory.prototype.createAccountResetToken = function (tokenId, accountResetToken) {
    tokenId = tokenId.toString('hex')

    if ( accountResetTokens[tokenId] ) {
      return P.reject(error.duplicate())
    }

    // Delete any accountResetTokens for this uid (since we're only
    // allowed one at a time).
    deleteByUid(accountResetToken.uid.toString('hex'), accountResetTokens)

    accountResetTokens[tokenId] = {
      tokenData: accountResetToken.data,
      uid: accountResetToken.uid,
      createdAt: accountResetToken.createdAt,
    }

    return P.resolve({})
  }

  // DELETE

  // The lazy way
  // uid is a hex string (not a buffer)
  function deleteByUid(uid, collection) {
    Object.keys(collection).forEach(function(key) {
      var item = collection[key]

      if (!item.uid) {
        throw new Error('No "uid" property in collection item')
      }

      if (item.uid.toString('hex') === uid) {
        delete collection[key]
      }
    })
  }

  Memory.prototype.deleteSessionToken = function (tokenId) {
    tokenId = tokenId.toString('hex')

    if ( !sessionTokens[tokenId] ) {
      return P.resolve({})
    }

    var sessionToken = sessionTokens[tokenId]
    delete sessionTokens[tokenId]

    var account = accounts[sessionToken.uid.toString('hex')]
    delete account.devices[tokenId]
    return P.resolve({})
  }

  Memory.prototype.deleteKeyFetchToken = function (tokenId) {
    delete keyFetchTokens[tokenId.toString('hex')]
    return P.resolve({})
  }

  Memory.prototype.deleteAccountResetToken = function (tokenId) {
    delete accountResetTokens[tokenId.toString('hex')]
    return P.resolve({})
  }

  Memory.prototype.deletePasswordForgotToken = function (tokenId) {
    delete passwordForgotTokens[tokenId.toString('hex')]
    return P.resolve({})
  }

  Memory.prototype.deletePasswordChangeToken = function (tokenId) {
    delete passwordChangeTokens[tokenId.toString('hex')]
    return P.resolve({})
  }

  // READ

  Memory.prototype.accountExists = function (email) {
    email = email.toString('utf8').toLowerCase()
    if ( uidByNormalizedEmail[email] ) {
      return P.resolve({})
    }
    return P.reject(error.notFound())
  }

  Memory.prototype.checkPassword = function (uid, hash) {

    return this.account(uid)
      .then(function(account) {
        if(account.verifyHash.toString('hex') === hash.verifyHash.toString('hex')) {
          return P.resolve({uid: uid})
        }
        else {
          return P.reject(error.incorrectPassword())
        }
      }, function() {
        return P.reject(error.incorrectPassword())
      })
  }

  Memory.prototype.accountDevices = function (uid) {
    return this.account(uid)
      .then(function(account) {
        var devices = Object.keys(account.devices).map(
          function (id) {
            return account.devices[id]
          }
        )
        return P.resolve(devices)
      })
  }

  // account():
  //
  // Takes:
  //   - uid - a Buffer()
  //
  // Returns:
  //   - the account if found
  //   - throws 'notFound' if not found
  Memory.prototype.account = function (uid) {
    uid = uid.toString('hex')
    if ( accounts[uid] ) {
      return P.resolve(accounts[uid])
    }
    return P.reject(error.notFound())
  }

  // emailRecord():
  //
  // Takes:
  //   - email - a string of hex encoded characters
  //
  // Returns:
  //   - the account if found
  //   - throws 'notFound' if not found
  Memory.prototype.emailRecord = function (email) {
    email = email.toString('utf8').toLowerCase()
    if ( uidByNormalizedEmail[email] ) {
      return P.resolve(accounts[uidByNormalizedEmail[email]])
    }
    return P.reject(error.notFound())
  }

  // sessionToken()
  //
  // Takes:
  //   - id - a string of hex chars
  Memory.prototype.sessionToken = function (id) {
    id = id.toString('hex')

    if ( !sessionTokens[id] ) {
      return P.reject(error.notFound())
    }

    var item = {}

    item.tokenData = sessionTokens[id].data
    item.uid = sessionTokens[id].uid
    item.createdAt = sessionTokens[id].createdAt

    var accountId = sessionTokens[id].uid.toString('hex')
    var account = accounts[accountId]
    item.emailVerified = account.emailVerified
    item.email = account.email
    item.emailCode = account.emailCode
    item.verifierSetAt = account.verifierSetAt
    item.locale = account.locale

    return P.resolve(item)
  }

  Memory.prototype.keyFetchToken = function (id) {
    id = id.toString('hex')

    if ( !keyFetchTokens[id] ) {
      return P.reject(error.notFound())
    }

    var item = {}

    var token = keyFetchTokens[id]
    item.authKey = token.authKey
    item.uid = token.uid
    item.keyBundle = token.keyBundle
    item.createdAt = token.createdAt

    var accountId = token.uid.toString('hex')
    var account = accounts[accountId]
    item.emailVerified = account.emailVerified
    item.verifierSetAt = account.verifierSetAt

    return P.resolve(item)
  }

  Memory.prototype.passwordForgotToken = function (id) {
    id = id.toString('hex')

    if ( !passwordForgotTokens[id] ) {
      return P.reject(error.notFound())
    }

    var item = {}

    var token = passwordForgotTokens[id]
    item.tokenData = token.tokenData
    item.uid = token.uid
    item.passCode = token.passCode
    item.tries = token.tries
    item.createdAt = token.createdAt

    var accountId = token.uid.toString('hex')
    var account = accounts[accountId]
    item.email = account.email
    item.verifierSetAt = account.verifierSetAt

    return P.resolve(item)
  }

  Memory.prototype.passwordChangeToken = function (id) {
    id = id.toString('hex')

    if ( !passwordChangeTokens[id] ) {
      return P.reject(error.notFound())
    }

    var item = {}

    var token = passwordChangeTokens[id]
    item.tokenData = token.tokenData
    item.uid = token.uid
    item.createdAt = token.createdAt

    var accountId = token.uid.toString('hex')
    var account = accounts[accountId]
    item.verifierSetAt = account.verifierSetAt

    return P.resolve(item)
  }

  Memory.prototype.accountResetToken = function (id) {
    id = id.toString('hex')

    if ( !accountResetTokens[id] ) {
      return P.reject(error.notFound())
    }

    var item = {}

    var token = accountResetTokens[id]
    item.tokenData = token.tokenData
    item.uid = token.uid
    item.createdAt = token.createdAt

    var accountId = token.uid.toString('hex')
    var account = accounts[accountId]
    item.verifierSetAt = account.verifierSetAt

    return P.resolve(item)
  }

  // BATCH
  Memory.prototype.verifyEmail = function (uid) {
    return this.account(uid)
      .then(
        function (account) {
          account.emailVerified = 1
          return {}
        },
        function (err) {
          return {}
        }
      )
  }

  Memory.prototype.forgotPasswordVerified = function (tokenId, accountResetToken) {
    return P.all([
      this.deletePasswordForgotToken(tokenId),
      this.createAccountResetToken(accountResetToken.tokenId, accountResetToken),
      this.verifyEmail(accountResetToken.uid),
      this.unlockAccount(accountResetToken.uid)
    ])
  }

  Memory.prototype.resetAccount = function (uid, data) {
    return this.account(uid)
      .then(
        function (account) {
          uid = uid.toString('hex')
          deleteByUid(uid, sessionTokens)
          deleteByUid(uid, keyFetchTokens)
          deleteByUid(uid, accountResetTokens)
          deleteByUid(uid, passwordChangeTokens)
          deleteByUid(uid, passwordForgotTokens)
          deleteByUid(uid, accountUnlockCodes)

          account.verifyHash = data.verifyHash
          account.authSalt = data.authSalt
          account.wrapWrapKb = data.wrapWrapKb
          account.verifierSetAt = data.verifierSetAt
          account.verifierVersion = data.verifierVersion
          account.devices = {}
          return []
        }
      )
  }

  Memory.prototype.deleteAccount = function (uid) {
    return this.account(uid)
      .then(
        function (account) {
          uid = uid.toString('hex')
          deleteByUid(uid, sessionTokens)
          deleteByUid(uid, keyFetchTokens)
          deleteByUid(uid, accountResetTokens)
          deleteByUid(uid, passwordChangeTokens)
          deleteByUid(uid, passwordForgotTokens)
          deleteByUid(uid, accountUnlockCodes)

          delete uidByNormalizedEmail[account.normalizedEmail]
          delete accounts[uid]
          return []
        }
      )
  }

  Memory.prototype.updateLocale = function (uid, data) {
    return this.account(uid)
      .then(
        function (account) {
          account.locale = data.locale
          return {}
        }
      )
  }

  Memory.prototype.lockAccount = function (uid, data) {
    return this.account(uid)
      .then(
        function (account) {
          account.lockedAt = data.lockedAt
          accountUnlockCodes[uid] = {
            uid: uid,
            unlockCode: data.unlockCode
          }
          return {}
        }
      )
  }

  Memory.prototype.unlockAccount = function (uid) {
    return this.account(uid)
      .then(
        function (account) {
          account.lockedAt = null
          delete accountUnlockCodes[uid]
          return {}
        },
        function(err) {
          // The only error from this.account(uid) could be a 404 Not Found. We're masking
          // this since the auth server firstly checks for an account prior to calling this
          // so if we have stumbled here (without an account) we probably don't mind.
          return {}
        }
      )
  }

  Memory.prototype.unlockCode = function (uid) {
    var unlockCode = accountUnlockCodes[uid]
    if (! unlockCode) {
      return P.reject(error.notFound())
    }

    return P.resolve(unlockCode)
  }

  Memory.prototype.updatePasswordForgotToken = function (id, data) {
    var token = passwordForgotTokens[id.toString('hex')]
    if (!token) { return P.reject(error.notFound()) }
    token.tries = data.tries
    return P.resolve({})
  }

  // UTILITY FUNCTIONS

  Memory.prototype.ping = function () {
    return P.resolve({})
  }

  Memory.prototype.close = function () {
    return P.resolve({})
  }

  Memory.connect = function(options) {
    return P.resolve(new Memory())
  }

  return Memory
}
