/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('./error')
const P = require('./promise')
const Pool = require('./pool')
const userAgent = require('./userAgent')

const random = require('./crypto/random')
const redis = require('redis')
const geodb = require('../lib/geodb')

P.promisifyAll(redis.RedisClient.prototype)
P.promisifyAll(redis.Multi.prototype)

module.exports = (
  config,
  log,
  Token,
  UnblockCode
  ) => {

  const features = require('./features')(config)
  const SessionToken = Token.SessionToken
  const KeyFetchToken = Token.KeyFetchToken
  const AccountResetToken = Token.AccountResetToken
  const PasswordForgotToken = Token.PasswordForgotToken
  const PasswordChangeToken = Token.PasswordChangeToken
  const getGeoData = geodb(log)
  const MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE = config.tokenLifetimes.sessionTokenWithoutDevice

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
    this.pool = new Pool(options.url)
    if (config.redis.enabled) {
      const redisConfig = {
        host: config.redis.host,
        port: config.redis.port,
        prefix: config.redis.sessionsKeyPrefix
      }
      log.info({op: 'db.redis.enabled', config: redisConfig})
      this.redis = redis.createClient(redisConfig)
    } else {
      this.redis = false
      log.info({op: 'db.redis.disabled'})
    }
  }

  DB.connect = function (options) {
    return P.resolve(new DB(options))
  }

  DB.prototype.close = function () {
    return P.resolve(this.pool.close())
  }

  DB.prototype.ping = function () {
    return this.pool.get('/__heartbeat__')
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
    return this.pool.put(
      '/account/' + data.uid,
      data
    )
    .then(
      function () {
        return data
      },
      function (err) {
        if (isRecordAlreadyExistsError(err)) {
          err = error.accountExists(data.email)
        }
        throw err
      }
    )
  }

  DB.prototype.createSessionToken = function (authToken, userAgentString) {
    log.trace({ op: 'DB.createSessionToken', uid: authToken && authToken.uid })
    return SessionToken.create(userAgent.call(authToken, userAgentString))
      .then(
        function (sessionToken) {
          return this.pool.put(
            '/sessionToken/' + sessionToken.id,
            {
              tokenId: sessionToken.tokenId,
              data: sessionToken.data,
              uid: sessionToken.uid,
              createdAt: sessionToken.createdAt,
              uaBrowser: sessionToken.uaBrowser,
              uaBrowserVersion: sessionToken.uaBrowserVersion,
              uaOS: sessionToken.uaOS,
              uaOSVersion: sessionToken.uaOSVersion,
              uaDeviceType: sessionToken.uaDeviceType,
              mustVerify: sessionToken.mustVerify,
              tokenVerificationId: sessionToken.tokenVerificationId
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
          return this.pool.put(
            '/keyFetchToken/' + keyFetchToken.id,
            {
              tokenId: keyFetchToken.tokenId,
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

  DB.prototype.createPasswordForgotToken = function (emailRecord) {
    log.trace({ op: 'DB.createPasswordForgotToken', uid: emailRecord && emailRecord.uid })
    return PasswordForgotToken.create(emailRecord)
      .then(
        function (passwordForgotToken) {
          return this.pool.put(
            '/passwordForgotToken/' + passwordForgotToken.id,
            {
              tokenId: passwordForgotToken.tokenId,
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

  DB.prototype.createPasswordChangeToken = function (data) {
    log.trace({ op: 'DB.createPasswordChangeToken', uid: data.uid })
    return PasswordChangeToken.create(data)
      .then(
        function (passwordChangeToken) {
          return this.pool.put(
            '/passwordChangeToken/' + passwordChangeToken.id,
            {
              tokenId: passwordChangeToken.tokenId,
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

  DB.prototype.checkPassword = function (uid, verifyHash) {
    log.trace({ op: 'DB.checkPassword', uid: uid, verifyHash: verifyHash })
    return this.pool.post('/account/' + uid + '/checkPassword',
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
    return this.pool.head('/emailRecord/' + hexEncode(email))
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

  DB.prototype.sessions = function (uid) {
    log.trace({ op: 'DB.sessions', uid: uid })
    const promises = [
      this.pool.get('/account/' + uid + '/sessions')
    ]

    if (this.redis) {
      promises.push(this.redis.getAsync(uid))
    }

    return P.all(promises)
      .spread((mysqlSessionTokens, redisTokens) => {
        if (MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE) {
          // Filter out any expired sessions
          mysqlSessionTokens = mysqlSessionTokens.filter(sessionToken => {
            if (sessionToken.deviceId) {
              return true
            }

            return sessionToken.createdAt > Date.now() - MAX_AGE_SESSION_TOKEN_WITHOUT_DEVICE
          })
        }
        // for each db session token, if there is a matching redis token
        // overwrite the properties of the db token with the redis token values
        const redisSessionTokens = redisTokens ? JSON.parse(redisTokens) : {}
        const sessions = mysqlSessionTokens.map((sessionToken) => {
          const redisToken = redisSessionTokens[sessionToken.tokenId]
          const mergedToken = Object.assign({}, sessionToken, redisToken)
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

  DB.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'DB.keyFetchToken', id: id })
    return this.pool.get('/keyFetchToken/' + id)
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

  DB.prototype.keyFetchTokenWithVerificationStatus = function (id) {
    log.trace({ op: 'DB.keyFetchTokenWithVerificationStatus', id: id })
    return this.pool.get('/keyFetchToken/' + id + '/verified')
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

  DB.prototype.accountResetToken = function (id) {
    log.trace({ op: 'DB.accountResetToken', id: id })
    return this.pool.get('/accountResetToken/' + id)
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

  DB.prototype.passwordForgotToken = function (id) {
    log.trace({ op: 'DB.passwordForgotToken', id: id })
    return this.pool.get('/passwordForgotToken/' + id)
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

  DB.prototype.passwordChangeToken = function (id) {
    log.trace({ op: 'DB.passwordChangeToken', id: id })
    return this.pool.get('/passwordChangeToken/' + id)
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

  DB.prototype.emailRecord = function (email) {
    log.trace({ op: 'DB.emailRecord', email: email })
    return this.pool.get('/emailRecord/' + hexEncode(email))
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

  DB.prototype.accountRecord = function (email) {
    log.trace({op: 'DB.accountFromEmail', email: email})
    return this.pool.get('/email/' + hexEncode(email) + '/account')
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

  DB.prototype.setPrimaryEmail = function (uid, email) {
    log.trace({op: 'DB.accountFromEmail', email: email})
    return this.pool.post('/email/' + Buffer(email, 'utf8').toString('hex') + '/account/' + uid)
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

  DB.prototype.account = function (uid) {
    log.trace({op: 'DB.account', uid: uid})
    return this.pool.get('/account/' + uid)
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

  DB.prototype.devices = function (uid) {
    log.trace({ op: 'DB.devices', uid: uid })
    const promises = [
      this.pool.get('/account/' + uid + '/devices')
    ]

    if (this.redis) {
      promises.push(this.redis.getAsync(uid))
    }
    return P.all(promises)
      .spread((devices, redisTokens) => {
        const redisSessionTokens = redisTokens ? JSON.parse(redisTokens) : {}
        log.info({
          op: 'db.devices.redisSessionTokens',
          hasRedisTokens: !! redisSessionTokens.length,
          numRedisTokens: redisSessionTokens.length
        })
        // for each device, if there is a redis token with a matching tokenId
        // overwrite device's ua properties and lastAccessTime with redis token values
        return devices.map(device => {
          const token = redisSessionTokens[device.sessionTokenId]
          const mergedInfo = Object.assign({}, device, token)
          return {
            id: device.id,
            sessionToken: device.sessionTokenId,
            lastAccessTime: mergedInfo.lastAccessTime,
            name: device.name,
            type: device.type,
            pushCallback: device.callbackURL,
            pushPublicKey: device.callbackPublicKey,
            pushAuthKey: device.callbackAuthKey,
            uaBrowser: mergedInfo.uaBrowser,
            uaBrowserVersion: mergedInfo.uaBrowserVersion,
            uaOS: mergedInfo.uaOS,
            uaOSVersion: mergedInfo.uaOSVersion,
            uaDeviceType: mergedInfo.uaDeviceType
          }
        })
      })
      .catch(err =>{
        if (isNotFoundError(err)) {
          throw error.unknownAccount()
        }
        throw err
      })
  }

  DB.prototype.sessionToken = function (id) {
    log.trace({ op: 'DB.sessionToken', id: id })
    return this.pool.get('/sessionToken/' + id + '/device')
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

  DB.prototype.updatePasswordForgotToken = function (token) {
    log.trace({ op: 'DB.udatePasswordForgotToken', uid: token && token.uid })
    return this.pool.post(
      '/passwordForgotToken/' + token.id + '/update',
      {
        tries: token.tries
      }
    )
  }

  DB.prototype.updateSessionToken = function (token, userAgentString, ip) {
    log.trace({ op: 'DB.updateSessionToken', uid: token && token.uid })

    const uid = token.uid
    if (! this.redis || ! features.isLastAccessTimeEnabledForUser(uid)) {
      return P.resolve()
    }

    token.update(userAgentString)
    const newToken = {
      tokenId: token.id,
      uid: uid,
      uaBrowser: token.uaBrowser,
      uaBrowserVersion: token.uaBrowserVersion,
      uaOS: token.uaOS,
      uaOSVersion: token.uaOSVersion,
      uaDeviceType: token.uaDeviceType,
      lastAccessTime: token.lastAccessTime,
      createdAt: token.createdAt
    }
    let sessionTokens
    return getGeoData(ip)
    .then((res) => {
      const state = res.location && res.location.state
      const country = res.location && res.location.country
      newToken.location = {state, country}
    })
    .catch(err => {
      newToken.location = null
    })
    // get the object of session tokens associated with the given uid
    .then(() => this.redis.getAsync(uid))
    .then(res => {
      // update the hash with the new token
      sessionTokens = res ? JSON.parse(res) : {}
      sessionTokens[token.id] = newToken
      return sessionTokens
    })
    // add new updated token into array, and set the resulting array as the new value
    .then(() => {
      return this.redis.setAsync(uid, JSON.stringify(sessionTokens))
    })
    .then(() => sessionTokens)
  }

  DB.prototype.createDevice = function (uid, sessionTokenId, deviceInfo) {
    log.trace({ op: 'DB.createDevice', uid: uid, id: deviceInfo.id })

    return random.hex(16)
      .then(id => {
        deviceInfo.id = id
        deviceInfo.createdAt = Date.now()
        return this.pool.put(
          '/account/' + uid +
          '/device/' + deviceInfo.id,
          {
            sessionTokenId: sessionTokenId,
            createdAt: deviceInfo.createdAt,
            name: deviceInfo.name,
            type: deviceInfo.type,
            callbackURL: deviceInfo.pushCallback,
            callbackPublicKey: deviceInfo.pushPublicKey,
            callbackAuthKey: deviceInfo.pushAuthKey
          }
        )
      })
      .then(
        () => deviceInfo,
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

  DB.prototype.updateDevice = function (uid, sessionTokenId, deviceInfo) {
    log.trace({ op: 'DB.updateDevice', uid: uid, id: deviceInfo.id })
    return this.pool.post(
      '/account/' + uid +
      '/device/' + deviceInfo.id + '/update',
      {
        sessionTokenId: sessionTokenId,
        name: deviceInfo.name,
        type: deviceInfo.type,
        callbackURL: deviceInfo.pushCallback,
        callbackPublicKey: deviceInfo.pushPublicKey,
        callbackAuthKey: deviceInfo.pushAuthKey
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

  DB.prototype.deleteAccount = function (authToken) {
    log.trace({ op: 'DB.deleteAccount', uid: authToken && authToken.uid })
    const promises = [this.pool.del('/account/' + authToken.uid)]
    if (this.redis) {
      promises.push(this.redis.del(authToken.uid))
    }
    return P.all(promises)
  }

  DB.prototype.deleteSessionToken = function (sessionToken) {
    const uid = sessionToken && sessionToken.uid
    log.trace(
      {
        op: 'DB.deleteSessionToken',
        id: sessionToken && sessionToken.id,
        uid: uid
      }
    )
    const promises = [this.pool.del('/sessionToken/' + sessionToken.id)]
    if (this.redis) {
      promises.push(this.redis.getAsync(uid))
    }
    return P.all(promises)
      .spread((deleteRes, redisTokens) => {
        if (this.redis) {
          const redisSessionTokens = redisTokens ? JSON.parse(redisTokens) : {}
          delete redisSessionTokens[sessionToken.id]
          return this.redis.setAsync(uid, JSON.stringify(redisSessionTokens))
        }
        return deleteRes
      })
  }

  DB.prototype.deleteKeyFetchToken = function (keyFetchToken) {
    log.trace(
      {
        op: 'DB.deleteKeyFetchToken',
        id: keyFetchToken && keyFetchToken.id,
        uid: keyFetchToken && keyFetchToken.uid
      }
    )
    return this.pool.del('/keyFetchToken/' + keyFetchToken.id)
  }

  DB.prototype.deleteAccountResetToken = function (accountResetToken) {
    log.trace(
      {
        op: 'DB.deleteAccountResetToken',
        id: accountResetToken && accountResetToken.id,
        uid: accountResetToken && accountResetToken.uid
      }
    )
    return this.pool.del('/accountResetToken/' + accountResetToken.id)
  }

  DB.prototype.deletePasswordForgotToken = function (passwordForgotToken) {
    log.trace(
      {
        op: 'DB.deletePasswordForgotToken',
        id: passwordForgotToken && passwordForgotToken.id,
        uid: passwordForgotToken && passwordForgotToken.uid
      }
    )
    return this.pool.del('/passwordForgotToken/' + passwordForgotToken.id)
  }

  DB.prototype.deletePasswordChangeToken = function (passwordChangeToken) {
    log.trace(
      {
        op: 'DB.deletePasswordChangeToken',
        id: passwordChangeToken && passwordChangeToken.id,
        uid: passwordChangeToken && passwordChangeToken.uid
      }
    )
    return this.pool.del('/passwordChangeToken/' + passwordChangeToken.id)
  }

  DB.prototype.deleteDevice = function (uid, deviceId) {
    log.trace(
      {
        op: 'DB.deleteDevice',
        id: deviceId,
        uid: uid
      }
    )
    return this.pool.del(
      '/account/' + uid + '/device/' + deviceId
    )
    .catch(
      function (err) {
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        throw err
      }
    )
  }

  DB.prototype.deviceFromTokenVerificationId = function (uid, tokenVerificationId) {
    log.trace(
      {
        op: 'DB.deviceFromTokenVerificationId',
        uid: uid,
        tokenVerificationId: tokenVerificationId
      }
    )
    return this.pool.get(
      '/account/' + uid + '/tokens/' + tokenVerificationId + '/device'
    )
    .catch(
      function (err) {
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        throw err
      }
    )
  }

  // BATCH

  DB.prototype.resetAccount = function (accountResetToken, data) {
    log.trace({ op: 'DB.resetAccount', uid: accountResetToken && accountResetToken.uid })
    data.verifierSetAt = Date.now()
    const promises = [this.pool.post(
      '/account/' + accountResetToken.uid + '/reset',
      data
    )]
    if (this.redis) {
      promises.push(this.redis.del(accountResetToken.uid))
    }
    return P.all(promises)
  }

  DB.prototype.verifyEmail = function (account, emailCode) {
    log.trace({
      op: 'DB.verifyEmail',
      uid: account && account.uid,
      emailCode: emailCode
    })
    return this.pool.post('/account/' + account.uid + '/verifyEmail/' + emailCode)
  }

  DB.prototype.verifyTokens = function (tokenVerificationId, accountData) {
    log.trace({ op: 'DB.verifyTokens', tokenVerificationId: tokenVerificationId })
    return this.pool.post(
      '/tokens/' + tokenVerificationId + '/verify',
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

  DB.prototype.forgotPasswordVerified = function (passwordForgotToken) {
    log.trace({ op: 'DB.forgotPasswordVerified', uid: passwordForgotToken && passwordForgotToken.uid })
    return AccountResetToken.create({ uid: passwordForgotToken.uid })
      .then(
        function (accountResetToken) {
          return this.pool.post(
            '/passwordForgotToken/' + passwordForgotToken.id + '/verified',
            {
              tokenId: accountResetToken.tokenId,
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

  DB.prototype.updateLocale = function (uid, locale) {
    log.trace({ op: 'DB.updateLocale', uid: uid, locale: locale })
    return this.pool.post(
      '/account/' + uid + '/locale',
      { locale: locale }
    )
  }

  // VERIFICATION REMINDERS

  DB.prototype.createVerificationReminder = function (reminderData) {
    log.trace({
      op: 'DB.createVerificationReminder',
      reminderData: reminderData
    })

    return this.pool.post('/verificationReminders', reminderData)
  }

  DB.prototype.deleteVerificationReminder = function (reminderData) {
    log.trace({
      op: 'DB.deleteVerificationReminder',
      reminderData: reminderData
    })

    return this.pool.del('/verificationReminders', reminderData)
  }

  DB.prototype.securityEvent = function (event) {
    log.trace({
      op: 'DB.securityEvent',
      securityEvent: event
    })

    return this.pool.post('/securityEvents', event)
  }

  DB.prototype.securityEvents = function (params) {
    log.trace({
      op: 'DB.securityEvents',
      params: params
    })

    return this.pool.get('/securityEvents/' + params.uid + '/ip/' + params.ipAddr)
  }

  DB.prototype.createUnblockCode = function (uid) {
    log.trace({
      op: 'DB.createUnblockCode',
      uid: uid
    })
    return UnblockCode()
      .then(
        (unblock) => {
          return this.pool.put('/account/' + uid + '/unblock/' + unblock)
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

  DB.prototype.consumeUnblockCode = function (uid, code) {
    log.trace({
      op: 'DB.consumeUnblockCode',
      uid: uid
    })
    return this.pool.del('/account/' + uid + '/unblock/' + code)
      .catch(
        function (err) {
          if (isNotFoundError(err)) {
            throw error.invalidUnblockCode()
          }
          throw err
        }
      )
  }

  DB.prototype.createEmailBounce = function (bounceData) {
    log.trace({
      op: 'DB.createEmailBounce',
      bouceData: bounceData
    })

    return this.pool.post('/emailBounces', bounceData)
  }

  DB.prototype.emailBounces = function (email) {
    log.trace({
      op: 'DB.emailBounces',
      email: email
    })

    return this.pool.get('/emailBounces/' + hexEncode(email))
  }

  DB.prototype.accountEmails = function (uid) {
    log.trace({
      op: 'DB.accountEmails',
      uid: uid
    })

    return this.pool.get('/account/' + uid + '/emails')
  }

  DB.prototype.getSecondaryEmail = function (email) {
    log.trace({
      op: 'DB.getSecondaryEmail',
      email: email
    })

    return this.pool.get('/email/' + hexEncode(email))
      .catch((err) => {
        if (isNotFoundError(err)) {
          throw error.unknownSecondaryEmail()
        }
        throw err
      })
  }

  DB.prototype.createEmail = function (uid, emailData) {
    log.trace({
      email: emailData.email,
      op: 'DB.createEmail',
      uid: emailData.uid
    })

    return this.pool.post('/account/' + uid + '/emails', emailData)
      .catch(
        function (err) {
          if (isEmailAlreadyExistsError(err)) {
            throw error.emailExists()
          }
          throw err
        }
      )
  }

  DB.prototype.deleteEmail = function (uid, email) {
    log.trace({
      op: 'DB.deleteEmail',
      uid: uid
    })

    return this.pool.del('/account/' + uid + '/emails/' + email)
      .catch(
        function (err) {
          if (isEmailDeletePrimaryError(err)) {
            throw error.cannotDeletePrimaryEmail()
          }
          throw err
        }
      )
  }

  DB.prototype.createSigninCode = function (uid, flowId) {
    log.trace({ op: 'DB.createSigninCode' })

    return random.hex(config.signinCodeSize)
      .then(code => {
        const data = { uid, createdAt: Date.now(), flowId }
        return this.pool.put(`/signinCodes/${code}`, data)
          .then(() => code, err => {
            if (isRecordAlreadyExistsError(err)) {
              log.warn({ op: 'DB.createSigninCode.duplicate' })
              return this.createSigninCode(uid)
            }

            throw err
          })
      })
  }

  DB.prototype.consumeSigninCode = function (code) {
    log.trace({ op: 'DB.consumeSigninCode', code })

    return this.pool.post(`/signinCodes/${code}/consume`)
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.invalidSigninCode()
        }

        throw err
      })
  }

  DB.prototype.resetAccountTokens = function (uid) {
    log.trace({ op: 'DB.resetAccountTokens', uid })

    return this.pool.post(`/account/${uid}/resetTokens`)
  }

  function wrapTokenNotFoundError (err) {
    if (isNotFoundError(err)) {
      err = error.invalidToken('The authentication token could not be found')
    }
    return err
  }

  function hexEncode(str) {
    return Buffer(str, 'utf8').toString('hex')
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
