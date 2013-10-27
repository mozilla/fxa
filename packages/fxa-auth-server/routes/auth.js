/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, isA, error, db, Bundle) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function clientData(srpToken) {
    return {
      srpToken: srpToken.id,
      passwordStretching: srpToken.passwordStretching,
      srp: {
        type: 'SRP-6a/SHA256/2048/v1',
        salt: srpToken.s,
        B: srpToken.B.toString('hex')
      }
    }
  }

  function bundleAuth(K, authToken) {
    return Bundle.hkdf(K, 'auth/finish', null, 2 * 32)
      .then(
        function (key) {
          var b = new Bundle()
          b.hmacKey = key.slice(0, 32).toString('hex')
          b.xorKey =  key.slice(32, 64).toString('hex')
          return {
            bundle: b.bundleHexStrings([authToken.data])
          }
        }
      )
  }

  function srpFinish(srpToken, A, M) {
    return srpToken.finish(A, M)
  }

  var routes = [
    {
      method: 'POST',
      path: '/auth/start',
      config: {
        description:
          "Begins an SRP login for the supplied email address, " +
          "returning the temporary srpToken and parameters for " +
          "key stretching and the SRP protocol for the client.",
        tags: ["srp", "account"],
        handler: function (request) {
          log.begin('Auth.start', request)
          var reply = request.reply.bind(request)
          db.emailRecord(request.payload.email)
            .then(
              function (emailRecord) {
                return db.createSrpToken(emailRecord)
              }
            )
            .then(
              function (srpToken) {
                return clientData(srpToken)
              }
            )
            .done(reply, reply)
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              srpToken: isA.String().required(),
              passwordStretching: isA.Object(),
              srp: isA.Object({
                type: isA.String().required(),
                salt: isA.String().regex(HEX_STRING), // salt
                B: isA.String().regex(HEX_STRING)  // server's public key value
              })
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/finish',
      config: {
        description:
          "Finishes the SRP dance, with the client providing " +
          "proof-of-knownledge of the password and receiving " +
          "the bundle encrypted with the authToken.",
        tags: ["srp", "session"],
        handler: function (request) {
          log.begin('Auth.finish', request)
          var reply = request.reply.bind(request)

          db.srpToken(request.payload.srpToken)
            .then(
              function (srpToken) {
                return srpFinish(srpToken, request.payload.A, request.payload.M)
              }
            )
            .then(
              function (srpToken) {
                return db.authFinish(srpToken)
                  .then(
                    function (authToken) {
                      return bundleAuth(srpToken.K, authToken)
                    }
                  )
              }
            )
            .done(reply, reply)
        },
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
    }
  ]

  return routes
}
