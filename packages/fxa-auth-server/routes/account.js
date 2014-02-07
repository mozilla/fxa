/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var validators = require('./validators')
var HEX_STRING = validators.HEX_STRING
var LAZY_EMAIL = validators.LAZY_EMAIL

var Password = require('../crypto/password')
var butil = require('../crypto/butil')

module.exports = function (
  log,
  crypto,
  P,
  uuid,
  isA,
  error,
  db,
  mailer,
  redirectDomain,
  verifierVersion,
  isProduction
  ) {

  var routes = [
    {
      method: 'POST',
      path: '/account/create',
      config: {
        validate: {
          payload: {
            email: isA.string().max(255).regex(LAZY_EMAIL).required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            preVerified: isA.boolean(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: isA.string()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          }
        }
      },
      handler: function accountCreate(request, reply) {
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
              var password = new Password(authPW, authSalt, verifierVersion)
              return password.verifyHash()
              .then(
                function (verifyHash) {
                  return db.createAccount(
                    {
                      uid: uuid.v4('binary'),
                      email: email,
                      emailCode: crypto.randomBytes(16),
                      emailVerified: form.preVerified || false,
                      kA: crypto.randomBytes(32),
                      wrapWrapKb: crypto.randomBytes(32),
                      devices: {},
                      accountResetToken: null,
                      passwordForgotToken: null,
                      authSalt: authSalt,
                      verifierVersion: password.version,
                      verifyHash: verifyHash
                    }
                  )
                  .then(
                    function (account) {
                      return db.createSessionToken(
                        {
                          uid: account.uid,
                          email: account.email,
                          emailCode: account.emailCode,
                          emailVerified: account.emailVerified,
                          verifierSetAt: account.verifierSetAt
                        }
                      )
                      .then(
                        function (sessionToken) {
                          log.security({ event: 'session-create' })
                          if (request.query.keys !== 'true') {
                            return P({
                              account: account,
                              sessionToken: sessionToken
                            })
                          }
                          return password.unwrap(account.wrapWrapKb)
                            .then(
                              function (wrapKb) {
                                return db.createKeyFetchToken(
                                  {
                                    uid: account.uid,
                                    kA: account.kA,
                                    wrapKb: wrapKb,
                                    emailVerified: account.emailVerified
                                  }
                                )
                              }
                            )
                            .then(
                              function (keyFetchToken) {
                                return {
                                  account: account,
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
            }
          )
          .then(
            function (response) {
              if (!response.account.emailVerified) {
                mailer.sendVerifyCode(response.account, response.account.emailCode, {
                  service: form.service,
                  redirectTo: form.redirectTo,
                  preferredLang: request.app.preferredLang
                })
                .fail(
                  function (err) {
                    log.error({ op: 'mailer.sendVerifyCode.1', err: err })
                  }
                )
              }
              return response
            }
          )
          .done(
            function (response) {
              var account = response.account
              log.security({ event: 'account-create-success', uid: account.uid })
              reply(
                {
                  uid: account.uid.toString('hex'),
                  sessionToken: response.sessionToken.data.toString('hex'),
                  keyFetchToken: response.keyFetchToken ?
                    response.keyFetchToken.data.toString('hex')
                    : undefined,
                  authAt: response.sessionToken.lastAuthAt()
                }
              )
            },
            function (err) {
              log.security({ event: 'account-create-failure', err: err })
              reply(err)
            }
          )
      }
    },
    {
      method: 'POST',
      path: '/account/login',
      config: {
        validate: {
          payload: {
            email: isA.string().max(255).regex(LAZY_EMAIL).required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          },
        },
        response: {
          schema: {
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            verified: isA.boolean().required(),
            authAt: isA.number().integer()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.login', request)
        var form = request.payload
        var authPW = Buffer(form.authPW, 'hex')
        db.emailRecord(form.email)
          .then(
            function (emailRecord) {
              var password = new Password(
                authPW,
                emailRecord.authSalt,
                emailRecord.verifierVersion
              )
              return password.matches(emailRecord.verifyHash)
              .then(
                function (match) {
                  if (!match) {
                    throw error.incorrectPassword(emailRecord.email, form.email)
                  }
                  return db.createSessionToken(
                    {
                      uid: emailRecord.uid,
                      email: emailRecord.email,
                      emailCode: emailRecord.emailCode,
                      emailVerified: emailRecord.emailVerified,
                      verifierSetAt: emailRecord.verifierSetAt
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
                  return password.unwrap(emailRecord.wrapWrapKb)
                  .then(
                    function (wrapKb) {
                      return db.createKeyFetchToken(
                        {
                          uid: emailRecord.uid,
                          kA: emailRecord.kA,
                          wrapKb: wrapKb,
                          emailVerified: emailRecord.emailVerified
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
          .done(
            function (tokens) {
              reply(
                {
                  uid: tokens.sessionToken.uid.toString('hex'),
                  sessionToken: tokens.sessionToken.data.toString('hex'),
                  keyFetchToken: tokens.keyFetchToken ?
                    tokens.keyFetchToken.data.toString('hex')
                    : undefined,
                  verified: tokens.sessionToken.emailVerified,
                  authAt: tokens.sessionToken.lastAuthAt()
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'GET',
      path: '/account/devices',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: {
            devices: isA.array()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.devices', request)
        var sessionToken = request.auth.credentials
        db.accountDevices(sessionToken.uid)
          .done(
            function (devices) {
              reply(
                {
                  devices: Object.keys(devices)
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'GET',
      path: '/account/keys',
      config: {
        auth: {
          strategy: 'keyFetchToken'
        },
        response: {
          schema: {
            bundle: isA.string().regex(HEX_STRING)
          }
        }
      },
      handler: function accountKeys(request, reply) {
        log.begin('Account.keys', request)
        var keyFetchToken = request.auth.credentials
        if (!keyFetchToken.emailVerified) {
          // don't delete the token on use until the account is verified
          return reply(error.unverifiedAccount())
        }
        db.deleteKeyFetchToken(keyFetchToken)
          .then(
            function () {
              return {
                bundle: keyFetchToken.keyBundle.toString('hex')
              }
            }
          )
          .done(reply, reply)
      }
    },
    {
      method: 'GET',
      path: '/recovery_email/status',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: {
            email: isA.string().regex(LAZY_EMAIL).required(),
            verified: isA.boolean().required()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.RecoveryEmailStatus', request)
        var sessionToken = request.auth.credentials
        reply(
          {
            email: sessionToken.email,
            verified: sessionToken.emailVerified
          }
        )
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/resend_code',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: isA.string()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.RecoveryEmailResend', request)
        log.security({ event: 'account-verify-request' })
        var sessionToken = request.auth.credentials
        mailer.sendVerifyCode(sessionToken, sessionToken.emailCode, {
          service: request.payload.service,
          preferredLang: request.app.preferredLang
        }).done(
          function () {
            reply({})
          },
          reply
        )
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/verify_code',
      config: {
        validate: {
          payload: {
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            code: isA.string().min(32).max(32).regex(HEX_STRING).required()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.RecoveryEmailVerify', request)
        var uid = request.payload.uid
        var code = Buffer(request.payload.code, 'hex')
        db.account(Buffer(uid, 'hex'))
          .then(
            function (account) {
              if (!butil.buffersAreEqual(code, account.emailCode)) {
                throw error.invalidVerificationCode()
              }
              return db.verifyEmail(account)
            }
          )
          .then(
            function () {
              log.security({ event: 'account-verify-success' })
            },
            function (err) {
              log.security({ event: 'account-verify-failure', err: err })
              throw err
            }
          )
          .done(
            function () {
              reply({})
            },
            reply
          )
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
        validate: {
          payload: {
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function accountReset(request, reply) {
        log.begin('Account.reset', request)
        var accountResetToken = request.auth.credentials
        var authPW = Buffer(request.payload.authPW, 'hex')
        var authSalt = crypto.randomBytes(32)
        var password = new Password(authPW, authSalt, verifierVersion)
        return password.verifyHash()
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
      }
    },
    {
      method: 'POST',
      path: '/account/destroy',
      config: {
        validate: {
          payload: {
            email: isA.string().max(255).regex(LAZY_EMAIL).required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function accountDestroy(request, reply) {
        log.begin('Account.destroy', request)
        var form = request.payload
        var authPW = Buffer(form.authPW, 'hex')
        db.emailRecord(form.email)
          .then(
            function (emailRecord) {
              var password = new Password(
                authPW,
                emailRecord.authSalt,
                emailRecord.verifierVersion
              )

              return password.matches(emailRecord.verifyHash)
                .then(
                  function (match) {
                    if (!match) {
                      throw error.incorrectPassword(emailRecord.email, form.email)
                    }
                    return db.deleteAccount(emailRecord)
                  }
                )
            }
          )
          .then(
            function () {
              log.security({ event: 'account-destroy' })
              return {}
            }
          )
          .done(reply, reply)
      }
    }
  ]

  if (isProduction) {
    delete routes[0].config.validate.payload.preVerified
  }

  return routes
}
