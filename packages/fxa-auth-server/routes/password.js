/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var validators = require('./validators')
var HEX_STRING = validators.HEX_STRING
var LAZY_EMAIL = validators.LAZY_EMAIL

var crypto = require('crypto')
var Password = require('../crypto/password')
var butil = require('../crypto/butil')

module.exports = function (
  log,
  isA,
  error,
  db,
  redirectDomain,
  mailer,
  verifierVersion
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
            email: isA.string().max(255).regex(LAZY_EMAIL).required(),
            oldAuthPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.changeStart', request)
        log.security({ event: 'pwd-change-request' })
        var form = request.payload
        var oldAuthPW = Buffer(form.oldAuthPW, 'hex')

        db.emailRecord(form.email)
          .then(
            function (emailRecord) {
              var password = new Password(
                oldAuthPW,
                emailRecord.authSalt,
                emailRecord.verifierVersion
              )
              return password.matches(emailRecord.verifyHash)
              .then(
                function (match) {
                  if (!match) {
                    throw error.incorrectPassword(emailRecord.email, form.email)
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
                              wrapWrapKb: wrapWrapKb
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
              log.security({ event: 'pwd-reset-success' })
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
            email: isA.string().max(255).regex(LAZY_EMAIL).required(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: isA.string()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          },
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
        db.emailRecord(email)
          .then(
            function (emailRecord) {
              log.security({ event: 'pwd-reset-request' })
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
                  preferredLang: request.app.preferredLang
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
            email: isA.string().max(255).regex(LAZY_EMAIL).required(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: isA.string()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          },
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
        mailer.sendRecoveryCode(
          passwordForgotToken,
          passwordForgotToken.passCode,
          {
            service: request.payload.service,
            redirectTo: request.payload.redirectTo,
            preferredLang: request.app.preferredLang
          }
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
          },
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
          log.security({ event: 'pwd-reset-verify-success' })
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
          log.security({ event: 'pwd-reset-verify-failure' })
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
    }
  ]

  return routes
}
