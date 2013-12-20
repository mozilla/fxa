/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, isA, error, db) {

  var routes = [
    {
      method: 'POST',
      path: '/session/create',
      config: {
        description: "Creates a new session",
        tags: ["session"],
        auth: {
          strategy: 'authToken'
        },
        handler: function (request) {
          log.begin('Session.create', request)
          var reply = request.reply.bind(request)
          var authToken = request.auth.credentials
          log.security({ event: 'session-create' })
          db.createSession(authToken)
            .then(
              function (tokens) {
                return authToken.bundleSession(
                  tokens.keyFetchToken.data,
                  tokens.sessionToken.data
                )
              }
            )
            .then(
              function (bundle) {
                return {
                  uid: authToken.uid.toString('hex'),
                  verified: authToken.verified,
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
      path: '/session/destroy',
      config: {
        description: "Destroys this session.",
        tags: ["session"],
        auth: {
          strategy: 'sessionToken'
        },
        handler: function (request) {
          log.begin('Session.destroy', request)
          var sessionToken = request.auth.credentials
          log.security({ event: 'session-destroy' })
          db.deleteSessionToken(sessionToken)
            .done(
              function () {
                request.reply({})
              },
              function (err) {
                request.reply(err)
              }
            )
        }
      }
    }
  ]

  return routes
}
