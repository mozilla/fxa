/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var validators = require('./validators')
var HEX_STRING = validators.HEX_STRING

var crypto = require('crypto')
var butil = require('../crypto/butil')

module.exports = function (
  log,
  isA,
  error,
  db,
  Password,
  redirectDomain,
  mailer,
  verifierVersion,
  customs
  ) {

  function failVerifyAttempt(passwordForgotToken) {
    return (passwordForgotToken.failAttempt()) ?
      db.deletePasswordForgotToken(passwordForgotToken) :
      db.updatePasswordForgotToken(passwordForgotToken)
  }

  var routes = [
    {
      method: 'POST',
      path: '/password/change/start',
      config: {
        validate: {
          payload: {
            email: validators.email().required(),
            oldAuthPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.changeStart', request)
        var form = request.payload
        var oldAuthPW = Buffer(form.oldAuthPW, 'hex')

        db.emailRecord(form.email)
          .then(
            function (emailRecord) {
              if (emailRecord.lockedAt) {
                throw error.lockedAccount()
              }
              var password = new Password(
                oldAuthPW,
                emailRecord.authSalt,
                emailRecord.verifierVersion
              )
              return password.matches(emailRecord.verifyHash)
              .then(
                function (match) {
                  if (!match) {
                    return customs.flag(request.app.clientAddress, emailRecord)
                      .then(
                        function () {
                          throw error.incorrectPassword(emailRecord.email, form.email)
                        }
                      )
                  }
                  return password.unwrap(emailRecord.wrapWrapKb)
                }
              )
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
                  .then(
                    function (keyFetchToken) {
                      return db.createPasswordChangeToken({
                          uid: emailRecord.uid
                        }
                      )
                      .then(
                        function (passwordChangeToken) {
                          return {
                            keyFetchToken: keyFetchToken,
                            passwordChangeToken: passwordChangeToken
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
              reply(
                {
                  keyFetchToken: tokens.keyFetchToken.data.toString('hex'),
                  passwordChangeToken: tokens.passwordChangeToken.data.toString('hex'),
                  verified: tokens.keyFetchToken.emailVerified
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/password/change/finish',
      config: {
        auth: {
          strategy: 'passwordChangeToken'
        },
        validate: {
          payload: {
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            wrapKb: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.changeFinish', request)
        var passwordChangeToken = request.auth.credentials
        var authPW = Buffer(request.payload.authPW, 'hex')
        var wrapKb = Buffer(request.payload.wrapKb, 'hex')
        var authSalt = crypto.randomBytes(32)
        var password = new Password(authPW, authSalt, verifierVersion)
        db.deletePasswordChangeToken(passwordChangeToken)
          .then(
            function () {
              return password.verifyHash()
                .then(
                  function (verifyHash) {
                    return password.wrap(wrapKb)
                      .then(
                        function (wrapWrapKb) {
                          return db.resetAccount(
                            passwordChangeToken,
                            {
                              verifyHash: verifyHash,
                              authSalt: authSalt,
                              wrapWrapKb: wrapWrapKb,
                              verifierVersion: password.version
                            }
                          )
                        }
                      )
                  }
                )
            }
          )
          .then(
            function () {
              return {}
            }
          )
          .done(reply, reply)
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      config: {
        validate: {
          payload: {
            email: validators.email().required(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: validators.redirectTo(redirectDomain).optional(),
            resume: isA.string().max(2048).optional()
          }
        },
        response: {
          schema: {
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotSend', request)
        var email = request.payload.email
        customs.check(
          request.app.clientAddress,
          email,
          'passwordForgotSendCode')
          .then(db.emailRecord.bind(db, email))
          .then(
            function (emailRecord) {
              return db.createPasswordForgotToken(emailRecord)
            }
          )
          .then(
            function (passwordForgotToken) {
              return mailer.sendRecoveryCode(
                passwordForgotToken,
                passwordForgotToken.passCode,
                {
                  service: request.payload.service,
                  redirectTo: request.payload.redirectTo,
                  resume: request.payload.resume,
                  acceptLanguage: request.app.acceptLanguage
                }
              )
              .then(
                function() {
                  return passwordForgotToken
                }
              )
            }
          )
          .done(
            function (passwordForgotToken) {
              reply(
                {
                  passwordForgotToken: passwordForgotToken.data.toString('hex'),
                  ttl: passwordForgotToken.ttl(),
                  codeLength: passwordForgotToken.passCode.length,
                  tries: passwordForgotToken.tries
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/resend_code',
      config: {
        auth: {
          strategy: 'passwordForgotToken'
        },
        validate: {
          payload: {
            email: validators.email().required(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: validators.redirectTo(redirectDomain).optional(),
            resume: isA.string().max(2048).optional()
          }
        },
        response: {
          schema: {
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotResend', request)
        var passwordForgotToken = request.auth.credentials
        customs.check(
          request.app.clientAddress,
          passwordForgotToken.email,
          'passwordForgotResendCode')
          .then(
            mailer.sendRecoveryCode.bind(
              mailer,
              passwordForgotToken,
              passwordForgotToken.passCode,
              {
                service: request.payload.service,
                redirectTo: request.payload.redirectTo,
                resume: request.payload.resume,
                acceptLanguage: request.app.acceptLanguage
              }
            )
          )
          .done(
            function () {
              reply(
                {
                  passwordForgotToken: passwordForgotToken.data.toString('hex'),
                  ttl: passwordForgotToken.ttl(),
                  codeLength: passwordForgotToken.passCode.length,
                  tries: passwordForgotToken.tries
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_code',
      config: {
        auth: {
          strategy: 'passwordForgotToken'
        },
        validate: {
          payload: {
            code: isA.string().min(32).max(32).regex(HEX_STRING).required()
          }
        },
        response: {
          schema: {
            accountResetToken: isA.string()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotVerify', request)
        var passwordForgotToken = request.auth.credentials
        var code = Buffer(request.payload.code, 'hex')
        if (butil.buffersAreEqual(passwordForgotToken.passCode, code) &&
            passwordForgotToken.ttl() > 0) {
          db.forgotPasswordVerified(passwordForgotToken)
            .done(
              function (accountResetToken) {
                reply(
                  {
                    accountResetToken: accountResetToken.data.toString('hex')
                  }
                )
              },
              reply
            )
        }
        else {
          failVerifyAttempt(passwordForgotToken)
            .done(
              function () {
                reply(
                  error.invalidVerificationCode({
                    tries: passwordForgotToken.tries,
                    ttl: passwordForgotToken.ttl()
                  })
                )
              },
              reply
            )
        }
      }
    },
    {
      method: 'GET',
      path: '/password/forgot/status',
      config: {
        auth: {
          strategy: 'passwordForgotToken'
        },
        response: {
          schema: {
            tries: isA.number(),
            ttl: isA.number()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotStatus', request)
        var passwordForgotToken = request.auth.credentials
        reply(
          {
            tries: passwordForgotToken.tries,
            ttl: passwordForgotToken.ttl()
          }
        )
      }
    }
  ]

  return routes
}
