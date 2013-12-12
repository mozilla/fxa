/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = require('./validators').HEX_STRING
var HEX_EMAIL = require('./validators').HEX_EMAIL

module.exports = function (log, crypto, P, uuid, isA, error, db, mailer, isProduction) {

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
            email: isA.String().max(1024).regex(HEX_EMAIL).required(),
            srp: isA.Object({
              type: isA.String().max(64).valid('SRP-6a/SHA256/2048/v1').required(),
              verifier: isA.String().min(512).max(512).regex(HEX_STRING).required(),
              salt: isA.String().min(64).max(64).regex(HEX_STRING).required(),
            }).required(),
            passwordStretching: isA.Object(
              {
                type: isA.String().required().valid('PBKDF2/scrypt/PBKDF2/v1'),
                PBKDF2_rounds_1: isA.Number().integer().min(20000).max(20000).required(),
                scrypt_N: isA.Number().integer().min(65536).max(65536).required(),
                scrypt_r: isA.Number().integer().min(8).max(8).required(),
                scrypt_p: isA.Number().integer().min(1).max(1).required(),
                PBKDF2_rounds_2: isA.Number().integer().min(20000).max(20000).required(),
                salt: isA.String().min(64).max(64).regex(HEX_STRING).required()
              }
            ).required(),
            preVerified: isA.Boolean()
          }
        },
        handler: function accountCreate(request) {
          log.begin('Account.create', request)
          var form = request.payload
          var email = Buffer(form.email, 'hex').toString()
          db.accountExists(email)
            .then(
              function (exists) {
                if (exists) {
                  throw error.accountExists(email)
                }
              }
            )
            .then(
              db.createAccount.bind(
                db,
                {
                  uid: uuid.v4('binary'),
                  email: email,
                  emailCode: crypto.randomBytes(4).toString('hex'),
                  verified: form.preVerified || false,
                  srp: form.srp,
                  kA: crypto.randomBytes(32),
                  wrapKb: crypto.randomBytes(32),
                  passwordStretching: form.passwordStretching,
                  devices: {},
                  accountResetToken: null,
                  forgotPasswordToken: null
                }
              )
            )
            .then(
              function (account) {
                if (account.verified) {
                  return P(account)
                }
                return mailer.sendVerifyCode(
                  account,
                  account.emailCode,
                  request.app.preferredLang
                )
                .then(function () { return account })
              }
            )
            .done(
              function (account) {
                request.reply(
                  {
                    uid: account.uid.toString('hex')
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
          log.begin('Account.devices', request)
          var sessionToken = request.auth.credentials
          db.accountDevices(sessionToken.uid)
            .done(
              function (devices) {
                request.reply(
                  {
                    devices: Object.keys(devices)
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
          log.begin('Account.keys', request)
          var reply = request.reply.bind(request)
          var keyFetchToken = request.auth.credentials
          db.deleteKeyFetchToken(keyFetchToken)
            .then(
              function () {
                if (!keyFetchToken.verified) {
                  throw error.unverifiedAccount()
                }
                return keyFetchToken.bundleKeys(keyFetchToken.kA,
                                                keyFetchToken.wrapKb)
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
          log.begin('Account.RecoveryEmailStatus', request)
          var sessionToken = request.auth.credentials
          request.reply(
            {
              email: sessionToken.email,
              verified: sessionToken.verified
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
          log.begin('Account.RecoveryEmailResend', request)
          var sessionToken = request.auth.credentials
          mailer.sendVerifyCode(
            sessionToken,
            sessionToken.emailCode,
            request.app.preferredLang
          ).done(
            function () {
              request.reply({})
            },
            function (err) {
              request.reply(err)
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
          log.begin('Account.RecoveryEmailVerify', request)
          var uid = request.payload.uid
          var code = request.payload.code
          db.account(Buffer(uid, 'hex'))
            .then(
              function (account) {
                if (code !== account.emailCode) {
                  throw error.invalidVerificationCode()
                }
                return db.verifyEmail(account)
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
            uid: isA.String().max(32).regex(HEX_STRING).required(),
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
            // The bundle is wrapKb + srpVerifier + HMAC, hex-encoded.
            bundle: isA.String().max((32 + 256 + 32) * 2).regex(HEX_STRING).required(),
            srp: isA.Object({
              type: isA.String().max(64).required(),
              salt: isA.String().min(64).max(64).regex(HEX_STRING).required()
            }).required(),
            passwordStretching: isA.Object()
          }
        },
        handler: function accountReset(request) {
          log.begin('Account.reset', request)
          var reply = request.reply.bind(request)
          var accountResetToken = request.auth.credentials
          var payload = request.payload
          accountResetToken.unbundleAccountData(payload.bundle)
            .then(
              function (unbundle) {
                payload.wrapKb = unbundle.wrapKb
                payload.srp.verifier = unbundle.verifier
                return db.resetAccount(accountResetToken, payload)
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
          log.begin('Account.destroy', request)
          var reply = request.reply.bind(request)
          var authToken = request.auth.credentials
          db.deleteAccount(authToken)
            .then(function () { return {} })
            .done(reply, reply)
        }
      }
    }
  ]

  if (isProduction) {
    delete routes[0].config.validate.payload.preVerified
  }

  return routes
}
