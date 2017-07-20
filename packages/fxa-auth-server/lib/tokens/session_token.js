/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const userAgent = require('../userAgent')

module.exports = (log, Token, config) => {
  const MAX_AGE_WITHOUT_DEVICE = config.tokenLifetimes.sessionTokenWithoutDevice

  class SessionToken extends Token {

    constructor(keys, details) {
      super(keys, details)

      if (MAX_AGE_WITHOUT_DEVICE && ! details.deviceId) {
        this.lifetime = MAX_AGE_WITHOUT_DEVICE
      }

      this.setUserAgentInfo(details)
      this.setDeviceInfo(details)
      this.email = details.email || null
      this.emailCode = details.emailCode || null
      this.emailVerified = !! details.emailVerified
      this.verifierSetAt = details.verifierSetAt
      this.locale = details.locale || null
      this.mustVerify = !! details.mustVerify || false

      // Tokens are considered verified if no tokenVerificationId exists
      this.tokenVerificationId = details.tokenVerificationId || null
      this.tokenVerified = this.tokenVerificationId ? false : true
    }

    static create(details) {
      details = details || {}
      log.trace({ op: 'SessionToken.create', uid: details.uid })
      return Token.createNewToken(SessionToken, details)
    }

    static fromHex(string, details) {
      log.trace({ op: 'SessionToken.fromHex' })
      return Token.createTokenFromHexData(SessionToken, string, details || {})
    }

    lastAuthAt() {
      return Math.floor(this.createdAt / 1000)
    }

    get state() {
      if (this.tokenVerified) {
        return 'verified'
      } else {
        return 'unverified'
      }
    }

    // Parse the user agent string, then update properties on this
    // It is the caller's responsibility to update the database.
    update(userAgentString) {
      log.trace({ op: 'SessionToken.update', uid: this.uid })

      var freshData = userAgent.call({
        lastAccessTime: Date.now()
      }, userAgentString)

      this.setUserAgentInfo(freshData)

      return true
    }

    setUserAgentInfo(data) {
      this.uaBrowser = data.uaBrowser
      this.uaBrowserVersion = data.uaBrowserVersion
      this.uaOS = data.uaOS
      this.uaOSVersion = data.uaOSVersion
      this.uaDeviceType = data.uaDeviceType
      this.lastAccessTime = data.lastAccessTime
    }

    setDeviceInfo(data) {
      this.deviceId = data.deviceId
      this.deviceName = data.deviceName
      this.deviceType = data.deviceType
      this.deviceCreatedAt = data.deviceCreatedAt
      this.callbackURL = data.callbackURL
      this.callbackPublicKey = data.callbackPublicKey
      this.callbackAuthKey = data.callbackAuthKey
    }
  }

  SessionToken.tokenTypeID = 'sessionToken'
  return SessionToken
}

