/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import WebSocket from 'ws';

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
    throw new Error('Server is required');
  }

  this.server = options.server;
  this.channelId = options.channelId;
}

/**
 * Gets a subscription from the push server
 * Returns a promise which resolves to a subscription object.
 *
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/PushManager/getSubscription
 * @returns {Promise}
 */
PushManager.prototype.getSubscription = function getSubscription() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(this.server);

    // Registration is a two-step handshake.
    // We send and receive a "hello" message, then send and receive a "register" message.
    // See http://mozilla-push-service.readthedocs.io/en/latest/design/#simplepush-protocol

    function send(msg) {
      ws.send(JSON.stringify(msg), { mask: true }, (err) => {
        if (err) {
          onError(err);
        }
      });
    }

    function onError(err) {
      reject(err);
      ws.close();
    }

    const handlers = {
      hello: () => {
        send({
          messageType: 'register',
          channelID: this.channelId,
        });
      },
      register: (data) => {
        resolve({
          endpoint: data.pushEndpoint,
        });
        ws.close();
      },
      '': (data) => {
        onError(new Error(`Unexpected ws message: ${JSON.stringify(data)}`));
      },
    };

    ws.on('open', () => {
      send({
        messageType: 'hello',
        use_webpush: true,
      });
    })
      .on('error', (code, description) => {
        onError(new Error(code + description));
      })
      .on('message', (data, flags) => {
        data = JSON.parse(data);
        if (data && data.messageType) {
          const handler = handlers[data.messageType] || handlers[''];
          handler(data);
        }
      });
  });
};

export { PushManager };
