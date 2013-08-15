/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, error, Account, tokens) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

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
          var reply = request.reply.bind(request)
          var authToken = request.auth.credentials
          var keyFetchToken = null
          var accountResetToken = null
          authToken.del()
            .then(
              function () {
                return tokens.KeyFetchToken.create(authToken.uid)
              }
            )
            .then(function (t) { keyFetchToken = t })
            .then(tokens.AccountResetToken.create.bind(null, authToken.uid))
            .then(function (t) { accountResetToken = t })
            .then(Account.get.bind(null, authToken.uid))
            .then(
              function (account) {
                return account.setResetToken(accountResetToken)
              }
            )
            .then(
              function () {
                return authToken.bundleAccountReset(
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
          var email = request.payload.email
          var forgotPasswordToken = null
          Account.getByEmail(email)
            .then(
              function (account) {
                return tokens.ForgotPasswordToken.create(account.uid, account.email)
                  .then(
                    function (token) {
                      forgotPasswordToken = token
                      return account.setForgotPasswordToken(token)
                    }
                  )
                  .then(
                    function () {
                      return forgotPasswordToken.sendRecoveryCode()
                    }
                  )
              }
            )
            .done(
              function () {
                request.reply(
                  {
                    forgotPasswordToken: forgotPasswordToken.data,
                    ttl: forgotPasswordToken.ttl(),
                    codeLength: 8,
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
          var forgotPasswordToken = request.auth.credentials
          forgotPasswordToken.sendRecoveryCode()
            .done(
              function () {
                request.reply(
                  {
                    forgotPasswordToken: forgotPasswordToken.data,
                    ttl: forgotPasswordToken.ttl(),
                    codeLength: 8,
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
          var forgotPasswordToken = request.auth.credentials
          var code = +(request.payload.code)
          var accountResetToken = null
          if (forgotPasswordToken.code === code && forgotPasswordToken.ttl() > 0) {
            forgotPasswordToken.del()
              .then(tokens.AccountResetToken.create.bind(null, forgotPasswordToken.uid))
              .then(function (t) { accountResetToken = t })
              .then(Account.get.bind(null, forgotPasswordToken.uid))
              .then(
                function (account) {
                  return account.setResetToken(accountResetToken)
                }
              )
              .done(
                function () {
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
            forgotPasswordToken.failAttempt()
              .done(
                function (t) {
                  request.reply(error.invalidCode(forgotPasswordToken))
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
