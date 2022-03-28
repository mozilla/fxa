/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MISC_DOCS from '../../../docs/swagger/misc-api';

const { PUBLIC_KEYS } = require('../../oauth/keys');

module.exports = () => ({
  method: 'GET',
  path: '/jwks',
  config: {
    ...MISC_DOCS.JWKS_GET,
    cors: { origin: 'ignore' },
    cache: {
      privacy: 'public',
      expiresIn: 10000,
    },
    handler: async function jwks() {
      return { keys: PUBLIC_KEYS };
    },
  },
});
