/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var version = require('../package.json').version

module.exports = function (log, P, db, error) {

  var routes = [
    {
      method: 'GET',
      path: '/',
      config: {
        handler: function index(request) {
          log.begin('Defaults.root', request)
          request.reply(
            {
              version: version
            }
          )
        }
      }
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      config: {
        handler: function heartbeat(request) {
          log.begin('Defaults.heartbeat', request)
          db.ping()
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
    },
    {
      method: '*',
      path: '/v0/{p*}',
      config: {
        handler: function v0(request) {
          log.begin('Defaults.v0', request)
          request.reply(error.gone())
        }
      }
    }
  ]

  return routes
}
