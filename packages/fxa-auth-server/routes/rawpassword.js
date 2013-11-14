/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, isA, error, public_url, Client, crypto, db) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  var routes = [
    {
      method: 'POST',
      path: '/raw_password/session/create',
      config: {
        description: 'Create a session from an email and password',
        tags: ['raw', 'session'],
        handler: function (request) {
          log.begin('RawPassword.sessionCreate', request)
          Client.login(
            public_url,
            Buffer(request.payload.email, 'hex').toString('utf8'),
            request.payload.password
          )
          .done(
            function (client) {
              return request.reply(
                {
                  uid: client.uid,
                  verified: client.verified,
                  sessionToken: client.sessionToken
                }
              )
            },
            function (err) {
              request.reply(error.wrap(err))
            }
          )
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_STRING).required(),
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
          var form = request.payload
          Client.create(
            public_url,
            Buffer(form.email, 'hex').toString('utf8'),
            form.password
          )
          .done(
            function (client) {
              request.reply({ uid: client.uid })
            },
            function (err) {
              request.reply(error.wrap(err))
            }
          )
        },
        validate: {
          payload: {
            // TODO: still need to validate the utf8 string is a valid email
            email: isA.String().max(1024).regex(HEX_STRING).required(),
            password: isA.String().required()
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
          var form = request.payload
          Client.changePassword(
            public_url,
            Buffer(form.email, 'hex').toString('utf8'),
            form.oldPassword,
            form.newPassword
          )
          .done(
            function (client) {
              return request.reply({})
            },
            function (err) {
              request.reply(error.wrap(err))
            }
          )
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_STRING).required(),
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
        description: 'Creates an account associated with an email address',
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
                var client = new Client()
                client.email = account.email
                return client.setupCredentials(null, form.newPassword)
                  .then(
                    function () {
                      var stretching = account.passwordStretching
                      stretching.salt = client.passwordSalt
                      return {
                        srp: client.srp,
                        passwordStretching: stretching,
                        wrapKb: crypto.randomBytes(32).toString('hex')
                      }
                    }
                  )
              }
            )
            .then(
              function (payload) {
                return db.resetAccount(accountResetToken, payload)
              }
            )
            .done(
              function () {
                return request.reply({})
              },
              function (err) {
                request.reply(error.wrap(err))
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

  return routes
}
