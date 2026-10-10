/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { WafBypassTokenDto } from 'fxa-admin-server/src/types';
import { MOCK_RP_ALL_FIELDS } from '../PageRelyingParties/mocks';

export const mockWafTokens: WafBypassTokenDto[] = [
  {
    id: 'token-1',
    name: 'Example RP token',
    token: 'fake-token-value-1',
    clientId: MOCK_RP_ALL_FIELDS.id,
    createdAt: 1700000000000,
  },
  {
    id: 'token-2',
    name: 'Standalone token',
    token: 'fake-token-value-2',
    clientId: null,
    createdAt: 1700100000000,
  },
];
