/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (crypto, uuid, isA, error, Account, RecoveryEmail) {

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
            // TODO: still need to validate the utf8 string is a valid email
            email: isA.String().max(1024).regex(HEX_STRING).required(),
            srp: isA.Object({
              type: isA.String().max(64).required(), // TODO valid()
              verifier: isA.String().max(512).regex(HEX_STRING).required(),
              salt: isA.String().min(64).max(64).regex(HEX_STRING).required(),
            }).required(),
            passwordStretching: isA.Object(
              // {
              //   type: isA.String().required(),
              //   salt: isA.String().regex(HEX_STRING).required()
              // }
            )
          }
        },
        handler: function accountCreate(request) {
          var form = request.payload
          Account
            .create(
              {
                uid: uuid.v4(),
                email: form.email,
                srp: form.srp,
                kA: crypto.randomBytes(32).toString('hex'),
                wrapKb: crypto.randomBytes(32).toString('hex'),
                passwordStretching: form.passwordStretching
              }
            )
            .done(
              function (account) {
                request.reply(
                  {
                    uid: account.uid
                  }
                )
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
      path: '/recovery_email/status',
      config: {
        description:
          "Gets the 'verified' status for the account's recovery email address",
        auth: {
          strategy: 'sessionToken'
        },
        tags: ["account", "recovery"],
        handler: function (request) {
          var sessionToken = request.auth.credentials
          Account
            .get(sessionToken.uid)
            .done(
              function (account) {
                request.reply(
                  {
                    email: account.email,
                    verified: account.verified
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
              email: isA.String().required(),
              verified: isA.Boolean().required()
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/resend_code',
      config: {
        description:
          "Sends a verification code to the specified recovery method. " +
          "Providing this code will mark the recovery method as verified",
        auth: {
          strategy: 'sessionToken'
        },
        tags: ["account", "recovery"],
        handler: function (request) {
          var sessionToken = request.auth.credentials
          Account
            .get(sessionToken.uid)
            .done(
              function (account) {
                return account.primaryRecoveryEmail()
                  .then(
                    function (rm) {
                      return rm.sendVerifyCode()
                    }
                  )
                  .then(
                    function () {
                      request.reply({})
                    },
                    function (err) {
                      request.reply(err)
                    }
                  )
              }
            )
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/verify_code',
      config: {
        description:
          "Verify a recovery method with this code",
        tags: ["account", "recovery"],
        handler: function (request) {
          var uid = request.payload.uid
          var code = request.payload.code
          RecoveryEmail
            .get(uid, code)
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
            uid: isA.String().max(64).required(),
            code: isA.String().max(16).required()
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
            bundle: isA.String().max((32 + 256) * 2).regex(HEX_STRING).required(),
            srp: isA.Object({
              type: isA.String().max(64).required(),
              salt: isA.String().min(64).max(64).regex(HEX_STRING).required()
            }).required(),
            passwordStretching: isA.Object()
          }
        },
        handler: function accountReset(request) {
          var reply = request.reply.bind(request)
          var accountResetToken = request.auth.credentials
          var payload = request.payload
          var unbundle = accountResetToken.unbundle(payload.bundle)
          payload.wrapKb = unbundle.wrapKb
          payload.srp.verifier = unbundle.verifier

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
    },
    {
      method: 'POST',
      path: '/account/destroy',
      config: {
        auth: {
          strategy: 'authToken'
        },
        tags: ["account"],
        handler: function accountDestroy(request) {
          var reply = request.reply.bind(request)
          var authToken = request.auth.credentials

          authToken.del()
            .then(
              function () {
                return Account.del(authToken.uid)
              }
            )
            .done(reply, reply)
        }
      }
    }
  ]

  return routes
}
