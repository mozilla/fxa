/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const nodeCookie = require('node-cookie');

function unauthorized(res) {
  res.send(403, 'Unauthorized');
}

module.exports = (config) => {
  // TODO - get just the origin
  const managementUrl = config.get('subscriptions.managementUrl');
  const allowedOrigins = new Set([
    managementUrl,
    'http://127.0.0.1:3030'
  ]);
  return {
    cors: {
      credentials: true,
      methods: 'GET',
      origin: config.get('subscriptions.managementUrl'),
      preflightContinue: false
    },
    method: 'get',
    path: '/payments-pkce',
    process (req, res) {
      // Just in case someone isn't using CORS
      const origin = req.get('origin');
      if (! allowedOrigins.has(origin)) {
        return unauthorized(res);
      }
      const cookie = nodeCookie.get(req, '_pkce', 'YOU MUST CHANGE ME', true);
      if (! cookie) {
        // TODO - uh oh
        return unauthorized(res);
      }
      //nodeCookie.create(req, '_pkce', ' ');
      nodeCookie.clear(res, '_pkce');

      const data = JSON.parse(cookie);
      res.json(data);
    }
  };
};
