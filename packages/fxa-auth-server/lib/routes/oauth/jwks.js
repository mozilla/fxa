/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { PUBLIC_KEYS } = require('../../oauth/keys');
const MISC_DOCS = require('../../../docs/swagger/misc-api').default;

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
