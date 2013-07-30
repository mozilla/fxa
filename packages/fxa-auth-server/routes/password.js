/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, error, srp, Account) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function notImplemented(request) {
    request.reply(error.notImplemented())
  }

  var routes = [
    {
      method: 'POST',
      path: '/password/change/auth/start',
      config: {
        description:
          "Begins an SRP login for the authenticated user, " +
          "returning the temporary sessionId and parameters for " +
          "key stretching and the SRP protocol for the client.",
        tags: ["srp", "password"],
        handler: function (request) {
          Account
            .get(request.auth.credentials.uid)
            .done(
              function (account) {
                return srp.start('passwordChange', account, request)
              }
            )
        },
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          response: {
            schema: {
              srpToken: isA.String().required(),
              stretch: isA.Object({
                salt: isA.String()
              }),
              srp: isA.Object({
                N_bits: isA.Number().valid(2048),  // number of bits for prime
                alg: isA.String().valid('sha256'), // hash algorithm (sha256)
                s: isA.String().regex(HEX_STRING), // salt
                B: isA.String().regex(HEX_STRING)  // server's public key value
              })
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/password/change/auth/finish',
      handler: srp.finish,
      config: {
        description:
          "Finishes the SRP dance, with the client providing " +
          "proof-of-knownledge of the password and receiving " +
          "the bundle encrypted with the shared key.",
        tags: ["srp", "password"],
        validate: {
          payload: {
            srpToken: isA.String().required(),
            A: isA.String().regex(HEX_STRING).required(),
            M: isA.String().regex(HEX_STRING).required()
          },
          response: {
            schema: {
              bundle: isA.String().regex(HEX_STRING).required()
            }
          }
        }
      }
    },
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
