/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const P = require('bluebird')
const extend = require('util')._extend
const ip = require('ip')
const dbUtil = require('./util')

// our data stores
var accounts = {}
var uidByNormalizedEmail = {}
var sessionTokens = {}
var keyFetchTokens = {}
var unverifiedTokens = {}
var accountResetTokens = {}
var passwordChangeTokens = {}
var passwordForgotTokens = {}
var reminders = {}
var securityEvents = {}
var unblockCodes = {}
var emailBounces = {}

var DEVICE_FIELDS = [
  'sessionTokenId',
  'name',
  'type',
  'createdAt',
  'callbackURL',
  'callbackPublicKey',
  'callbackAuthKey'
]

var SESSION_FIELDS = [
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'lastAccessTime'
]

module.exports = function (log, error) {

  function Memory(db) {}

  function getAccountByUid (uid) {
    if (!uid) {
      return P.reject(error.notFound())
    }
    uid = uid.toString('hex')
    if ( accounts[uid] ) {
      return P.resolve(accounts[uid])
    }
    return P.reject(error.notFound())
  }

  function filterAccount (account) {
    var item = extend({}, account)
    delete item.verifyHash
    return P.resolve(item)
  }

  // CREATE
  Memory.prototype.createAccount = function (uid, data) {
    uid = uid.toString('hex')

    data.devices = {}

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
      uaBrowser: sessionToken.uaBrowser,
      uaBrowserVersion: sessionToken.uaBrowserVersion,
      uaOS: sessionToken.uaOS,
      uaOSVersion: sessionToken.uaOSVersion,
      uaDeviceType: sessionToken.uaDeviceType,
      lastAccessTime: sessionToken.createdAt
    }

    if (sessionToken.tokenVerificationId) {
      unverifiedTokens[tokenId] = {
        tokenVerificationId: sessionToken.tokenVerificationId,
        mustVerify: !!sessionToken.mustVerify,
        uid: sessionToken.uid
      }
    }

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

    if (keyFetchToken.tokenVerificationId) {
      unverifiedTokens[tokenId] = {
        tokenVerificationId: keyFetchToken.tokenVerificationId,
        uid: keyFetchToken.uid
      }
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

  Memory.prototype.createDevice = function (uid, deviceId, deviceInfo) {
    return getAccountByUid(uid)
      .then(
        function (account) {
          var deviceKey = deviceId.toString('hex')
          if (account.devices[deviceKey]) {
            throw error.duplicate()
          }
          var device = {
            uid: uid,
            id: deviceId
          }
          account.devices[deviceKey] = updateDeviceRecord(device, deviceInfo, deviceKey)
          return {}
        }
      )
  }

  function updateDeviceRecord (device, deviceInfo, deviceKey) {
    var session
    var sessionKey = (deviceInfo.sessionTokenId || '').toString('hex')

    if (sessionKey) {
      session = sessionTokens[sessionKey]
      if (session && session.deviceKey && session.deviceKey !== deviceKey) {
        throw error.duplicate()
      }
    }

    DEVICE_FIELDS.forEach(function (key) {
      var field = deviceInfo[key]
      if (field === undefined || field === null) {
        if (device[key] === undefined) {
          device[key] = null
        }
        return
      }
      device[key] = field
    })

    if (session) {
      SESSION_FIELDS.forEach(function (key) {
        device[key] = session[key]
      })
      session.deviceKey = deviceKey
    }

    return device
  }

  Memory.prototype.updateDevice = function (uid, deviceId, deviceInfo) {
    return getAccountByUid(uid)
      .then(
        function (account) {
          var deviceKey = deviceId.toString('hex')
          if (! account.devices[deviceKey]) {
            throw error.notFound()
          }
          var device = account.devices[deviceKey]
          if (device.sessionTokenId) {
            if (deviceInfo.sessionTokenId) {
              var oldSessionKey = device.sessionTokenId.toString('hex')
              if (oldSessionKey !== deviceInfo.sessionTokenId.toString('hex')) {
                var oldSession = sessionTokens[oldSessionKey]
                if (oldSession) {
                  oldSession.deviceKey = null
                }
              }
            } else {
              deviceInfo.sessionTokenId = device.sessionTokenId
            }
          }
          account.devices[deviceKey] = updateDeviceRecord(device, deviceInfo, deviceKey)
          return {}
        }
      )
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
    var sessionToken = sessionTokens[tokenId]

    return P.resolve()
      .then(function () {
        if (sessionToken) {
          return getAccountByUid(sessionToken.uid)
            .then(function (account) {
              var devices = account.devices

              Object.keys(devices).forEach(function (key) {
                var sessionTokenId = devices[key].sessionTokenId

                if (sessionTokenId && sessionTokenId.toString('hex') === tokenId) {
                  delete devices[key]
                }
              })
            })
        }
      })
      .then(function () {
        delete unverifiedTokens[tokenId]
        delete sessionTokens[tokenId]

        return {}
      })
  }

  Memory.prototype.deleteKeyFetchToken = function (tokenId) {
    tokenId = tokenId.toString('hex')

    delete unverifiedTokens[tokenId]
    delete keyFetchTokens[tokenId]

    return P.resolve({})
  }

  Memory.prototype.verifyTokens = function (tokenVerificationId, accountData) {
    tokenVerificationId = tokenVerificationId.toString('hex')
    var uid = accountData.uid.toString('hex')

    var tokenCount = Object.keys(unverifiedTokens).reduce(function (count, tokenId) {
      var t = unverifiedTokens[tokenId]
      if (
        t.tokenVerificationId.toString('hex') !== tokenVerificationId ||
        t.uid.toString('hex') !== uid
      ) {
        return count
      }

      // update securityEvents table
      (securityEvents[uid] || []).forEach(function (ev) {
        if (ev.tokenId && ev.tokenId.toString('hex') === tokenId) {
          ev.verified = true
        }
      })


      delete unverifiedTokens[tokenId]
      return count + 1
    }, 0)

    if (tokenCount === 0) {
      return P.reject(error.notFound())
    }

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

  Memory.prototype.deleteDevice = function (uid, deviceId) {
    var deviceKey = deviceId.toString('hex')
    return getAccountByUid(uid)
      .then(
        function (account) {
          if (! account.devices[deviceKey]) {
            throw error.notFound()
          }

          var device = account.devices[deviceKey]
          delete account.devices[deviceKey]

          return Memory.prototype.deleteSessionToken(device.sessionTokenId)
        }
      )
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

    return getAccountByUid(uid)
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
    return getAccountByUid(uid)
      .then(
        function(account) {
          return Object.keys(account.devices)
            .map(
              function (id) {
                var device = account.devices[id]
                var sessionKey = (device.sessionTokenId || '').toString('hex')
                var session = sessionTokens[sessionKey]
                if (session) {
                  SESSION_FIELDS.forEach(function (key) {
                    device[key] = session[key]
                  })
                  device.email = account.email
                  return device
                }
              }
            )
            .filter(
              function (device) {
                return !! device
              }
            )
        },
        function (err) {
          return []
        }
      )
  }

  Memory.prototype.deviceFromTokenVerificationId = function (uid, tokenVerificationId) {
    var tokenIds = Object.keys(unverifiedTokens)
    var sessionTokenId
    for (var i = 0; i < tokenIds.length; i++) {
      var unverifiedToken = unverifiedTokens[tokenIds[i]]
      if (unverifiedToken.tokenVerificationId.equals(tokenVerificationId) &&
          unverifiedToken.uid.equals(uid)) {
        sessionTokenId = tokenIds[i]
        break
      }
    }
    if (!sessionTokenId) {
      return P.reject(error.notFound())
    }
    return this.accountDevices(uid)
      .then(
        function (devices) {
          var device = devices.filter(
            function (d) {
              return d.sessionTokenId.toString('hex') === sessionTokenId
            }
          )[0]
          if (!device) {
            throw error.notFound()
          }
          return P.resolve({
            id: device.id,
            name: device.name,
            type: device.type,
            createdAt: device.createdAt,
            callbackURL: device.callbackURL,
            callbackPublicKey: device.callbackPublicKey,
            callbackAuthKey: device.callbackAuthKey,
          })
        }
      )
  }

  Memory.prototype.sessionWithDevice = function (id) {
    return this.sessionTokenWithVerificationStatus(id)
      .then(
        function (session) {
          return this.accountDevices(session.uid)
            .then(
              function (devices) {
                var device = devices.filter(
                  function (d) {
                    return d.sessionTokenId.toString('hex') === id.toString('hex')
                  }
                )[0]
                if (device) {
                  session.deviceId = device.id
                  session.deviceName = device.name
                  session.deviceType = device.type
                  session.deviceCreatedAt = device.createdAt
                  session.deviceCallbackURL = device.callbackURL
                  session.deviceCallbackPublicKey = device.callbackPublicKey
                  session.deviceCallbackAuthKey = device.callbackAuthKey
                }
                return session
              }
            )
        }.bind(this)
      )
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
    return getAccountByUid(uid)
      .then(function (account) {
        return filterAccount(account)
      })
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
    return getAccountByUid(uidByNormalizedEmail[email])
      .then(function (account) {
        return filterAccount(account)
      })
  }

  Memory.prototype.sessions = function (uid) {
    return this.accountDevices(uid).then(function (devices) {
      var hexUid = uid.toString('hex')
      var sessions = Object.keys(sessionTokens).filter(function (key) {
        return sessionTokens[key].uid.toString('hex') === hexUid
      }).map(function (key) {
        var sessionToken = sessionTokens[key]

        var deviceInfo = devices.find(function (device) {
          return device.sessionTokenId.toString('hex') === key
        })

        if (! deviceInfo) {
          deviceInfo = {}
        }

        var session = {
          tokenId: new Buffer(key, 'hex'),
          uid: sessionToken.uid,
          createdAt: sessionToken.createdAt,
          uaBrowser: sessionToken.uaBrowser || null,
          uaBrowserVersion: sessionToken.uaBrowserVersion || null,
          uaOS: sessionToken.uaOS || null,
          uaOSVersion: sessionToken.uaOSVersion || null,
          uaDeviceType: sessionToken.uaDeviceType || null,
          lastAccessTime: sessionToken.lastAccessTime,
          // device information
          deviceId: deviceInfo.id || null,
          deviceName: deviceInfo.name || null,
          deviceType: deviceInfo.type || null,
          deviceCreatedAt: deviceInfo.createdAt || null,
          deviceCallbackURL: deviceInfo.callbackURL || null,
          deviceCallbackPublicKey: deviceInfo.callbackPublicKey || null,
          deviceCallbackAuthKey: deviceInfo.callbackAuthKey || null,
        }

        return session
      })

      return sessions
    })

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
    item.uaBrowser = sessionTokens[id].uaBrowser || null
    item.uaBrowserVersion = sessionTokens[id].uaBrowserVersion || null
    item.uaOS = sessionTokens[id].uaOS || null
    item.uaOSVersion = sessionTokens[id].uaOSVersion || null
    item.uaDeviceType = sessionTokens[id].uaDeviceType || null
    item.lastAccessTime = sessionTokens[id].lastAccessTime

    var accountId = sessionTokens[id].uid.toString('hex')
    var account = accounts[accountId]
    item.emailVerified = account.emailVerified
    item.email = account.email
    item.emailCode = account.emailCode
    item.verifierSetAt = account.verifierSetAt
    item.locale = account.locale
    item.accountCreatedAt = account.createdAt

    return P.resolve(item)
  }

  Memory.prototype.sessionTokenWithVerificationStatus = function (tokenId) {
    tokenId = tokenId.toString('hex')

    return this.sessionToken(tokenId)
      .then(function (sessionToken) {
        if (unverifiedTokens[tokenId]) {
          sessionToken.mustVerify = unverifiedTokens[tokenId].mustVerify
          sessionToken.tokenVerificationId = unverifiedTokens[tokenId].tokenVerificationId
        } else {
          sessionToken.mustVerify = null
          sessionToken.tokenVerificationId = null
        }
        return sessionToken
      })
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

  Memory.prototype.keyFetchTokenWithVerificationStatus = function (tokenId) {
    tokenId = tokenId.toString('hex')

    return this.keyFetchToken(tokenId)
      .then(function (keyFetchToken) {
        keyFetchToken.tokenVerificationId = unverifiedTokens[tokenId] ?
          unverifiedTokens[tokenId].tokenVerificationId : null
        return keyFetchToken
      })
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
    item.email = account.email
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
    return getAccountByUid(uid)
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
      createAccountResetToken(),
      this.verifyEmail(accountResetToken.uid)
    ])

    function createAccountResetToken() {
      var tokenId = accountResetToken.tokenId.toString('hex')

      // Delete any accountResetTokens for this uid (since we're only
      // allowed one at a time).
      deleteByUid(accountResetToken.uid.toString('hex'), accountResetTokens)

      accountResetTokens[tokenId] = {
        tokenData: accountResetToken.data,
        uid: accountResetToken.uid,
        createdAt: accountResetToken.createdAt
      }

      return P.resolve({})
    }
  }

  Memory.prototype.resetAccount = function (uid, data) {
    return getAccountByUid(uid)
      .then(
        function (account) {
          uid = uid.toString('hex')
          deleteByUid(uid, sessionTokens)
          deleteByUid(uid, keyFetchTokens)
          deleteByUid(uid, accountResetTokens)
          deleteByUid(uid, passwordChangeTokens)
          deleteByUid(uid, passwordForgotTokens)
          deleteByUid(uid, unverifiedTokens)

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
    return getAccountByUid(uid)
      .then(
        function (account) {
          uid = uid.toString('hex')
          deleteByUid(uid, sessionTokens)
          deleteByUid(uid, keyFetchTokens)
          deleteByUid(uid, accountResetTokens)
          deleteByUid(uid, passwordChangeTokens)
          deleteByUid(uid, passwordForgotTokens)
          deleteByUid(uid, unverifiedTokens)

          delete uidByNormalizedEmail[account.normalizedEmail]
          delete accounts[uid]
          return []
        }
      )
  }

  Memory.prototype.updateLocale = function (uid, data) {
    return getAccountByUid(uid)
      .then(
        function (account) {
          account.locale = data.locale
          return {}
        }
      )
  }

  // UPDATE

  Memory.prototype.updatePasswordForgotToken = function (id, data) {
    var token = passwordForgotTokens[id.toString('hex')]
    if (!token) { return P.reject(error.notFound()) }
    token.tries = data.tries
    return P.resolve({})
  }

  Memory.prototype.updateSessionToken = function (id, data) {
    var token = sessionTokens[id.toString('hex')]
    if (!token) {
      return P.reject(error.notFound())
    }
    token.uaBrowser = data.uaBrowser
    token.uaBrowserVersion = data.uaBrowserVersion
    token.uaOS = data.uaOS
    token.uaOSVersion = data.uaOSVersion
    token.uaDeviceType = data.uaDeviceType
    token.lastAccessTime = data.lastAccessTime
    return P.resolve({})
  }

  // VERIFICATION REMINDERS

  Memory.prototype.createVerificationReminder = function (body) {
    if (! body || ! body.uid || ! body.type) {
      throw error.wrap(new Error('"uid", "type" are required'))
    }

    var reminderData = {
      uid: body.uid,
      type: body.type,
      createdAt: Date.now()
    }
    reminders[reminderData.uid.toString('hex') + reminderData.type] = reminderData

    return P.resolve({})
  }

  Memory.prototype.fetchReminders = function (body, query) {
    if (! query || ! query.reminderTime || ! query.type || ! query.limit) {
      throw error.wrap(new Error('fetchReminders - reminderTime, limit or type missing'))
    }

    var self = this
    var result = Object.keys(reminders)
      .map(function (key) {
        return reminders[key]
      })
      .filter(function (item) {
        return item.type === query.type && (Date.now() - item.createdAt) > query.reminderTime
      })
      .slice(0, query.limit)

    result.forEach(function (reminder) {
      self.deleteReminder({
        uid: reminder.uid,
        type: reminder.type
      })
    })

    return P.resolve(result)
  }

  Memory.prototype.deleteReminder = function (body) {
    if (! body || ! body.uid || ! body.type) {
      throw error.wrap(new Error('"uid", "type" are required'))
    }

    delete reminders[body.uid.toString('hex') + body.type]

    return P.resolve({})
  }

  Memory.prototype.createSecurityEvent = function (data) {
    var addr = data.ipAddr
    if (ip.isV4Format(addr)) {
      addr = '::' + addr
    }

    var verified = !data.tokenId || !unverifiedTokens[data.tokenId.toString('hex')]

    var event = {
      createdAt: Date.now(),
      ipAddr: addr,
      name: data.name,
      uid: data.uid,
      tokenId: data.tokenId,
      verified: verified
    }
    var key = event.uid.toString('hex')

    var events = securityEvents[key] || (securityEvents[key] = [])
    events.push(event)

    return P.resolve({})
  }

  Memory.prototype.securityEvents = function (where) {
    var key = where.id.toString('hex')
    var events = securityEvents[key] || []
    var addr = where.ipAddr
    if (ip.isV4Format(addr)) {
      addr = '::' + addr
    }

    return P.resolve(events.filter(function (ev) {
      return ev.uid.toString('hex') === key && ip.isEqual(ev.ipAddr, addr)
    }).map(function (ev) {
      return {
        name: ev.name,
        createdAt: ev.createdAt,
        verified: ev.verified
      }
    }).reverse())
  }

  Memory.prototype.createUnblockCode = function (uid, code) {
    uid = uid.toString('hex')
    var row = unblockCodes[uid] || (unblockCodes[uid] = {})
    row[code] = Date.now()

    return P.resolve({})
  }

  Memory.prototype.consumeUnblockCode = function (uid, code) {
    var row = unblockCodes[uid.toString('hex')]
    if (!row || !row[code]) {
      return P.reject(error.notFound())
    }
    var timestamp = row[code]
    delete row[code]

    return P.resolve({ createdAt: timestamp })
  }


  Memory.prototype.createEmailBounce = function (data) {
    let row = emailBounces[data.email] || (emailBounces[data.email] = [])
    let bounce = extend({}, data)
    bounce.createdAt = Date.now()
    bounce.bounceType = dbUtil.mapEmailBounceType(bounce.bounceType)
    bounce.bounceSubType = dbUtil.mapEmailBounceSubType(bounce.bounceSubType)
    row.push(bounce)
    return P.resolve({})
  }

  Memory.prototype.fetchEmailBounces = function(email) {
    return P.resolve(emailBounces[email] || [])
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
