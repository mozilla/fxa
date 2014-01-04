/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_EMAIL = require('./validators').HEX_EMAIL
var HEX_STRING = require('./validators').HEX_STRING

var crypto = require('crypto')
var scrypt = require('../scrypt')
var hkdf = require('../hkdf')

function buffersAreEqual(buffer1, buffer2) {
  var mismatch = buffer1.length - buffer2.length
  if (mismatch) {
    return false
  }
  for (var i = 0; i < buffer1.length; i++) {
    mismatch |= buffer1[i] ^ buffer2[i]
  }
  return mismatch === 0
}

function xorBuffers(buffer1, buffer2) {
  if (buffer1.length !== buffer2.length) {
    throw new Error(
      'XOR buffers must be same length (%d != %d)',
      buffer1.length,
      buffer2.length
    )
  }
  var result = Buffer(buffer1.length)
  for (var i = 0; i < buffer1.length; i++) {
    result[i] = buffer1[i] ^ buffer2[i]
  }
  return result
}

module.exports = function (log, isA, error, db, mailer) {

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
        description: "Begin the change password process",
        tags: ["password"],
        handler: function (request) {
          log.begin('Password.changeStart', request)
          log.security({ event: 'pwd-change-request' })
          var form = request.payload
          var oldAuthPW = Buffer(form.oldAuthPW, 'hex')
          var newAuthSalt = crypto.randomBytes(32)
          var newVerifyHash = null

          db.emailRecord(form.email)
            .then(
              function (emailRecord) {
                if (!emailRecord) {
                  throw error.unknownAccount(form.email)
                }
                return scrypt.hash(oldAuthPW, emailRecord.authSalt)
                  .then(
                    function (oldStretched) {
                      return hkdf(oldStretched, 'verifyHash', null, 32)
                        .then(
                          function (verifyHash) {
                            if(!buffersAreEqual(verifyHash, emailRecord.verifyHash)) {
                              throw error.incorrectPassword()
                            }
                          }
                        )
                        .then(
                          function () {
                            return hkdf(oldStretched, 'wrapwrapKey', null, 32)
                              .then(
                                function (wrapWrapKey) {
                                  return xorBuffers(wrapWrapKey, emailRecord.wrapWrapKb)
                                }
                              )
                          }
                        )
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
                request.reply(
                  {
                    keyFetchToken: tokens.keyFetchToken.data.toString('hex'),
                    passwordChangeToken: tokens.passwordChangeToken.data.toString('hex'),
                    verified: tokens.keyFetchToken.verified
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
            email: isA.String().max(255).required(),
            oldAuthPW: isA.String().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/password/change/finish',
      config: {
        description: 'complete the password change',
        auth: {
          strategy: 'passwordChangeToken'
        },
        handler: function (request) {
          log.begin('Password.changeFinish', request)
          var reply = request.reply.bind(request)
          var passwordChangeToken = request.auth.credentials
          var authPW = Buffer(request.payload.authPW, 'hex')
          var wrapKb = Buffer(request.payload.wrapKb, 'hex')
          var authSalt = crypto.randomBytes(32)
          scrypt.hash(authPW, authSalt)
            .then(
              function (stretched) {
                return hkdf(stretched, 'verifyHash', null, 32)
                  .then(
                    function (verifyHash) {
                      return hkdf(stretched, 'wrapwrapKey', null, 32)
                        .then(
                          function (wrapWrapKey) {
                            return xorBuffers(wrapWrapKey, wrapKb)
                          }
                        )
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
        },
        validate: {
          payload: {
            authPW: isA.String().min(64).max(64).regex(HEX_STRING).required(),
            wrapKb: isA.String().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      config: {
        description:
          "Request a new 'reset password' code be sent to the recovery email",
        tags: ["password"],
        handler: function (request) {
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
                  passwordForgotToken.passcode,
                  request.app.preferredLang
                ).then(
                  function() {
                    return passwordForgotToken
                  }
                )
              }
            )
            .done(
              function (passwordForgotToken) {
                request.reply(
                  {
                    passwordForgotToken: passwordForgotToken.data.toString('hex'),
                    ttl: passwordForgotToken.ttl(),
                    codeLength: passwordForgotToken.passcode.length,
                    tries: passwordForgotToken.tries
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
            email: isA.String().max(1024).required()
          },
          response: {
            schema: {
              passwordForgotToken: isA.String(),
              ttl: isA.Number(),
              codeLength: isA.Number(),
              tries: isA.Number()
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/resend_code',
      config: {
        description:
          "Request the previous 'reset password' code again",
        tags: ["password"],
        auth: {
          strategy: 'passwordForgotToken'
        },
        handler: function (request) {
          log.begin('Password.forgotResend', request)
          var passwordForgotToken = request.auth.credentials
          mailer.sendRecoveryCode(
            passwordForgotToken,
            passwordForgotToken.passcode,
            request.app.preferredLang
          ).done(
            function () {
              request.reply(
                {
                  passwordForgotToken: passwordForgotToken.data.toString('hex'),
                  ttl: passwordForgotToken.ttl(),
                  codeLength: passwordForgotToken.passcode.length,
                  tries: passwordForgotToken.tries
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
            email: isA.String().max(1024).required()
          },
          response: {
            schema: {
              passwordForgotToken: isA.String(),
              ttl: isA.Number(),
              codeLength: isA.Number(),
              tries: isA.Number()
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_code',
      config: {
        description:
          "Verify a 'reset password' code",
        tags: ["password"],
        auth: {
          strategy: 'passwordForgotToken'
        },
        handler: function (request) {
          log.begin('Password.forgotVerify', request)
          var passwordForgotToken = request.auth.credentials
          var code = +(request.payload.code)
          if (passwordForgotToken.passcode === code && passwordForgotToken.ttl() > 0) {
            log.security({ event: 'pwd-reset-verify-success' })
            db.forgotPasswordVerified(passwordForgotToken)
              .done(
                function (accountResetToken) {
                  request.reply(
                    {
                      accountResetToken: accountResetToken.data.toString('hex')
                    }
                  )
                },
                function (err) {
                  request.reply(err)
                }
              )
          }
          else {
            log.security({ event: 'pwd-reset-verify-failure' })
            failVerifyAttempt(passwordForgotToken)
              .done(
                function () {
                  request.reply(
                    error.invalidVerificationCode({
                      tries: passwordForgotToken.tries,
                      ttl: passwordForgotToken.ttl()
                    })
                  )
                },
                function (err) {
                  request.reply(err)
                }
              )
          }
        },
        validate: {
          payload: {
            code: isA.String().required()
          },
          response: {
            schema: {
              accountResetToken: isA.String()
            }
          }
        }
      }
    }
  ]

  return routes
}
