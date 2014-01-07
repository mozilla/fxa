/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = require('./validators').HEX_STRING
var LAZY_EMAIL = require('./validators').LAZY_EMAIL

var P = require('p-promise')
var scrypt = require('../crypto/scrypt')
var hkdf = require('../crypto/hkdf')
var butil = require('../crypto/butil')

module.exports = function (log, crypto, P, uuid, isA, error, db, mailer, isProduction) {

  var routes = [
    {
      method: 'POST',
      path: '/account/create',
      config: {
        description:
          "Creates an account associated with an email address, " +
          "passing along SRP information (salt and verifier) " +
          "and a wrapped key (used for class B data storage).",
        tags: ["srp", "account"],
        validate: {
          payload: {
            email: isA.String().max(255).regex(LAZY_EMAIL).required(),
            authPW: isA.String().min(64).max(64).regex(HEX_STRING).required(),
            preVerified: isA.Boolean(),
            service: isA.String().max(16).alphanum().optional(),
          }
        },
        handler: function accountCreate(request) {
          log.begin('Account.create', request)
          var form = request.payload
          var email = form.email
          var authSalt = crypto.randomBytes(32)
          var authPW = Buffer(form.authPW, 'hex')

          db.accountExists(email)
            .then(
              function (exists) {
                if (exists) {
                  throw error.accountExists(email)
                }
              }
            )
            .then(
              function () {
                return scrypt.hash(authPW, authSalt)
              }
            )
            .then(
              function (stretched) {
                return hkdf(stretched, 'verifyHash', null, 32)
              }
            )
            .then(
              function (verifyHash) {
                return db.createAccount(
                  {
                    uid: uuid.v4('binary'),
                    email: email,
                    emailCode: crypto.randomBytes(4).toString('hex'),
                    verified: form.preVerified || false,
                    kA: crypto.randomBytes(32),
                    wrapWrapKb: crypto.randomBytes(32),
                    devices: {},
                    accountResetToken: null,
                    passwordForgotToken: null,
                    authSalt: authSalt,
                    verifyHash: verifyHash
                  }
                )
              }
            )
            .then(
              function (account) {
                if (account.verified) {
                  return P(account)
                }
                return mailer.sendVerifyCode(
                  account,
                  account.emailCode,
                  form.service,
                  request.app.preferredLang
                )
                .then(function () { return account })
              }
            )
            .then(
              function (account) {
                log.security({ event: 'account-create-success', uid: account.uid });
                return account
              },
              function (err) {
                log.security({ event: 'account-create-failure', err: err });
                throw err
              }
            )
            .done(
              function (account) {
                request.reply(
                  {
                    uid: account.uid.toString('hex')
                  }
                )
              },
              request.reply.bind(request)
            )
        }
      }
    },
    {
      method: 'POST',
      path: '/account/login',
      config: {
        description: 'login with a password and get a keyFetchToken',
        handler: function (request) {
          log.begin('Account.login', request)
          var form = request.payload
          var authPW = Buffer(form.authPW, 'hex')
          db.emailRecord(form.email)
            .then(
              function (emailRecord) {
                if (!emailRecord) {
                  throw error.unknownAccount(form.email)
                }
                return scrypt.hash(authPW, emailRecord.authSalt)
                  .then(
                    function (stretched) {
                      return hkdf(stretched, 'verifyHash', null, 32)
                        .then(
                          function (verifyHash) {
                            if (!butil.buffersAreEqual(verifyHash, emailRecord.verifyHash)) {
                              throw error.incorrectPassword(emailRecord.rawEmail)
                            }
                            return db.createSessionToken(
                              {
                                uid: emailRecord.uid,
                                email: emailRecord.email,
                                rawEmail: emailRecord.rawEmail,
                                emailCode: emailRecord.emailCode,
                                verified: emailRecord.verified
                              }
                            )
                          }
                        )
                        .then(
                          function (sessionToken) {
                            log.security({ event: 'login-success', uid: sessionToken.uid })
                            log.security({ event: 'session-create' })
                            return sessionToken
                          },
                          function (err) {
                            log.security({ event: 'login-failure', err: err, email: form.email })
                            throw err
                          }
                        )
                        .then(
                          function (sessionToken) {
                            if (request.query.keys !== 'true') {
                              return P({
                                sessionToken: sessionToken
                              })
                            }
                            return hkdf(stretched, 'wrapwrapKey', null, 32)
                              .then(
                                function (wrapWrapKey) {
                                  return butil.xorBuffers(wrapWrapKey, emailRecord.wrapWrapKb)
                                }
                              )
                              .then(
                                function (wrapKb) {
                                  return db.createKeyFetchToken(
                                    {
                                      uid: emailRecord.uid,
                                      kA: emailRecord.kA,
                                      wrapKb: wrapKb,
                                      verified: emailRecord.verified
                                    }
                                  )
                                }
                              )
                              .then(
                                function (keyFetchToken) {
                                  return {
                                    sessionToken: sessionToken,
                                    keyFetchToken: keyFetchToken
                                  }
                                }
                              )
                          }
                        )
                    }
                  )
              }
            )
            .done(
              function (tokens) {
                request.reply(
                  {
                    uid: tokens.sessionToken.uid.toString('hex'),
                    sessionToken: tokens.sessionToken.data.toString('hex'),
                    keyFetchToken: tokens.keyFetchToken ? tokens.keyFetchToken.data.toString('hex') : undefined,
                    verified: tokens.sessionToken.verified
                  }
                )
              },
              function (err) {
                request.reply(err)
              }
            )
        },
        validate: {
          payload: {
            email: isA.String().max(255).regex(LAZY_EMAIL).required(),
            authPW: isA.String().min(64).max(64).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              uid: isA.String().regex(HEX_STRING).required(),
              sessionToken: isA.String().regex(HEX_STRING).required(),
              keyFetchToken: isA.String().regex(HEX_STRING).optional(),
              verified: isA.Boolean().required()
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/account/devices',
      config: {
        description:
          "get the collection of devices currently authenticated and syncing",
        auth: {
          strategy: 'sessionToken'
        },
        tags: ["account"],
        handler: function (request) {
          log.begin('Account.devices', request)
          var sessionToken = request.auth.credentials
          db.accountDevices(sessionToken.uid)
            .done(
              function (devices) {
                request.reply(
                  {
                    devices: Object.keys(devices)
                  }
                )
              },
              function (err) {
                request.reply(err)
              }
            )
        },
        validate: {
          response: {
            schema: {
              devices: isA.Object()
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/account/keys',
      config: {
        description:
          "Get the base16 bundle of encrypted kA|wrapKb",
        auth: {
          strategy: 'keyFetchToken'
        },
        tags: ["account"],
        validate: {
          response: {
            schema: {
              bundle: isA.String().regex(HEX_STRING)
            }
          }
        },
        handler: function accountKeys(request) {
          log.begin('Account.keys', request)
          var reply = request.reply.bind(request)
          var keyFetchToken = request.auth.credentials
          db.deleteKeyFetchToken(keyFetchToken)
            .then(
              function () {
                if (!keyFetchToken.verified) {
                  throw error.unverifiedAccount()
                }
                return {
                  bundle: keyFetchToken.keyBundle.toString('hex')
                }
              }
            )
            .done(reply, reply)
        }
      }
    },
    {
      method: 'GET',
      path: '/recovery_email/status',
      config: {
        description:
          "Gets the 'verified' status for the account's recovery email address",
        auth: {
          strategy: 'sessionToken'
        },
        tags: ["account", "recovery"],
        handler: function (request) {
          log.begin('Account.RecoveryEmailStatus', request)
          var sessionToken = request.auth.credentials
          request.reply(
            {
              email: sessionToken.email,
              verified: sessionToken.verified
            }
          )
        },
        validate: {
          response: {
            schema: {
              email: isA.String().regex(LAZY_EMAIL).required(),
              verified: isA.Boolean().required()
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/resend_code',
      config: {
        description:
          "Sends a verification code to the specified recovery method. " +
          "Providing this code will mark the recovery method as verified",
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            service: isA.String().max(16).alphanum().optional()
          }
        },
        tags: ["account", "recovery"],
        handler: function (request) {
          log.begin('Account.RecoveryEmailResend', request)
          log.security({ event: 'account-verify-request' });
          var sessionToken = request.auth.credentials
          mailer.sendVerifyCode(
            sessionToken,
            sessionToken.emailCode,
            request.payload.service,
            request.app.preferredLang
          ).done(
            function () {
              request.reply({})
            },
            function (err) {
              request.reply(err)
            }
          )
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/verify_code',
      config: {
        description:
          "Verify a recovery method with this code",
        tags: ["account", "recovery"],
        handler: function (request) {
          log.begin('Account.RecoveryEmailVerify', request)
          var uid = request.payload.uid
          var code = request.payload.code
          db.account(Buffer(uid, 'hex'))
            .then(
              function (account) {
                if (code !== account.emailCode) {
                  throw error.invalidVerificationCode()
                }
                return db.verifyEmail(account)
              }
            )
            .then(
              function () {
                log.security({ event: 'account-verify-success' });
              },
              function (err) {
                log.security({ event: 'account-verify-failure', err: err });
                throw err
              }
            )
            .done(
              function () {
                request.reply({})
              },
              function (err) {
                request.reply(err)
              }
            )
        },
        validate: {
          payload: {
            uid: isA.String().max(32).regex(HEX_STRING).required(),
            code: isA.String().max(16).required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/account/reset',
      config: {
        auth: {
          strategy: 'accountResetToken',
          payload: 'required'
        },
        tags: ["account"],
        validate: {
          payload: {
            authPW: isA.String().min(64).max(64).regex(HEX_STRING).required()
          }
        },
        handler: function accountReset(request) {
          log.begin('Account.reset', request)
          var reply = request.reply.bind(request)
          var accountResetToken = request.auth.credentials
          var authPW = Buffer(request.payload.authPW, 'hex')
          var authSalt = crypto.randomBytes(32)
          return scrypt.hash(authPW, authSalt)
            .then(
              function (stretched) {
                return hkdf(stretched, 'verifyHash', null, 32)
              }
            )
            .then(
              function (verifyHash) {
                return db.resetAccount(
                  accountResetToken,
                  {
                    authSalt: authSalt,
                    verifyHash: verifyHash,
                    wrapWrapKb: crypto.randomBytes(32)
                  }
                )
              }
            )
            .then(
              function () {
                log.security({ event: 'pwd-reset-success' })
                return {}
              },
              function (err) {
                log.security({ event: 'pwd-reset-failure', err: err })
                throw err
              }
            )
            .done(reply, reply)
        },
      }
    },
    {
      method: 'POST',
      path: '/account/destroy',
      config: {
        tags: ["account"],
        handler: function accountDestroy(request) {
          log.begin('Account.destroy', request)
          var form = request.payload
          var reply = request.reply.bind(request)
          db.emailRecord(form.email)
            .then(
              function (emailRecord) {
                if (!emailRecord) {
                  throw error.unknownAccount(form.email)
                }
                return db.deleteAccount(emailRecord)
              }
            )
            .then(
              function () {
                log.security({ event: 'account-destroy' })
                return {}
              }
            )
            .done(reply, reply)
        },
        validate: {
          payload: {
            email: isA.String().max(255).regex(LAZY_EMAIL).required(),
            authPW: isA.String().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      }
    }
  ]

  if (isProduction) {
    delete routes[0].config.validate.payload.preVerified
  }

  return routes
}
