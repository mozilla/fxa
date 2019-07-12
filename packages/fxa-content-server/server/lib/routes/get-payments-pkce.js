/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

function unauthorized(res) {
  res.send(403, 'Unauthorized');
}
module.exports = config => {
  // TODO - get just the origin
  const managementUrl = config.get('subscriptions.managementUrl');
  const allowedOrigins = new Set([
    managementUrl,
    'http://127.0.0.1:3030',
    'http://127.0.0.1:3031',
  ]);
  return {
    cors: {
      credentials: true,
      methods: 'GET',
      origin: config.get('subscriptions.managementUrl'),
      preflightContinue: false,
    },
    method: 'get',
    path: '/payments-pkce',
    process(req, res) {
      // Just in case someone isn't using CORS
      const origin = req.get('origin');
      if (!allowedOrigins.has(origin)) {
        console.log('origin', origin);
        return unauthorized(res);
      }
      const cookie = req.cookies['_pkce'];
      console.log('cookie', cookie);

      if (!cookie) {
        // TODO - uh oh
        return unauthorized(res);
      }

      const data = JSON.parse(cookie);
      res.json(data);
    },
  };
};
