/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthScopeDto } from 'fxa-admin-server/src/types';

export const mockOAuthScopes: OAuthScopeDto[] = [
  {
    id: 1,
    scope: 'https://identity.mozilla.com/apps/oldsync',
    hasScopedKeys: true,
  },
  { id: 2, scope: 'profile', hasScopedKeys: false },
];
