/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PUBLIC_KEYS } from '../../oauth/keys';

import { default as OAUTH_SERVER_DOCS } from '../../../docs/swagger/oauth-server-api';

export default () => ({
  method: 'GET',
  path: '/jwks',
  config: {
    ...OAUTH_SERVER_DOCS.JWKS_GET,
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
