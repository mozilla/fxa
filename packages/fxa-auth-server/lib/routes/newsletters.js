/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const validators = require('./validators');

module.exports = (log, db) => {
  return [
    {
      method: 'POST',
      path: '/newsletters',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            newsletters: validators.newsletters,
          },
        },
      },
      handler: async function (request) {
        log.begin('newsletters', request);

        const { uid } = request.auth.credentials;

        const { newsletters } = request.payload;

        const account = await db.account(uid);

        const geoData = request.app.geo;
        const country = geoData.location && geoData.location.country;
        const countryCode = geoData.location && geoData.location.countryCode;

        log.notifyAttachedServices('newsletters:update', request, {
          country,
          countryCode,
          email: account.primaryEmail.email,
          locale: account.locale,
          newsletters,
          uid,
          userAgent: request.headers['user-agent'],
        });

        return {};
      },
    },
  ];
};
