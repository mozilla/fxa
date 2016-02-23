/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var WebSocket = require('ws')
var P = require('../lib/promise')

/**
 * PushManager, helps create subscriptions against a push server
 *
 * Built based on https://github.com/websockets/wscat
 * Built based on Service Worker Push APIs
 *
 * @param options
 *        Push Manager options
 * @param options.server
 *        Push server setting. i.e wss://push.services.mozilla.com/
 * @param options.channelId
 *        Push channel id, uuid4 format.
 * @constructor
 */
function PushManager(options) {
  if (!options || !options.server) {
    throw new Error('Server is required')
  }

  this.server = options.server
  this.channelId = options.channelId
}

/**
 * Gets a subscription from the push server
 * Returns a promise which resolves to a subscription object.
 *
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/PushManager/getSubscription
 * @returns {Promise}
 */
PushManager.prototype.getSubscription = function getSubscription() {
  var self = this
  var d = P.defer()
  var ws = new WebSocket(this.server)

  ws.on('open', function open() {
    var helloMessage = {
      messageType: 'hello',
      use_webpush: true
    }

    var registerMessage = {
      messageType: 'register',
      channelID: self.channelId
    }

    ws.send(JSON.stringify(helloMessage), { mask: true })
    ws.send(JSON.stringify(registerMessage), { mask: true })
  }).on('error', function error(code, description) {
    ws.close()
    throw new Error(code + description)
  }).on('message', function message(data, flags) {
    data = JSON.parse(data)
    if (data && data.messageType === 'register') {
      ws.close()
      return d.resolve({
        endpoint: data.pushEndpoint
      })
    }
  })

  return d.promise
}

module.exports.PushManager = PushManager
