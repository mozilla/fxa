/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, isA, error, db) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function bundleAccountReset(authToken, keyFetchToken, accountResetToken) {
    //TODO
  }

  function sendRecoveryCode(forgotPasswordToken) {
    //TODO
  }

  function ttl(forgotPasswordToken) {

  }

  function failAttempt(forgotPasswordToken) {

  }

  var routes = [
    {
      method: 'POST',
      path: '/password/change/start',
      config: {
        description: "Begin the change password process",
        tags: ["password"],
        auth: {
          strategy: 'authToken'
        },
        handler: function (request) {
          log.begin('Password.changeStart', request)
          var reply = request.reply.bind(request)
          var authToken = request.auth.credentials
          db.createPasswordChange(authToken)
            .then(
              function () {
                return bundleAccountReset(
                  authToken,
                  keyFetchToken,
                  accountResetToken
                )
              }
            )
            .then(
              function (bundle) {
                return {
                  bundle: bundle
                }
              }
            )
            .done(reply, reply)
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
                return sendRecoveryCode(forgotPasswordToken)
              }
            )
            .done(
              function () {
                request.reply(
                  {
                    forgotPasswordToken: forgotPasswordToken.data,
                    ttl: ttl(forgotPasswordToken),
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
            email: isA.String().max(1024).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              forgotPasswordToken: isA.String(),
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
          sendRecoveryCode(forgotPasswordToken)
            .done(
              function () {
                request.reply(
                  {
                    forgotPasswordToken: forgotPasswordToken.data,
                    ttl: forgotPasswordToken.ttl(forgotPasswordToken),
                    codeLength: ttl(forgotPasswordToken),
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
            email: isA.String().max(1024).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              forgotPasswordToken: isA.String(),
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
          if (forgotPasswordToken.code === code && ttl(forgotPasswordToken) > 0) {
            db.forgotPasswordVerified(forgotPasswordToken)
              .done(
                function (accountResetToken) {
                  request.reply(
                    {
                      accountResetToken: accountResetToken.data
                    }
                  )
                },
                function (err) {
                  request.reply(err)
                }
              )
          }
          else {
            failAttempt(forgotPasswordToken)
              .done(
                function (t) {
                  request.reply(
                    error.invalidVerificationCode({
                      tries: forgotPasswordToken.tries,
                      ttl: forgotPasswordToken.ttl
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
