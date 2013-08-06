/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, error, Account) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function notImplemented(request) {
    request.reply(error.notImplemented())
  }

  var routes = [
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      config: {
        description:
          "Request that 'reset password' code be sent to one " +
          "of the user's recovery methods",
        tags: ["password"],
        handler: notImplemented,
        validate: {
          payload: {
            email: isA.String().email().required()
          },
          response: {
            schema: {
              forgotPasswordToken: isA.String()
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
        handler: notImplemented,
        validate: {
          payload: {
            code: isA.String().required(),
            forgotPasswordToken: isA.String().required()
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
