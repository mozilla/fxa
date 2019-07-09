/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');

module.exports = (log, db, config) => {
  return [
    {
      method: 'GET',
      path: '/securityEvents',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: async function(request) {
        log.begin('SecurityEvents', request);
        let sessionToken, uid;
        if (request.auth.credentials) {
          sessionToken = request.auth.credentials;
          uid = sessionToken.uid;
        }

        const securityEvents = await db.securityEventsByUid(uid);
        return [
          {
            name: 'fake event',
            sessionToken,
            securityEvents,
          },
        ];
      },
    },
  ];
};
