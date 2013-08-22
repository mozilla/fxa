/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (P, kv) {

  var routes = [
    {
      method: 'GET',
      path: '/',
      config: {
        handler: function index(request) {
          request.reply("ok").type('text/plain')
        }
      }
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      config: {
        handler: function heartbeat(request) {
          P.all([kv.store.ping(), kv.cache.ping()])
            .then(
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
