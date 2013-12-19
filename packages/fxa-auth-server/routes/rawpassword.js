/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = require('./validators').HEX_STRING
var HEX_EMAIL = require('./validators').HEX_EMAIL

module.exports = function (log, isA, error, clientHelper, crypto, db, isProduction) {

  function enqueueWithHelper(message, cb) {
    clientHelper.enqueue(message, function(err, result) {
      if (err) {
        log.error({ op: 'clientHelper.enqueue', err: err, result: result })
        return cb(error.serviceUnavailable())
      }
      if (result && result.err) {
        return cb(result.err)
      }
      return cb(null, result)
    })
  }

  var routes = [
    {
      method: 'POST',
      path: '/raw_password/session/create',
      config: {
        description: 'Create a session from an email and password',
        tags: ['raw', 'session'],
        handler: function (request) {
          log.begin('RawPassword.sessionCreate', request)
          enqueueWithHelper(
            {
              action: 'session/create',
              email: Buffer(request.payload.email, 'hex').toString('utf8'),
              password: request.payload.password
            },
            function (err, result) {
              if (err) {
                err = error.wrap(err)
                log.security({ event: 'login-failure', err: err })
                return request.reply(err)
              }
              log.security({ event: 'login-success' })
              return request.reply(result)
            }
          )
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_EMAIL).required(),
            password: isA.String().required()
          },
          response: {
            schema: {
              uid: isA.String().required(),
              verified: isA.Boolean().required(),
              sessionToken: isA.String().regex(HEX_STRING).required()
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/raw_password/account/create',
      config: {
        description: 'Creates an account associated with an email address',
        tags: ['raw', 'account'],
        handler: function accountCreate(request) {
          log.begin('RawPassword.accountCreate', request)
          enqueueWithHelper(
            {
              action: 'account/create',
              email: Buffer(request.payload.email, 'hex').toString('utf8'),
              password: request.payload.password,
              options: {
                preVerified: request.payload.preVerified || false,
                service: request.payload.service,
                lang: request.app.preferredLang
              }
            },
            function (err, result) {
              if (err) {
                return request.reply(error.wrap(err))
              }
              return request.reply(result)
            }
          )
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_EMAIL).required(),
            password: isA.String().required(),
            preVerified: isA.Boolean(),
            service: isA.String().max(16).alphanum().optional()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/raw_password/password/change',
      config: {
        description: 'Creates an account associated with an email address',
        tags: ['raw', 'account'],
        handler: function passwordChange(request) {
          log.begin('RawPassword.passwordChange', request)
          enqueueWithHelper(
            {
              action: 'password/change',
              email: Buffer(request.payload.email, 'hex').toString('utf8'),
              oldPassword: request.payload.oldPassword,
              newPassword: request.payload.newPassword
            },
            function (err, result) {
              if (err) {
                err = error.wrap(err)
                log.security({ event: 'pwd-change-failure', err: err })
                return request.reply(err);
              }
              log.security({ event: 'pwd-change-success' })
              return request.reply(result)
            }
          )
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_EMAIL).required(),
            oldPassword: isA.String().required(),
            newPassword: isA.String().required()
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/raw_password/password/reset',
      config: {
        description: 'Resets the password associated with an account',
        auth: {
          strategy: 'accountResetToken'
        },
        tags: ['raw', 'account'],
        handler: function passwordReset(request) {
          log.begin('RawPassword.passwordReset', request)
          var accountResetToken = request.auth.credentials
          var form = request.payload

          db.account(accountResetToken.uid)
            .then(
              function (account) {
                enqueueWithHelper(
                  {
                    action: 'password/reset',
                    email: account.email,
                    newPassword: form.newPassword,
                    passwordStretching: account.passwordStretching
                  },
                  function (err, result) {
                    if (err) {
                      err = error.wrap(err)
                      log.security({ event: 'pwd-reset-failure', err: err })
                      return request.reply(err)
                    }
                    log.security({ event: 'pwd-reset-success' })
                    result.wrapKb = crypto.randomBytes(32)
                    db.resetAccount(accountResetToken, result)
                      .done(
                        function () {
                          return request.reply({})
                        },
                        function (err) {
                          return request.reply(error.wrap(err))
                        }
                      )
                  }
                )
              }
            )
        },
        validate: {
          payload: {
            newPassword: isA.String().required()
          }
        }
      }
    },
  ]

  if (isProduction) {
    delete routes[1].config.validate.payload.preVerified
  }

  return routes
}
