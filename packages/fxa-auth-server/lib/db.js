/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('./error')
const P = require('./promise')
const Pool = require('./pool')
const random = require('./crypto/random')

// To save space in Redis, we serialise session token updates as arrays using
// fixed property indices, thereby not encoding any property names. The order
// of those properties is defined here in REDIS_SESSION_TOKEN_PROPERTIES and
// REDIS_SESSION_TOKEN_LOCATION_PROPERTIES. Note that, to maintain backwards
// compatibility, any future changes to these constants may only append items
// to the end of each array. There's no safe way to change the array index for
// any property, without introducing an explicit migration process for our Redis
// instance.
const REDIS_SESSION_TOKEN_PROPERTIES = [
  'lastAccessTime', 'location', 'uaBrowser', 'uaBrowserVersion',
  'uaOS', 'uaOSVersion', 'uaDeviceType', 'uaFormFactor'
]

const REDIS_SESSION_TOKEN_LOCATION_INDEX = REDIS_SESSION_TOKEN_PROPERTIES.indexOf('location')

const REDIS_SESSION_TOKEN_LOCATION_PROPERTIES = [
  'city', 'state', 'stateCode', 'country', 'countryCode'
]

module.exports = (
  config,
  log,
  Token,
  UnblockCode
  ) => {

  const features = require('./features')(config)
  const SafeUrl = require('./safe-url')(log)
  const {
    SessionToken,
    KeyFetchToken,
    AccountResetToken,
    PasswordForgotToken,
    PasswordChangeToken
  } = Token
  const MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE = config.tokenLifetimes.sessionTokenWithoutDevice
  const { enabled: TOKEN_PRUNING_ENABLED, maxAge: TOKEN_PRUNING_MAX_AGE } = config.tokenPruning

  const SAFE_URLS = {}

  function setAccountEmails(account) {
    return this.accountEmails(account.uid)
      .then((emails) => {
        account.emails = emails

        // Set primary email on account object
        account.emails.forEach((item) => {
          item.isVerified = !! item.isVerified
          item.isPrimary = !! item.isPrimary

          if (item.isPrimary) {
            account.primaryEmail = item
          }
        })

        return account
      })
  }

  function DB(options) {
    let pooleeOptions = {}
    if (config && config.db && config.db.poolee) {
      pooleeOptions = config.db.poolee
    }

    this.pool = new Pool(options.url, pooleeOptions)
    this.redis = require('./redis')({ ...config.redis, ...config.redis.sessionTokens }, log)
  }

  DB.connect = function (options) {
    return P.resolve(new DB(options))
  }

  DB.prototype.close = function () {
    const promises = [this.pool.close()]
    if (this.redis) {
      promises.push(this.redis.close())
    }
    return P.all(promises)
  }

  SAFE_URLS.ping = new SafeUrl('/__heartbeat__', 'db.ping')
  DB.prototype.ping = function () {
    return this.pool.get(SAFE_URLS.ping)
  }

  // CREATE

  SAFE_URLS.createAccount = new SafeUrl('/account/:uid', 'db.createAccount')
  DB.prototype.createAccount = function (data) {
    const { uid, email } = data
    log.trace({ op: 'DB.createAccount', uid, email })
    data.createdAt = data.verifierSetAt = Date.now()
    data.normalizedEmail = data.email.toLowerCase()
    return this.pool.put(SAFE_URLS.createAccount, { uid }, data)
      .then(
        () => data,
        err => {
          if (isRecordAlreadyExistsError(err)) {
            err = error.accountExists(data.email)
          }
          throw err
        }
      )
  }

  SAFE_URLS.createSessionToken = new SafeUrl('/sessionToken/:id', 'db.createSessionToken')
  DB.prototype.createSessionToken = function (authToken) {
    const { uid } = authToken

    log.trace({ op: 'DB.createSessionToken', uid })

    return SessionToken.create(authToken)
      .then(sessionToken => {
        const { id } = sessionToken

        // Ensure there are no clashes with zombie tokens left behind in Redis
        return this.deleteSessionTokenFromRedis(uid, id)
          .catch(() => {})
          .then(() => this.pool.put(SAFE_URLS.createSessionToken, { id },
            Object.assign({
              // Marshall from this repo's id property to the db's tokenId
              tokenId: id
            }, sessionToken)
          ))
          .then(() => sessionToken)
      })
  }

  SAFE_URLS.createKeyFetchToken = new SafeUrl('/keyFetchToken/:id', 'db.createKeyFetchToken')
  DB.prototype.createKeyFetchToken = function (authToken) {
    log.trace({ op: 'DB.createKeyFetchToken', uid: authToken && authToken.uid })
    return KeyFetchToken.create(authToken)
      .then(
        function (keyFetchToken) {
          const { id } = keyFetchToken
          return this.pool.put(
            SAFE_URLS.createKeyFetchToken,
            { id },
            {
              tokenId: keyFetchToken.id,
              authKey: keyFetchToken.authKey,
              uid: keyFetchToken.uid,
              keyBundle: keyFetchToken.keyBundle,
              createdAt: keyFetchToken.createdAt,
              tokenVerificationId: keyFetchToken.tokenVerificationId
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

  SAFE_URLS.createPasswordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id',
    'db.createPasswordForgotToken'
  )
  DB.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace({ op: 'DB.createPasswordForgotToken', uid: emailRecord && emailRecord.uid })
    return PasswordForgotToken.create(emailRecord)
      .then(
        function (passwordForgotToken) {
          const { id } = passwordForgotToken
          return this.pool.put(
            SAFE_URLS.createPasswordForgotToken,
            { id },
            {
              tokenId: passwordForgotToken.id,
              data: passwordForgotToken.data,
              uid: passwordForgotToken.uid,
              passCode: passwordForgotToken.passCode,
              createdAt: passwordForgotToken.createdAt,
              tries: passwordForgotToken.tries
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

  SAFE_URLS.createPasswordChangeToken = new SafeUrl(
    '/passwordChangeToken/:id',
    'db.createPasswordChangeToken'
  )
  DB.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'DB.createPasswordChangeToken', uid: data.uid })
    return PasswordChangeToken.create(data)
      .then(
        function (passwordChangeToken) {
          const { id } = passwordChangeToken
          return this.pool.put(
            SAFE_URLS.createPasswordChangeToken,
            { id },
            {
              tokenId: passwordChangeToken.id,
              data: passwordChangeToken.data,
              uid: passwordChangeToken.uid,
              createdAt: passwordChangeToken.createdAt
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

  SAFE_URLS.checkPassword = new SafeUrl('/account/:uid/checkPassword', 'db.checkPassword')
  DB.prototype.checkPassword = function (uid, verifyHash) {
    log.trace({ op: 'DB.checkPassword', uid, verifyHash })
    return this.pool.post(SAFE_URLS.checkPassword,
      { uid },
      {
        'verifyHash': verifyHash
      })
      .then(
        function () {
          return true
        },
        function (err) {
          if (isIncorrectPasswordError(err)) {
            return false
          }
          throw err
        }
      )
  }

  DB.prototype.accountExists = function (email) {
    log.trace({ op: 'DB.accountExists', email: email })
    return this.accountRecord(email)
      .then(
        function () {
          return true
        },
        function (err) {
          if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
            return false
          }
          throw err
        }
      )
  }

  SAFE_URLS.sessions = new SafeUrl('/account/:uid/sessions', 'db.sessions')
  DB.prototype.sessions = function (uid) {
    log.trace({ op: 'DB.sessions', uid })
    const promises = [
      this.pool.get(SAFE_URLS.sessions, { uid })
        .then(sessionTokens => {
          if (! MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE) {
            return sessionTokens
          }

          const expiredSessionTokens = []

          // Filter out any expired sessions
          sessionTokens = sessionTokens.filter(sessionToken => {
            if (sessionToken.deviceId) {
              return true
            }

            if (sessionToken.createdAt > Date.now() - MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE) {
              return true
            }

            expiredSessionTokens.push(Object.assign({}, sessionToken, { id: sessionToken.tokenId }))
            return false
          })

          if (expiredSessionTokens.length === 0) {
            return sessionTokens
          }

          return this.pruneSessionTokens(uid, expiredSessionTokens)
            .catch(() => {})
            .then(() => sessionTokens)
        })
    ]
    let isRedisOk = true

    if (this.redis) {
      promises.push(
        this.safeRedisGet(uid)
          .then(result => {
            if (result === false) {
              // Ensure that we don't return lastAccessTime if redis is down
              isRedisOk = false
            }
            return this.safeUnpackTokensFromRedis(uid, result)
          })
      )
    }

    return P.all(promises)
      .spread((mysqlSessionTokens, redisSessionTokens = {}) => {
        // for each db session token, if there is a matching redis token
        // overwrite the properties of the db token with the redis token values
        const lastAccessTimeEnabled = isRedisOk && features.isLastAccessTimeEnabledForUser(uid)
        const sessions = mysqlSessionTokens.map((sessionToken) => {
          const id = sessionToken.tokenId
          const redisToken = redisSessionTokens[id]
          const mergedToken = Object.assign({}, sessionToken, redisToken, {
            // Map from the db's tokenId property to this repo's id property
            id
          })
          delete mergedToken.tokenId
          // Don't return potentially-stale lastAccessTime
          if (! lastAccessTimeEnabled) {
            mergedToken.lastAccessTime = null
          }
          return mergedToken
        })
        log.info({
          op: 'db.sessions.count',
          mysql: mysqlSessionTokens.length,
          redis: redisSessionTokens.length
        })
        return sessions
      })
  }

  SAFE_URLS.keyFetchToken = new SafeUrl('/keyFetchToken/:id', 'db.keyFetchToken')
  DB.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'DB.keyFetchToken', id })
    return this.pool.get(SAFE_URLS.keyFetchToken, { id })
      .then(
        function (data) {
          return KeyFetchToken.fromId(id, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  SAFE_URLS.keyFetchTokenWithVerificationStatus = new SafeUrl(
    '/keyFetchToken/:id/verified',
    'db.keyFetchTokenWithVerificationStatus'
  )
  DB.prototype.keyFetchTokenWithVerificationStatus = function (id) {
    log.trace({ op: 'DB.keyFetchTokenWithVerificationStatus', id })
    return this.pool.get(SAFE_URLS.keyFetchTokenWithVerificationStatus, { id })
      .then(
        function (data) {
          return KeyFetchToken.fromId(id, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  SAFE_URLS.accountResetToken = new SafeUrl('/accountResetToken/:id', 'db.accountResetToken')
  DB.prototype.accountResetToken = function (id) {
    log.trace({ op: 'DB.accountResetToken', id })
    return this.pool.get(SAFE_URLS.accountResetToken, { id })
      .then(
        function (data) {
          return AccountResetToken.fromHex(data.tokenData, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  SAFE_URLS.passwordForgotToken = new SafeUrl('/passwordForgotToken/:id', 'db.passwordForgotToken')
  DB.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'DB.passwordForgotToken', id })
    return this.pool.get(SAFE_URLS.passwordForgotToken, { id })
      .then(
        function (data) {
          return PasswordForgotToken.fromHex(data.tokenData, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  SAFE_URLS.passwordChangeToken = new SafeUrl('/passwordChangeToken/:id', 'db.passwordChangeToken')
  DB.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'DB.passwordChangeToken', id })
    return this.pool.get(SAFE_URLS.passwordChangeToken, { id })
      .then(
        function (data) {
          return PasswordChangeToken.fromHex(data.tokenData, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  SAFE_URLS.emailRecord = new SafeUrl('/emailRecord/:email', 'db.emailRecord')
  DB.prototype.emailRecord = function (email) {
    log.trace({ op: 'DB.emailRecord', email })
    return this.pool.get(SAFE_URLS.emailRecord, { email: hexEncode(email) })
      .then(
        (body) => {
          return setAccountEmails.call(this, body)
        },
        (err) => {
          if (isNotFoundError(err)) {
            err = error.unknownAccount(email)
          }
          throw err
        }
      )
  }

  SAFE_URLS.accountRecord = new SafeUrl('/email/:email/account', 'db.accountRecord')
  DB.prototype.accountRecord = function (email) {
    log.trace({ op: 'DB.accountRecord', email })
    return this.pool.get(SAFE_URLS.accountRecord, { email: hexEncode(email) })
      .then(
        (body) => {
          return setAccountEmails.call(this, body)
        },
        (err) => {
          if (isNotFoundError(err)) {
            // There is a possibility that this email exists on the account table (ex. deleted from emails table)
            // Lets check before throwing account not found.
            return this.emailRecord(email)
          }
          throw err
        }
      )
  }

  SAFE_URLS.setPrimaryEmail = new SafeUrl('/email/:email/account/:uid', 'db.setPrimaryEmail')
  DB.prototype.setPrimaryEmail = function (uid, email) {
    log.trace({ op: 'DB.setPrimaryEmail', email })
    return this.pool.post(SAFE_URLS.setPrimaryEmail, { email: hexEncode(email), uid })
      .then(
        function (body) {
          return body
        },
        function (err) {
          if (isNotFoundError(err)) {
            err = error.unknownAccount(email)
          }
          throw err
        }
      )
  }

  SAFE_URLS.account = new SafeUrl('/account/:uid', 'db.account')
  DB.prototype.account = function (uid) {
    log.trace({ op: 'DB.account', uid })
    return this.pool.get(SAFE_URLS.account, { uid })
      .then((body) => {
        body.emailVerified = !! body.emailVerified

        return setAccountEmails.call(this, body)
      }, (err) => {
        if (isNotFoundError(err)) {
          err = error.unknownAccount()
        }
        throw err
      })
  }

  SAFE_URLS.devices = new SafeUrl('/account/:uid/devices', 'db.devices')
  DB.prototype.devices = function (uid) {
    log.trace({ op: 'DB.devices', uid })

    if (! uid) {
      return P.reject(error.unknownAccount())
    }

    const promises = [
      this.pool.get(SAFE_URLS.devices, { uid })
    ]
    let isRedisOk = true

    if (this.redis) {
      promises.push(
        this.safeRedisGet(uid)
          .then(result => {
            if (result === false) {
              // Ensure that we don't return lastAccessTime if redis is down
              isRedisOk = false
            }
            return this.safeUnpackTokensFromRedis(uid, result)
          })
      )
    }
    return P.all(promises)
      .spread((devices, redisSessionTokens = {}) => {
        const lastAccessTimeEnabled = isRedisOk && features.isLastAccessTimeEnabledForUser(uid)
        return devices.map(device => {
          return mergeDeviceInfoFromRedis(device, redisSessionTokens, lastAccessTimeEnabled)
        })
      })
      .catch(err =>{
        if (isNotFoundError(err)) {
          throw error.unknownAccount()
        }
        throw err
      })
  }

  SAFE_URLS.sessionToken = new SafeUrl('/sessionToken/:id/device', 'db.sessionToken')
  DB.prototype.sessionToken = function (id) {
    log.trace({ op: 'DB.sessionToken', id })
    return this.pool.get(SAFE_URLS.sessionToken, { id })
    .then(
      function (data) {
        return SessionToken.fromHex(data.tokenData, data)
      },
      function (err) {
        err = wrapTokenNotFoundError(err)
        throw err
      }
    )
  }

  // UPDATE

  SAFE_URLS.updatePasswordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id/update',
    'db.updatePasswordForgotToken'
  )
  DB.prototype.updatePasswordForgotToken = function (token) {
    log.trace({ op: 'DB.udatePasswordForgotToken', uid: token && token.uid })
    const { id } = token
    return this.pool.post(
      SAFE_URLS.updatePasswordForgotToken,
      { id },
      {
        tries: token.tries
      }
    )
  }

  /**
   * Update cached session-token data, such as timestamps
   * and device info.  This is a comparatively cheap call that
   * only writes to redis, not the underlying DB, and hence
   * can be safely used in frequently-called routes.
   *
   * To do a more expensive write that flushes to the underlying
   * DB, use updateSessionToken instead.
   */
  DB.prototype.touchSessionToken = function (token, geo) {
    const { id, uid } = token

    log.trace({ op: 'DB.touchSessionToken', id, uid })

    if (! this.redis || ! features.isLastAccessTimeEnabledForUser(uid)) {
      return P.resolve()
    }

    return this.redis.update(uid, sessionTokens => {
      let location
      if (geo && geo.location) {
        location = {
          city: geo.location.city,
          country: geo.location.country,
          countryCode: geo.location.countryCode,
          state: geo.location.state,
          stateCode: geo.location.stateCode
        }
      }

      sessionTokens = unpackTokensFromRedis(sessionTokens)

      sessionTokens[id] = {
        lastAccessTime: token.lastAccessTime,
        location,
        uaBrowser: token.uaBrowser,
        uaBrowserVersion: token.uaBrowserVersion,
        uaDeviceType: token.uaDeviceType,
        uaFormFactor: token.uaFormFactor,
        uaOS: token.uaOS,
        uaOSVersion: token.uaOSVersion,
      }

      return packTokensForRedis(sessionTokens)
    })
  }

  /**
   * Persist updated session-token data to the database.
   * This is a comparatively expensive call that writes through
   * to the underlying DB and hence should not be used in
   * frequently-called routes.
   *
   * To do a cheaper write of transient metadata that only hits
   * redis, use touchSessionToken isntead.
   */
  SAFE_URLS.updateSessionToken = new SafeUrl('/sessionToken/:id/update', 'db.updateSessionToken')
  DB.prototype.updateSessionToken = function (sessionToken, geo) {
    const { id, uid } = sessionToken

    log.trace({ op: 'DB.updateSessionToken', id, uid })

    return this.touchSessionToken(sessionToken, geo)
      .then(() => {
        return this.pool.post(
          SAFE_URLS.updateSessionToken,
          { id },
          {
            authAt: sessionToken.authAt,
            uaBrowser: sessionToken.uaBrowser,
            uaBrowserVersion: sessionToken.uaBrowserVersion,
            uaOS: sessionToken.uaOS,
            uaOSVersion: sessionToken.uaOSVersion,
            uaDeviceType: sessionToken.uaDeviceType,
            uaFormFactor: sessionToken.uaFormFactor,
            mustVerify: sessionToken.mustVerify,
            lastAccessTime: sessionToken.lastAccessTime
          }
        )
      })
  }

  DB.prototype.pruneSessionTokens = function (uid, sessionTokens) {
    log.trace({ op: 'DB.pruneSessionTokens', uid, tokenCount: sessionTokens.length })

    if (! this.redis || ! TOKEN_PRUNING_ENABLED || ! features.isLastAccessTimeEnabledForUser(uid)) {
      return P.resolve()
    }

    const tokenIds = sessionTokens
      .filter(token => token.createdAt <= Date.now() - TOKEN_PRUNING_MAX_AGE)
      .map(token => token.id)

    if (tokenIds.length === 0) {
      return P.resolve()
    }

    return this.redis.update(uid, sessionTokens => {
      if (! sessionTokens) {
        return
      }

      sessionTokens = unpackTokensFromRedis(sessionTokens)

      tokenIds.forEach(id => delete sessionTokens[id])

      if (Object.keys(sessionTokens).length > 0) {
        return packTokensForRedis(sessionTokens)
      }
    })
  }

  SAFE_URLS.device = new SafeUrl('/account/:uid/device/:deviceId', 'db.device')
  DB.prototype.device = function (uid, deviceId) {
    log.trace({ op: 'DB.device', uid: uid, id: deviceId })

    const promises = [
      this.pool.get(SAFE_URLS.device, { uid, deviceId })
    ]

    let isRedisOk = true
    if (this.redis) {
      promises.push(
        this.safeRedisGet(uid)
          .then(result => {
            if (result === false) {
              // Ensure that we don't return lastAccessTime if redis is down
              isRedisOk = false
            }
            return this.safeUnpackTokensFromRedis(uid, result)
          })
      )
    }

    return P.all(promises)
      .spread((device, redisSessionTokens = {}) => {
        const lastAccessTimeEnabled = isRedisOk && features.isLastAccessTimeEnabledForUser(uid)
        return mergeDeviceInfoFromRedis(device, redisSessionTokens, lastAccessTimeEnabled)
      })
      .catch(err =>{
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        throw err
      })
  }

  SAFE_URLS.createDevice = new SafeUrl('/account/:uid/device/:id', 'db.createDevice')
  DB.prototype.createDevice = function (uid, sessionTokenId, deviceInfo) {
    log.trace({ op: 'DB.createDevice', uid: uid, id: deviceInfo.id })

    return random.hex(16)
      .then(id => {
        deviceInfo.id = id
        deviceInfo.createdAt = Date.now()
        return this.pool.put(
          SAFE_URLS.createDevice,
          { uid, id },
          {
            sessionTokenId: sessionTokenId,
            createdAt: deviceInfo.createdAt,
            name: deviceInfo.name,
            type: deviceInfo.type,
            callbackURL: deviceInfo.pushCallback,
            callbackPublicKey: deviceInfo.pushPublicKey,
            callbackAuthKey: deviceInfo.pushAuthKey,
            availableCommands: deviceInfo.availableCommands
          }
        )
      })
      .then(
        () => {
          deviceInfo.pushEndpointExpired = false
          return deviceInfo
        },
        err => {
          if (isRecordAlreadyExistsError(err)) {
            return this.devices(uid)
              .then(
                // It's possible (but extraordinarily improbable) that we generated
                // a duplicate device id, so check the devices for this account. If
                // we find a duplicate, retry with a new id. If we don't find one,
                // the problem was caused by the unique sessionToken constraint so
                // return an appropriate error.
                devices => {
                  let conflictingDeviceId

                  const isDuplicateDeviceId = devices.reduce((is, device) => {
                    if (is || device.id === deviceInfo.id) {
                      return true
                    }

                    if (device.sessionToken === sessionTokenId) {
                      conflictingDeviceId = device.id
                    }
                  }, false)

                  if (isDuplicateDeviceId) {
                    return this.createDevice(uid, sessionTokenId, deviceInfo)
                  }

                  throw error.deviceSessionConflict(conflictingDeviceId)
                }
              )
          }
          throw err
        }
      )
  }

  SAFE_URLS.updateDevice = new SafeUrl('/account/:uid/device/:id/update', 'db.updateDevice')
  DB.prototype.updateDevice = function (uid, sessionTokenId, deviceInfo) {
    const { id } = deviceInfo
    log.trace({ op: 'DB.updateDevice', uid, id })
    return this.pool.post(
      SAFE_URLS.updateDevice,
      { uid, id },
      {
        sessionTokenId: sessionTokenId,
        name: deviceInfo.name,
        type: deviceInfo.type,
        callbackURL: deviceInfo.pushCallback,
        callbackPublicKey: deviceInfo.pushPublicKey,
        callbackAuthKey: deviceInfo.pushAuthKey,
        callbackIsExpired: !! deviceInfo.pushEndpointExpired,
        availableCommands: deviceInfo.availableCommands
      }
    )
    .then(
      () => deviceInfo,
      err => {
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        if (isRecordAlreadyExistsError(err)) {
          // Identify the conflicting device in the error response,
          // to save a server round-trip for the client.
          return this.devices(uid)
            .then(devices => {
              let conflictingDeviceId
              devices.some(device => {
                if (device.sessionToken === sessionTokenId) {
                  conflictingDeviceId = device.id
                  return true
                }
              })
              throw error.deviceSessionConflict(conflictingDeviceId)
            })
        }
        throw err
      }
    )
  }

  // DELETE

  SAFE_URLS.deleteAccount = new SafeUrl('/account/:uid', 'db.deleteAccount')
  DB.prototype.deleteAccount = function (authToken) {
    const { uid } = authToken

    log.trace({ op: 'DB.deleteAccount', uid })

    return P.resolve()
      .then(() => {
        if (this.redis) {
          return this.redis.del(uid)
        }
      })
      .then(() => this.pool.del(SAFE_URLS.deleteAccount, { uid }))
  }

  SAFE_URLS.deleteSessionToken = new SafeUrl('/sessionToken/:id', 'db.deleteSessionToken')
  DB.prototype.deleteSessionToken = function (sessionToken) {
    const { id, uid } = sessionToken

    log.trace({ op: 'DB.deleteSessionToken', id, uid })

    return this.deleteSessionTokenFromRedis(uid, id)
      .then(() => this.pool.del(SAFE_URLS.deleteSessionToken, { id }))
  }

  SAFE_URLS.deleteKeyFetchToken = new SafeUrl('/keyFetchToken/:id', 'db.deleteKeyFetchToken')
  DB.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    const { id, uid } = keyFetchToken
    log.trace({ op: 'DB.deleteKeyFetchToken', id, uid })
    return this.pool.del(SAFE_URLS.deleteKeyFetchToken, { id })
  }

  SAFE_URLS.deleteAccountResetToken = new SafeUrl(
    '/accountResetToken/:id',
    'db.deleteAccountResetToken'
  )
  DB.prototype.deleteAccountResetToken = function (accountResetToken) {
    const { id, uid } = accountResetToken
    log.trace({ op: 'DB.deleteAccountResetToken', id, uid })
    return this.pool.del(SAFE_URLS.deleteAccountResetToken, { id })
  }

  SAFE_URLS.deletePasswordForgotToken = new SafeUrl(
    '/passwordForgotToken/:id',
    'db.deletePasswordForgotToken'
  )
  DB.prototype.deletePasswordForgotToken = function (passwordForgotToken) {
    const { id, uid } = passwordForgotToken
    log.trace({ op: 'DB.deletePasswordForgotToken', id, uid })
    return this.pool.del(SAFE_URLS.deletePasswordForgotToken, { id })
  }

  SAFE_URLS.deletePasswordChangeToken = new SafeUrl(
    '/passwordChangeToken/:id',
    'db.deletePasswordChangeToken'
  )
  DB.prototype.deletePasswordChangeToken = function (passwordChangeToken) {
    const { id, uid } = passwordChangeToken
    log.trace({ op: 'DB.deletePasswordChangeToken', id, uid })
    return this.pool.del(SAFE_URLS.deletePasswordChangeToken, { id })
  }

  SAFE_URLS.deleteDevice = new SafeUrl('/account/:uid/device/:deviceId', 'db.deleteDevice')
  DB.prototype.deleteDevice = function (uid, deviceId) {
    log.trace({ op: 'DB.deleteDevice', uid, id: deviceId })

    return this.pool.del(SAFE_URLS.deleteDevice, { uid, deviceId })
      .then(result => this.deleteSessionTokenFromRedis(uid, result.sessionTokenId))
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        throw err
      })
  }

  SAFE_URLS.deviceFromTokenVerificationId = new SafeUrl(
    '/account/:uid/tokens/:tokenVerificationId/device',
    'db.deviceFromTokenVerificationId'
  )
  DB.prototype.deviceFromTokenVerificationId = function (uid, tokenVerificationId) {
    log.trace({ op: 'DB.deviceFromTokenVerificationId', uid, tokenVerificationId })
    return this.pool.get(SAFE_URLS.deviceFromTokenVerificationId, { uid, tokenVerificationId })
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        throw err
      })
  }

  // BATCH

  SAFE_URLS.resetAccount = new SafeUrl('/account/:uid/reset', 'db.resetAccount')
  DB.prototype.resetAccount = function (accountResetToken, data) {
    const { uid } = accountResetToken

    log.trace({ op: 'DB.resetAccount', uid })

    return P.resolve()
      .then(() => {
        if (this.redis) {
          return this.redis.del(uid)
        }
      })
      .then(() => {
        data.verifierSetAt = Date.now()
        return this.pool.post(SAFE_URLS.resetAccount, { uid }, data)
      })
  }

  SAFE_URLS.verifyEmail = new SafeUrl('/account/:uid/verifyEmail/:emailCode', 'db.verifyEmail')
  DB.prototype.verifyEmail = function (account, emailCode) {
    const { uid } = account
    log.trace({ op: 'DB.verifyEmail', uid, emailCode })
    return this.pool.post(SAFE_URLS.verifyEmail, { uid, emailCode })
  }

  SAFE_URLS.verifyTokens = new SafeUrl('/tokens/:tokenVerificationId/verify', 'db.verifyTokens')
  DB.prototype.verifyTokens = function (tokenVerificationId, accountData) {
    log.trace({ op: 'DB.verifyTokens', tokenVerificationId })
    return this.pool.post(
      SAFE_URLS.verifyTokens,
      { tokenVerificationId },
      { uid: accountData.uid }
    )
    .then(
      function (body) {
        return body
      },
      function (err) {
        if (isNotFoundError(err)) {
          err = error.invalidVerificationCode()
        }
        throw err
      }
    )
  }

  SAFE_URLS.verifyTokensWithMethod = new SafeUrl(
    '/tokens/:tokenId/verifyWithMethod',
    'db.verifyTokensWithMethod'
  )
  DB.prototype.verifyTokensWithMethod = function (tokenId, verificationMethod) {
    log.trace({op: 'DB.verifyTokensWithMethod', tokenId, verificationMethod})
    return this.pool.post(
      SAFE_URLS.verifyTokensWithMethod,
      { tokenId },
      {verificationMethod}
    )
  }

  SAFE_URLS.verifyTokenCode = new SafeUrl('/tokens/:code/verifyCode', 'db.verifyTokenCode')
  DB.prototype.verifyTokenCode = function (code, accountData) {
    log.trace({ op: 'DB.verifyTokenCode', code })
    return this.pool.post(
      SAFE_URLS.verifyTokenCode,
      { code },
      { uid: accountData.uid }
    )
    .then(
      function (body) {
        return body
      },
      function (err) {
        if (isExpiredTokenVerificationCodeError(err)) {
          err = error.expiredTokenVerficationCode()
        } else if (isNotFoundError(err)) {
          err = error.invalidTokenVerficationCode()
        }
        throw err
      }
    )
  }

  SAFE_URLS.forgotPasswordVerified = new SafeUrl(
    '/passwordForgotToken/:id/verified',
    'db.forgotPasswordVerified'
  )
  DB.prototype.forgotPasswordVerified = function (passwordForgotToken) {
    const { id, uid } = passwordForgotToken
    log.trace({ op: 'DB.forgotPasswordVerified', uid })
    return AccountResetToken.create({ uid })
      .then(
        function (accountResetToken) {
          return this.pool.post(
            SAFE_URLS.forgotPasswordVerified,
            { id },
            {
              tokenId: accountResetToken.id,
              data: accountResetToken.data,
              uid: accountResetToken.uid,
              createdAt: accountResetToken.createdAt
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

  SAFE_URLS.updateLocale = new SafeUrl('/account/:uid/locale', 'db.updateLocale')
  DB.prototype.updateLocale = function (uid, locale) {
    log.trace({ op: 'DB.updateLocale', uid, locale })
    return this.pool.post(
      SAFE_URLS.updateLocale,
      { uid },
      { locale: locale }
    )
  }

  SAFE_URLS.securityEvent = new SafeUrl('/securityEvents', 'db.securityEvent')
  DB.prototype.securityEvent = function (event) {
    log.trace({
      op: 'DB.securityEvent',
      securityEvent: event
    })

    return this.pool.post(SAFE_URLS.securityEvent, undefined, event)
  }

  SAFE_URLS.securityEvents = new SafeUrl('/securityEvents/:uid/ip/:ipAddr', 'db.securityEvents')
  DB.prototype.securityEvents = function (params) {
    log.trace({
      op: 'DB.securityEvents',
      params: params
    })
    const { ipAddr, uid } = params
    return this.pool.get(SAFE_URLS.securityEvents, { ipAddr, uid })
  }

  SAFE_URLS.createUnblockCode = new SafeUrl('/account/:uid/unblock/:unblock', 'db.createUnblockCode')
  DB.prototype.createUnblockCode = function (uid) {
    log.trace({ op: 'DB.createUnblockCode', uid })
    return UnblockCode()
      .then(
        (unblock) => {
          return this.pool.put(SAFE_URLS.createUnblockCode, { uid, unblock })
            .then(
              () => {
                return unblock
              },
              (err) => {
                // duplicates should be super rare, but it's feasible that a
                // uid already has an existing unblockCode. Just try again.
                if (isRecordAlreadyExistsError(err)) {
                  log.error({
                    op: 'DB.createUnblockCode.duplicate',
                    err: err,
                    uid: uid
                  })
                  return this.createUnblockCode(uid)
                }
                throw err
              }
            )
        }
      )
  }

  SAFE_URLS.consumeUnblockCode = new SafeUrl('/account/:uid/unblock/:code', 'db.consumeUnblockCode')
  DB.prototype.consumeUnblockCode = function (uid, code) {
    log.trace({ op: 'DB.consumeUnblockCode', uid })
    return this.pool.del(SAFE_URLS.consumeUnblockCode, { uid, code })
      .catch(
        function (err) {
          if (isNotFoundError(err)) {
            throw error.invalidUnblockCode()
          }
          throw err
        }
      )
  }

  SAFE_URLS.createEmailBounce = new SafeUrl('/emailBounces', 'db.createEmailBounce')
  DB.prototype.createEmailBounce = function (bounceData) {
    log.trace({
      op: 'DB.createEmailBounce',
      bouceData: bounceData
    })

    return this.pool.post(SAFE_URLS.createEmailBounce, undefined, bounceData)
  }

  SAFE_URLS.emailBounces = new SafeUrl('/emailBounces/:email', 'db.emailBounces')
  DB.prototype.emailBounces = function (email) {
    log.trace({ op: 'DB.emailBounces', email })

    return this.pool.get(SAFE_URLS.emailBounces, { email: hexEncode(email) })
  }

  SAFE_URLS.accountEmails = new SafeUrl('/account/:uid/emails', 'db.accountEmails')
  DB.prototype.accountEmails = function (uid) {
    log.trace({ op: 'DB.accountEmails', uid })

    return this.pool.get(SAFE_URLS.accountEmails, { uid })
  }

  SAFE_URLS.getSecondaryEmail = new SafeUrl('/email/:email', 'db.getSecondaryEmail')
  DB.prototype.getSecondaryEmail = function (email) {
    log.trace({ op: 'DB.getSecondaryEmail', email })

    return this.pool.get(SAFE_URLS.getSecondaryEmail, { email: hexEncode(email) })
      .catch((err) => {
        if (isNotFoundError(err)) {
          throw error.unknownSecondaryEmail()
        }
        throw err
      })
  }

  SAFE_URLS.createEmail = new SafeUrl('/account/:uid/emails', 'db.createEmail')
  DB.prototype.createEmail = function (uid, emailData) {
    log.trace({
      email: emailData.email,
      op: 'DB.createEmail',
      uid
    })

    return this.pool.post(SAFE_URLS.createEmail, { uid }, emailData)
      .catch(
        function (err) {
          if (isEmailAlreadyExistsError(err)) {
            throw error.emailExists()
          }
          throw err
        }
      )
  }

  SAFE_URLS.deleteEmail = new SafeUrl('/account/:uid/emails/:email', 'db.deleteEmail')
  DB.prototype.deleteEmail = function (uid, email) {
    log.trace({ op: 'DB.deleteEmail', uid })

    return this.pool.del(SAFE_URLS.deleteEmail, { uid, email: hexEncode(email) })
      .catch(
        function (err) {
          if (isEmailDeletePrimaryError(err)) {
            throw error.cannotDeletePrimaryEmail()
          }
          throw err
        }
      )
  }

  SAFE_URLS.createSigninCode = new SafeUrl('/signinCodes/:code', 'db.createSigninCode')
  DB.prototype.createSigninCode = function (uid, flowId) {
    log.trace({ op: 'DB.createSigninCode' })

    return random.hex(config.signinCodeSize)
      .then(code => {
        const data = { uid, createdAt: Date.now(), flowId }
        return this.pool.put(SAFE_URLS.createSigninCode, { code }, data)
          .then(() => code, err => {
            if (isRecordAlreadyExistsError(err)) {
              log.warn({ op: 'DB.createSigninCode.duplicate' })
              return this.createSigninCode(uid)
            }

            throw err
          })
      })
  }

  SAFE_URLS.consumeSigninCode = new SafeUrl('/signinCodes/:code/consume', 'db.consumeSigninCode')
  DB.prototype.consumeSigninCode = function (code) {
    log.trace({ op: 'DB.consumeSigninCode', code })

    return this.pool.post(SAFE_URLS.consumeSigninCode, { code })
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.invalidSigninCode()
        }

        throw err
      })
  }

  SAFE_URLS.resetAccountTokens = new SafeUrl('/account/:uid/resetTokens', 'db.resetAccountTokens')
  DB.prototype.resetAccountTokens = function (uid) {
    log.trace({ op: 'DB.resetAccountTokens', uid })

    return this.pool.post(SAFE_URLS.resetAccountTokens, { uid })
  }

  SAFE_URLS.createTotpToken = new SafeUrl('/totp/:uid', 'db.createTotpToken')
  DB.prototype.createTotpToken = function (uid, sharedSecret, epoch) {
    log.trace({op: 'DB.createTotpToken', uid})

    return this.pool.put(SAFE_URLS.createTotpToken, { uid }, {
      sharedSecret: sharedSecret,
      epoch: epoch
    })
      .catch(err => {
        if (isRecordAlreadyExistsError(err)) {
          throw error.totpTokenAlreadyExists()
        }
        throw err
      })
  }

  SAFE_URLS.totpToken = new SafeUrl('/totp/:uid', 'db.totpToken')
  DB.prototype.totpToken = function (uid) {
    log.trace({ op: 'DB.totpToken', uid})

    return this.pool.get(SAFE_URLS.totpToken, { uid })
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.totpTokenNotFound()
        }
        throw err
      })
  }

  SAFE_URLS.deleteTotpToken = new SafeUrl('/totp/:uid', 'db.deleteTotpToken')
  DB.prototype.deleteTotpToken = function (uid) {
    log.trace({ op: 'DB.deleteTotpToken', uid})

    return this.pool.del(SAFE_URLS.deleteTotpToken, { uid })
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.totpTokenNotFound()
        }
        throw err
      })
  }

  SAFE_URLS.updateTotpToken = new SafeUrl('/totp/:uid/update', 'db.updateTotpToken')
  DB.prototype.updateTotpToken = function (uid, data) {
    log.trace({ op: 'DB.updateTotpToken', uid, data})

    return this.pool.post(SAFE_URLS.updateTotpToken, { uid }, {
      verified: data.verified,
      enabled: data.enabled
    })
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.totpTokenNotFound()
        }
        throw err
      })
  }

  SAFE_URLS.replaceRecoveryCodes = new SafeUrl(
    '/account/:uid/recoveryCodes',
    'db.replaceRecoveryCodes'
  )
  DB.prototype.replaceRecoveryCodes = function (uid, count) {
    log.trace({op: 'DB.replaceRecoveryCodes', uid})

    return this.pool.post(SAFE_URLS.replaceRecoveryCodes, { uid }, { count })
  }

  SAFE_URLS.consumeRecoveryCode = new SafeUrl(
    '/account/:uid/recoveryCodes/:code',
    'db.consumeRecoveryCode'
  )
  DB.prototype.consumeRecoveryCode = function (uid, code) {
    log.trace({op: 'DB.consumeRecoveryCode', uid})

    return this.pool.post(SAFE_URLS.consumeRecoveryCode, { uid, code })
      .catch((err) => {
        if (isNotFoundError(err)) {
          throw error.recoveryCodeNotFound()
        }
        throw err
      })
  }

  SAFE_URLS.createRecoveryKey = new SafeUrl(
    '/account/:uid/recoveryKey',
    'db.createRecoveryKey'
  )
  DB.prototype.createRecoveryKey = function (uid, recoveryKeyId, recoveryData) {
    log.trace({op: 'DB.createRecoveryKey', uid})

    return this.pool.post(SAFE_URLS.createRecoveryKey, { uid }, { recoveryKeyId, recoveryData })
  }

  SAFE_URLS.getRecoveryKey = new SafeUrl(
    '/account/:uid/recoveryKey',
    'db.getRecoveryKey'
  )
  DB.prototype.getRecoveryKey = function (uid) {
    log.trace({op: 'DB.getRecoveryKey', uid})

    return this.pool.get(SAFE_URLS.getRecoveryKey, {uid})
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.recoveryKeyNotFound()
        }
        throw err
      })
  }

  SAFE_URLS.deleteRecoveryKey = new SafeUrl(
    '/account/:uid/recoveryKey',
    'db.deleteRecoveryKey'
  )
  DB.prototype.deleteRecoveryKey = function (uid) {
    log.trace({op: 'DB.deleteRecoveryKey', uid})

    return this.pool.del(SAFE_URLS.deleteRecoveryKey, { uid })
  }

  DB.prototype.safeRedisGet = function (key) {
    return this.redis.get(key)
      .catch(err => {
        log.error({ op: 'redis.get.error', key, err: err.message })
        // Allow callers to distinguish between the null result and connection errors
        return false
      })
  }

  // Unpacks a tokens string from Redis, with logic to recover from it being
  // invalid JSON. In this case, "recover" means "delete the data from Redis and
  // return an empty object to the caller". We've seen this situation occur once
  // in prod, but we're not sure how it came about:
  //
  //     https://github.com/mozilla/fxa-auth-server/issues/2537
  //
  DB.prototype.safeUnpackTokensFromRedis = function (uid, tokens) {
    return P.resolve()
      .then(() => unpackTokensFromRedis(tokens))
      .catch(err => {
        log.error({ op: 'db.unpackTokensFromRedis.error', err: err.message })

        if (err instanceof SyntaxError) {
          return this.redis.del(uid)
            .then(() => ({}))
        }

        throw err
      })
  }

  DB.prototype.deleteSessionTokenFromRedis = function (uid, id) {
    if (! this.redis) {
      return P.resolve()
    }

    return this.redis.update(uid, sessionTokens => {
      if (! sessionTokens) {
        return
      }

      sessionTokens = unpackTokensFromRedis(sessionTokens)

      delete sessionTokens[id]

      if (Object.keys(sessionTokens).length > 0) {
        return packTokensForRedis(sessionTokens)
      }
    })
  }

  function mergeDeviceInfoFromRedis(device, redisSessionTokens, lastAccessTimeEnabled) {
    // If there's a matching sessionToken in redis, use the more up-to-date
    // location and access-time info from there rather than from the DB.
    const token = redisSessionTokens[device.sessionTokenId]
    const mergedInfo = Object.assign({}, device, token)
    return {
      id: mergedInfo.id,
      sessionToken: mergedInfo.sessionTokenId,
      lastAccessTime: lastAccessTimeEnabled ? mergedInfo.lastAccessTime : null,
      location: mergedInfo.location,
      name: mergedInfo.name,
      type: mergedInfo.type,
      pushCallback: mergedInfo.callbackURL,
      pushPublicKey: mergedInfo.callbackPublicKey,
      pushAuthKey: mergedInfo.callbackAuthKey,
      pushEndpointExpired: !! mergedInfo.callbackIsExpired,
      availableCommands: mergedInfo.availableCommands || {},
      uaBrowser: mergedInfo.uaBrowser,
      uaBrowserVersion: mergedInfo.uaBrowserVersion,
      uaOS: mergedInfo.uaOS,
      uaOSVersion: mergedInfo.uaOSVersion,
      uaDeviceType: mergedInfo.uaDeviceType,
      uaFormFactor: mergedInfo.uaFormFactor
    }
  }

  // Reduce redis memory usage by not encoding the keys. Store properties
  // as fixed indices into arrays instead. Takes an unpacked session tokens
  // structure as its argument, returns the packed string.
  function packTokensForRedis (tokens) {
    return JSON.stringify(Object.keys(tokens).reduce((result, tokenId) => {
      const unpackedToken = tokens[tokenId]

      result[tokenId] = truncatePackedArray(REDIS_SESSION_TOKEN_PROPERTIES.map(
        (property, index) => {
          const value = unpackedToken[property]

          if (index === REDIS_SESSION_TOKEN_LOCATION_INDEX && value) {
            return truncatePackedArray(REDIS_SESSION_TOKEN_LOCATION_PROPERTIES.map(
              locationProperty => value[locationProperty]
            ))
          }

          return unpackedToken[property]
        }
      ))

      return result
    }, {}))
  }

  // Trailing null and undefined don't need to be stored.
  function truncatePackedArray (array) {
    const length = array.length
    if (length === 0) {
      return array
    }

    const item = array[length - 1]
    if (item !== null && item !== undefined) {
      return array
    }

    array.pop()

    return truncatePackedArray(array)
  }

  // Sanely unpack both the packed and raw formats from redis. Takes a redis
  // result as it's argument (may be null or a stringified mish mash of packed
  // and/or unpacked stored tokens), returns the unpacked session tokens
  // structure.
  function unpackTokensFromRedis (tokens) {
    if (! tokens) {
      return {}
    }

    tokens = JSON.parse(tokens)

    return Object.keys(tokens).reduce((result, tokenId) => {
      const packedToken = tokens[tokenId]

      if (Array.isArray(packedToken)) {
        const unpackedToken = unpackToken(packedToken, REDIS_SESSION_TOKEN_PROPERTIES)

        const location = unpackedToken.location
        if (Array.isArray(location)) {
          unpackedToken.location = unpackToken(location, REDIS_SESSION_TOKEN_LOCATION_PROPERTIES)
        }

        result[tokenId] = unpackedToken
      } else {
        result[tokenId] = packedToken
      }

      return result
    }, {})
  }

  function unpackToken (packedToken, properties) {
    return properties.reduce((result, property, index) => {
      result[property] = packedToken[index]
      return result
    }, {})
  }

  function wrapTokenNotFoundError (err) {
    if (isNotFoundError(err)) {
      err = error.invalidToken('The authentication token could not be found')
    }
    return err
  }

  function hexEncode(str) {
    return Buffer.from(str, 'utf8').toString('hex')
  }

  return DB
}

// Note that these errno's are defined in the fxa-auth-db-mysql repo
// and don't necessarily match the errnos in this repo...

function isRecordAlreadyExistsError (err) {
  return err.statusCode === 409 && err.errno === 101
}

function isIncorrectPasswordError (err) {
  return err.statusCode === 400 && err.errno === 103
}

function isNotFoundError (err) {
  return err.statusCode === 404 && err.errno === 116
}

function isEmailAlreadyExistsError (err) {
  return err.statusCode === 409 && err.errno === 101
}

function isEmailDeletePrimaryError (err) {
  return err.statusCode === 400 && err.errno === 136
}

function isExpiredTokenVerificationCodeError (err) {
  return err.statusCode === 400 && err.errno === 137
}
