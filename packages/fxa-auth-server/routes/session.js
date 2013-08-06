/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, error, Account, tokens) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

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
          var reply = request.reply.bind(request)
          var authToken = request.auth.credentials
          var keyFetchToken = null
          var sessionToken = null
          authToken.del()
            .then(
              function () {
                return tokens.KeyFetchToken.create(authToken.uid)
              }
            )
            .then(function (t) { keyFetchToken = t })
            .then(tokens.SessionToken.create.bind(null, authToken.uid))
            .then(function (t) { sessionToken = t })
            .then(Account.get.bind(null, authToken.uid))
            .then(
              function (account) {
                return account.addSessionToken(sessionToken)
              }
            )
            .then(
              function () {
                return {
                  bundle: authToken.bundle(keyFetchToken, sessionToken)
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
          var sessionToken = request.auth.credentials
          sessionToken
            .del()
            .then(
              function () {
                return Account.get(sessionToken.uid)
              }
            )
            .then(
              function (account) {
                return account.deleteSessionToken(sessionToken.id)
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
      }
    }
  ]

  return routes
}
