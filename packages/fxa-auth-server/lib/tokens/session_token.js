/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var userAgent = require('../userAgent')
var ONE_HOUR = 60 * 60 * 1000

module.exports = function (log, inherits, Token) {

  function SessionToken(keys, details) {
    Token.call(this, keys, details)
    this.forceUpdate(details)
    this.email = details.email || null
    this.emailCode = details.emailCode || null
    this.emailVerified = !!details.emailVerified
    this.verifierSetAt = details.verifierSetAt
    this.locale = details.locale || null
    this.accountCreatedAt = details.createdAt
  }
  inherits(SessionToken, Token)

  SessionToken.tokenTypeID = 'sessionToken'

  SessionToken.create = function (details) {
    log.trace({ op: 'SessionToken.create', uid: details && details.uid })
    return Token.createNewToken(SessionToken, details || {})
  }

  SessionToken.fromHex = function (string, details) {
    log.trace({ op: 'SessionToken.fromHex' })
    return Token.createTokenFromHexData(SessionToken, string, details || {})
  }

  SessionToken.prototype.lastAuthAt = function () {
    return Math.floor(this.createdAt / 1000)
  }

  // Parse the user agent string, then check the result to see whether
  // the session token needs updating.
  //
  // If the session token has not changed, allowing up to an hour of
  // leeway for lastAccessTime, return false.
  //
  // Otherwise, update properties on this then return true.
  //
  // It is the caller's responsibility to update the database.
  SessionToken.prototype.update = function (userAgentString) {
    log.trace({ op: 'SessionToken.update', uid: this.uid })

    var freshData = userAgent.call({
      lastAccessTime: Date.now()
    }, userAgentString)

    if (this.isFresh(freshData)) {
      return false
    }

    this.forceUpdate(freshData)

    return true
  }

  SessionToken.prototype.isFresh = function (freshData) {
    var result = this.uaBrowser === freshData.uaBrowser &&
      this.uaBrowserVersion === freshData.uaBrowserVersion &&
      this.uaOS === freshData.uaOS &&
      this.uaOSVersion === freshData.uaOSVersion &&
      this.uaDeviceType === freshData.uaDeviceType &&
      this.lastAccessTime + ONE_HOUR > freshData.lastAccessTime

    log.info({
      op: 'SessionToken.isFresh',
      uid: this.uid,
      tokenAge: freshData.lastAccessTime - this.lastAccessTime,
      fresh: result
    })

    return result
  }

  SessionToken.prototype.forceUpdate = function (data) {
    this.uaBrowser = data.uaBrowser
    this.uaBrowserVersion = data.uaBrowserVersion
    this.uaOS = data.uaOS
    this.uaOSVersion = data.uaOSVersion
    this.uaDeviceType = data.uaDeviceType
    this.lastAccessTime = data.lastAccessTime
  }

  return SessionToken
}
