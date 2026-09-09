/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const MISC_DOCS = require('../../docs/swagger/misc-api').default;

module.exports = function (serverPublicKeys) {
  const keys = [serverPublicKeys.primary];
  if (serverPublicKeys.secondary) {
    keys.push(serverPublicKeys.secondary);
  }

  const routes = [
    {
      method: 'GET',
      path: '/.well-known/public-keys',
      options: {
        ...MISC_DOCS.WELLKNOWN_PUBLIC_KEYS,
      },
      handler: async function (request) {
        // FOR DEV PURPOSES ONLY
        return {
          keys: keys,
        };
      },
    },
  ];

  return routes;
};
