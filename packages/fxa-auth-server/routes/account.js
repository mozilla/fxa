/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (crypto, uuid, isA, error, Account, RecoveryMethod) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  var routes = [
    {
      method: 'POST',
      path: '/account/create',
      config: {
        description:
          "Creates an account associated with an email address, " +
          "passing along SRP information (salt and verifier) " +
          "and a wrapped key (used for class B data storage).",
        tags: ["srp", "account"],
        validate: {
          payload: {
            email: isA.String().email().required(),
            verifier: isA.String().regex(HEX_STRING).required(),
            salt: isA.String().regex(HEX_STRING).required(),
            params: isA.Object({
              srp: isA.Object({
                alg: isA.String().valid('sha256').required(),
                N_bits: isA.Number().valid(2048).required()
              }).required(),
              stretch: isA.Object({
                salt: isA.String().regex(HEX_STRING).required(),
                rounds: isA.Number().required()
              })
            })
          }
        },
        handler: function accountCreate(request) {
          var form = request.payload
          Account
            .create(
              {
                uid: uuid.v4(),
                email: form.email,
                verifier: form.verifier,
                salt: form.salt,
                kA: crypto.randomBytes(32).toString('hex'),
                wrapKb: crypto.randomBytes(32).toString('hex'),
                params: form.params
              }
            )
            .done(
              function () {
                request.reply({})
              },
              request.reply.bind(request)
            )
        }
      }
    },
    {
      method: 'GET',
      path: '/account/devices',
      config: {
        description:
          "get the collection of devices currently authenticated and syncing",
        auth: {
          strategy: 'sessionToken'
        },
        tags: ["account"],
        handler: function (request) {
          var sessionToken = request.auth.credentials
          Account
            .get(sessionToken.uid)
            .done(
              function (account) {
                request.reply(
                  {
                    devices: Object.keys(account.sessionTokenIds)
                  }
                )
              },
              function (err) {
                request.reply(err)
              }
            )
        },
        validate: {
          response: {
            schema: {
              devices: isA.Object()
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/account/keys',
      config: {
        description:
          "Get the base16 bundle of encrypted kA|wrapKb",
        auth: {
          strategy: 'keyFetchToken'
        },
        tags: ["account"],
        validate: {
          response: {
            schema: {
              bundle: isA.String().regex(HEX_STRING)
            }
          }
        },
        handler: function accountKeys(request) {
          var reply = request.reply.bind(request)
          var keyFetchToken = request.auth.credentials

          keyFetchToken
            .del()
            .then(Account.get.bind(null, keyFetchToken.uid))
            .then(
              function (account) {
                if (!account.verified) {
                  throw error.unverifiedAccount()
                }
                return {
                  bundle: keyFetchToken.bundle(account.kA, account.wrapKb)
                }
              }
            )
            .done(reply, reply)
        }
      }
    },
    {
      method: 'GET',
      path: '/account/recovery_methods',
      config: {
        description:
          "Gets the set of methods for recovery the account's password",
        auth: {
          strategy: 'sessionToken'
        },
        tags: ["account", "recovery"],
        handler: function (request) {
          var sessionToken = request.auth.credentials
          Account
            .get(sessionToken.uid)
            .then(
              function (account) {
                return account.recoveryMethods()
              }
            )
            .done(
              function (rms) {
                request.reply(
                  {
                    recoveryMethods: rms.map(
                      function (rm) {
                        return {
                          email: rm.email,
                          verified: rm.verified,
                          primary: rm.primary
                        }
                      }
                    )
                  }
                )
              },
              function (err) {
                request.reply(err)
              }
            )
        },
        validate: {
          response: {
            schema: {
              recoveryMethods: isA.Object()
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/account/recovery_methods/send_code',
      config: {
        description:
          "Sends a verification code to the specified recovery method. " +
          "Providing this code will mark the recovery method as verified",
        auth: {
          strategy: 'sessionToken',
          payload: 'required'
        },
        tags: ["account", "recovery"],
        handler: function (request) {
          var sessionToken = request.auth.credentials
          var email = request.payload.email
          Account
            .get(sessionToken.id)
            .then(
              function (account) {
                if (account.email === email) {
                  RecoveryMethod
                    .get(email)
                    .then(
                      function (rm) {
                        return rm.sendCode()
                      }
                    )
                    .done(
                      function () {
                        request.reply({})
                      },
                      function (err) {
                        request.reply(err)
                      }
                    )
                }
                else {
                  request.reply(error.notImplemented())
                }
              }
            )
        },
        validate: {
          payload: {
            email: isA.String().email().required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/account/recovery_methods/verify_code',
      config: {
        description:
          "Verify a recovery method with this code",
        tags: ["account", "recovery"],
        handler: function (request) {
          var email = request.payload.email
          var code = request.payload.code
          RecoveryMethod
            .get(email)
            .then(
              function (rm) {
                return rm.verify(code)
              }
            )
            .then(
              function (rm) {
                return Account.verify(rm)
              }
            )
            .done(
              function () {
                request.reply({})
              },
              function (err) {
                request.reply(err)
              }
            )
        },
        validate: {
          payload: {
            email: isA.String().email().required(),
            code: isA.String().required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/account/reset',
      config: {
        auth: {
          strategy: 'accountResetToken',
          payload: 'required'
        },
        tags: ["account"],
        validate: {
          payload: {
            bundle: isA.String().regex(HEX_STRING).required(),
            params: isA.Object({
              srp: isA.Object({
                alg: isA.String().valid('sha256').required(),
                N_bits: isA.Number().valid(2048).required()
              }).required(),
              stretch: isA.Object({
                salt: isA.String().regex(HEX_STRING).required(),
                rounds: isA.Number().required()
              })
            })
          }
        },
        handler: function accountReset(request) {
          var reply = request.reply.bind(request)
          var accountResetToken = request.auth.credentials
          var payload = request.payload
          var unbundle = accountResetToken.unbundle(payload.bundle)
          payload.wrapKb = unbundle.wrapKb
          payload.verifier = unbundle.verifier

          accountResetToken
            .del()
            .then(Account.get.bind(null, accountResetToken.uid))
            .then(
              function (account) {
                return account.reset(payload)
              }
            )
            .then(function () { return {} })
            .done(reply, reply)
        },
      }
    }
  ]

  return routes
}
