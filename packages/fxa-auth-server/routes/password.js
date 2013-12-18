/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_EMAIL = require('./validators').HEX_EMAIL
var HEX_STRING = require('./validators').HEX_STRING

var crypto = require('crypto')
var scrypt = require('../client/scrypt')
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

module.exports = function (log, isA, error, db, mailer) {

  function failVerifyAttempt(forgotPasswordToken) {
    return (forgotPasswordToken.failAttempt()) ?
      db.deleteForgotPasswordToken(forgotPasswordToken) :
      db.updateForgotPasswordToken(forgotPasswordToken)
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
          var form = request.payload
          var oldAuthPW = Buffer(form.oldAuthPW, 'hex')
          var oldStretchWrap = null
          var newAuthPW = Buffer(form.newAuthPW, 'hex')
          var newAuthSalt = crypto.randomBytes(32)
          var newStretchWrap = null
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
                            return hkdf(oldStretched, 'stretchWrap', null, 32)
                          }
                        )
                        .then(
                          function (stretchWrap) {
                            oldStretchWrap = stretchWrap
                          }
                        )
                    }
                  )
                  .then(
                    function () {
                      return scrypt.hash(newAuthPW, newAuthSalt)
                        .then(
                          function (newStretched) {
                            return hkdf(newStretched, 'verifyHash', null, 32)
                              .then(
                                function (verifyHash) {
                                  newVerifyHash = verifyHash
                                  return hkdf(newStretched, 'stretchWrap', null, 32)
                                }
                              )
                          }
                        )
                        .then(
                          function (stretchWrap) {
                            newStretchWrap = stretchWrap
                          }
                        )
                    }
                  )
                  .then(
                    function () {
                      return db.createKeyFetchToken(
                        {
                          uid: emailRecord.uid,
                          kA: emailRecord.kA,
                          wrapKb: emailRecord.wrapKb,
                          verified: emailRecord.verified
                        }
                      )
                      .then(
                        function (keyFetchToken) {
                          return db.createPasswordChangeToken(
                            {
                              uid: emailRecord.uid,
                              verifyHash: newVerifyHash,
                              authSalt: newAuthSalt
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
                    oldStretchWrap: oldStretchWrap.toString('hex'),
                    newStretchWrap: newStretchWrap.toString('hex'),
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
            oldAuthPW: isA.String().min(64).max(64).regex(HEX_STRING).required(),
            newAuthPW: isA.String().min(64).max(64).regex(HEX_STRING).required()
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
          var wrapKb = Buffer(request.payload.wrapKb, 'hex')
          db.resetAccount(
            passwordChangeToken,
            {
              verifyHash: passwordChangeToken.verifyHash,
              authSalt: passwordChangeToken.authSalt,
              wrapKb: wrapKb
            }
          )
          .then(function () { return {} })
          .done(reply, reply)
        },
        validate: {
          payload: {
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
                return db.createForgotPasswordToken(emailRecord)
              }
            )
            .then(
              function (forgotPasswordToken) {
                return mailer.sendRecoveryCode(
                  forgotPasswordToken,
                  forgotPasswordToken.passcode,
                  request.app.preferredLang
                ).then(
                  function() {
                    return forgotPasswordToken
                  }
                )
              }
            )
            .done(
              function (forgotPasswordToken) {
                request.reply(
                  {
                    passwordForgotToken: forgotPasswordToken.data.toString('hex'),
                    ttl: forgotPasswordToken.ttl(),
                    codeLength: forgotPasswordToken.passcode.length,
                    tries: forgotPasswordToken.tries
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
          strategy: 'forgotPasswordToken'
        },
        handler: function (request) {
          log.begin('Password.forgotResend', request)
          var forgotPasswordToken = request.auth.credentials
          mailer.sendRecoveryCode(
            forgotPasswordToken,
            forgotPasswordToken.passcode,
            request.app.preferredLang
          ).done(
            function () {
              request.reply(
                {
                  passwordForgotToken: forgotPasswordToken.data.toString('hex'),
                  ttl: forgotPasswordToken.ttl(),
                  codeLength: forgotPasswordToken.passcode.length,
                  tries: forgotPasswordToken.tries
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
          strategy: 'forgotPasswordToken'
        },
        handler: function (request) {
          log.begin('Password.forgotVerify', request)
          var forgotPasswordToken = request.auth.credentials
          var code = +(request.payload.code)
          if (forgotPasswordToken.passcode === code && forgotPasswordToken.ttl() > 0) {
            db.forgotPasswordVerified(forgotPasswordToken)
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
            failVerifyAttempt(forgotPasswordToken)
              .done(
                function () {
                  request.reply(
                    error.invalidVerificationCode({
                      tries: forgotPasswordToken.tries,
                      ttl: forgotPasswordToken.ttl()
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
