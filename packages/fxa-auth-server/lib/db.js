/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('./error')
const P = require('./promise')
const Pool = require('./pool')
const userAgent = require('./userAgent')

const bufferize = require('./crypto/butil').bufferize
const random = require('./crypto/random')

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

  function DB(options) {
    this.pool = new Pool(options.url)
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
      '/account/' + data.uid.toString('hex'),
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
    return SessionToken.create(userAgent.call(authToken, userAgentString, log))
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
    verifyHash = Buffer(verifyHash).toString('hex')
    log.trace({ op: 'DB.checkPassword', uid: uid, verifyHash: verifyHash })
    return this.pool.post('/account/' + uid.toString('hex') + '/checkPassword',
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
    return this.pool.head('/emailRecord/' + Buffer(email, 'utf8').toString('hex'))
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
    return this.pool.get('/account/' + uid.toString('hex') + '/sessions')
      .then(
        function (body) {
          return body.map(function (sessionToken) {
            return bufferize(sessionToken, {
              ignore: [
                'uaBrowser',
                'uaBrowserVersion',
                'uaOS',
                'uaOSVersion',
                'uaDeviceType'
              ]
            })
          })
        }
      )
  }

  DB.prototype.sessionToken = function (id) {
    log.trace({ op: 'DB.sessionToken', id: id })
    return this.pool.get('/sessionToken/' + id.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body, {
            ignore: [
              'uaBrowser',
              'uaBrowserVersion',
              'uaOS',
              'uaOSVersion',
              'uaDeviceType'
            ]
          })
          return SessionToken.fromHex(data.tokenData, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  DB.prototype.sessionTokenWithVerificationStatus = function (id) {
    log.trace({ op: 'DB.sessionTokenWithVerificationStatus', id: id })
    return this.pool.get('/sessionToken/' + id.toString('hex') + '/verified')
      .then(
        function (body) {
          var data = bufferize(body, {
            ignore: [
              'uaBrowser',
              'uaBrowserVersion',
              'uaOS',
              'uaOSVersion',
              'uaDeviceType'
            ]
          })
          return SessionToken.fromHex(data.tokenData, data)
        },
        function (err) {
          err = wrapTokenNotFoundError(err)
          throw err
        }
      )
  }

  DB.prototype.keyFetchToken = function (id) {
    log.trace({ op: 'DB.keyFetchToken', id: id })
    return this.pool.get('/keyFetchToken/' + id.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
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
    return this.pool.get('/keyFetchToken/' + id.toString('hex') + '/verified')
      .then(
        function (body) {
          var data = bufferize(body)
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
    return this.pool.get('/accountResetToken/' + id.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
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
    return this.pool.get('/passwordForgotToken/' + id.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
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
    return this.pool.get('/passwordChangeToken/' + id.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
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
    return this.pool.get('/emailRecord/' + Buffer(email, 'utf8').toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
          data.emailVerified = !! data.emailVerified
          return data
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
    log.trace({ op: 'DB.account', uid: uid })
    return this.pool.get('/account/' + uid.toString('hex'))
      .then(
        function (body) {
          var data = bufferize(body)
          data.emailVerified = !! data.emailVerified
          return data
        },
        function (err) {
          if (isNotFoundError(err)) {
            err = error.unknownAccount()
          }
          throw err
        }
      )
  }

  DB.prototype.devices = function (uid) {
    log.trace({ op: 'DB.devices', uid: uid })

    return this.pool.get('/account/' + uid.toString('hex') + '/devices')
      .then(
        function (body) {
          return body.map(function (item) {
            return bufferize({
              id: item.id,
              sessionToken: item.sessionTokenId,
              lastAccessTime: marshallLastAccessTime(item.lastAccessTime, uid, item.email),
              name: item.name,
              type: item.type,
              pushCallback: item.callbackURL,
              pushPublicKey: item.callbackPublicKey,
              pushAuthKey: item.callbackAuthKey,
              uaBrowser: item.uaBrowser,
              uaBrowserVersion: item.uaBrowserVersion,
              uaOS: item.uaOS,
              uaOSVersion: item.uaOSVersion,
              uaDeviceType: item.uaDeviceType
            }, {
              ignore: [
                'name', 'type', 'pushCallback', 'pushPublicKey', 'pushAuthKey',
                'uaBrowser', 'uaBrowserVersion', 'uaOS', 'uaOSVersion', 'uaDeviceType'
              ]
            })
          })
        },
        function (err) {
          if (isNotFoundError(err)) {
            throw error.unknownAccount()
          }
          throw err
        }
      )
  }

  function marshallLastAccessTime (lastAccessTime, uid, email) {
    // Updating lastAccessTime on session tokens may not be enabled.
    // If it isn't, return null instead of the timestamp so that the
    // content server knows not to display it to users.
    if (features.isLastAccessTimeEnabledForUser(uid, email)) {
      return lastAccessTime
    }

    return null
  }

  DB.prototype.sessionWithDevice = function (id) {
    log.trace({ op: 'DB.sessionWithDevice', id: id })
    return this.pool.get('/sessionToken/' + id.toString('hex') + '/device')
    .then(
      function (body) {
        var data = bufferize(body, {
          ignore: [
            'uaBrowser',
            'uaBrowserVersion',
            'uaOS',
            'uaOSVersion',
            'uaDeviceType'
          ]
        })
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

  DB.prototype.updateSessionToken = function (token, userAgentString) {
    log.trace({ op: 'DB.updateSessionToken', uid: token && token.uid })

    if (! token.update(userAgentString)) {
      return P.resolve()
    }

    return this.pool.post('/sessionToken/' + token.id + '/update', {
      uaBrowser: token.uaBrowser,
      uaBrowserVersion: token.uaBrowserVersion,
      uaOS: token.uaOS,
      uaOSVersion: token.uaOSVersion,
      uaDeviceType: token.uaDeviceType,
      lastAccessTime: token.lastAccessTime
    })
  }

  DB.prototype.createDevice = function (uid, sessionTokenId, deviceInfo) {
    log.trace({ op: 'DB.createDevice', uid: uid, id: deviceInfo.id })

    return random(16)
      .then(id => {
        deviceInfo.id = id
        deviceInfo.createdAt = Date.now()
        return this.pool.put(
          '/account/' + uid.toString('hex') +
          '/device/' + deviceInfo.id.toString('hex'),
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
                  const isDuplicateDeviceId = devices.reduce((is, device) => {
                    is || device.id.toString('hex') === deviceInfo.id.toString('hex')
                  }, false)

                  if (isDuplicateDeviceId) {
                    return this.createDevice(uid, sessionTokenId, deviceInfo)
                  }

                  throw error.deviceSessionConflict()
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
      '/account/' + uid.toString('hex') +
      '/device/' + deviceInfo.id.toString('hex') + '/update',
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
      function (result) {
        return deviceInfo
      },
      function (err) {
        if (isNotFoundError(err)) {
          throw error.unknownDevice()
        }
        if (isRecordAlreadyExistsError(err)) {
          throw error.deviceSessionConflict()
        }
        throw err
      }
    )
  }

  // DELETE

  DB.prototype.deleteAccount = function (authToken) {
    log.trace({ op: 'DB.deleteAccount', uid: authToken && authToken.uid })
    return this.pool.del('/account/' + authToken.uid.toString('hex'))
  }

  DB.prototype.deleteSessionToken = function (sessionToken) {
    log.trace(
      {
        op: 'DB.deleteSessionToken',
        id: sessionToken && sessionToken.id,
        uid: sessionToken && sessionToken.uid
      }
    )
    return this.pool.del('/sessionToken/' + sessionToken.id)
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
      '/account/' + uid.toString('hex') + '/device/' + deviceId.toString('hex')
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
      '/account/' + uid.toString('hex') + '/tokens/' + tokenVerificationId.toString('hex') + '/device'
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
    return this.pool.post(
      '/account/' + accountResetToken.uid.toString('hex') + '/reset',
      data
    )
  }

  DB.prototype.verifyEmail = function (account, emailCode) {
    log.trace({
      op: 'DB.verifyEmail',
      uid: account && account.uid,
      emailCode: emailCode
    })
    return this.pool.post('/account/' + account.uid.toString('hex') + '/verifyEmail/' + emailCode.toString('hex'))
  }

  DB.prototype.verifyTokens = function (tokenVerificationId, accountData) {
    log.trace({ op: 'DB.verifyTokens', tokenVerificationId: tokenVerificationId })
    return this.pool.post(
      '/tokens/' + tokenVerificationId.toString('hex') + '/verify',
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
      '/account/' + uid.toString('hex') + '/locale',
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

    return this.pool.get('/securityEvents/' + params.uid.toString('hex') + '/ip/' + params.ipAddr)
  }

  DB.prototype.createUnblockCode = function (uid) {
    log.trace({
      op: 'DB.createUnblockCode',
      uid: uid
    })
    return UnblockCode()
      .then(
        (unblock) => {
          return this.pool.put('/account/' + uid.toString('hex') + '/unblock/' + unblock)
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
    return this.pool.del('/account/' + uid.toString('hex') + '/unblock/' + code)
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

    return this.pool.get('/emailBounces/' + Buffer(email, 'utf8').toString('hex'))
  }

  DB.prototype.accountEmails = function (uid) {
    log.trace({
      op: 'DB.accountEmails',
      uid: uid
    })

    return this.pool.get('/account/' + uid.toString('hex') + '/emails')
  }

  DB.prototype.getSecondaryEmail = function (email) {
    log.trace({
      op: 'DB.getSecondaryEmail',
      email: email
    })

    return this.pool.get('/email/' + Buffer(email, 'utf8').toString('hex'))
      .then((body) => {
        return bufferize(body)
      })
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

    return this.pool.post('/account/' + uid.toString('hex') + '/emails', emailData)
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

    return this.pool.del('/account/' + uid.toString('hex') + '/emails/' + email)
      .catch(
        function (err) {
          if (isEmailDeletePrimaryError(err)) {
            throw error.cannotDeletePrimaryEmail()
          }
          throw err
        }
      )
  }

  DB.prototype.createSigninCode = function (uid) {
    log.trace({ op: 'DB.createSigninCode' })

    return random(config.signinCodeSize)
      .then(code => {
        const data = { uid, createdAt: Date.now() }
        return this.pool.put(`/signinCodes/${code.toString('hex')}`, data)
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

    return this.pool.post(`/signinCodes/${code.toString('hex')}/consume`)
      .catch(err => {
        if (isNotFoundError(err)) {
          throw error.invalidSigninCode()
        }

        throw err
      })
  }

  function wrapTokenNotFoundError (err) {
    if (isNotFoundError(err)) {
      err = error.invalidToken('The authentication token could not be found')
    }
    return err
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
