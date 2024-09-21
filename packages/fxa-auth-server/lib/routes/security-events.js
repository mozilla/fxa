/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const SECURITY_EVENTS_DOCS =
  require('../../docs/swagger/security-events-api').default;

module.exports = (log, db, config) => {
  return [
    {
      method: 'GET',
      path: '/securityEvents',
      options: {
        ...SECURITY_EVENTS_DOCS.SECURITYEVENTS_GET,
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: async function (request) {
        log.begin('SecurityEventsGet', request);
        const { uid } = request.auth.credentials;

        const events = await db.securityEventsByUid({ uid });
        return events;
      },
    },
  ];
};
