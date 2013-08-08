/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, error, Account, tokens) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function notImplemented(request) {
    request.reply(error.notImplemented())
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
        handler: notImplemented,
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              forgotPasswordToken: isA.String(),
              lifetime: isA.Number(),
              codeLength: isA.Number(),
              remainingAttempts: isA.Number()
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
        // auth: {
        //   strategy: 'forgotPasswordToken'
        // },
        handler: notImplemented,
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              forgotPasswordToken: isA.String(),
              lifetime: isA.Number(),
              codeLength: isA.Number(),
              remainingAttempts: isA.Number()
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
        // auth: {
        //   strategy: 'forgotPasswordToken'
        // },
        handler: notImplemented,
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
