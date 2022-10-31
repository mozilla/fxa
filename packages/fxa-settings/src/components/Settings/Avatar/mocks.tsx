/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from '../../../models';

export const MOCK_AVATAR_DEFAULT = {
  avatar: { id: null, url: null },
} as unknown as Account;

export const MOCK_AVATAR_NON_DEFAULT = {
  avatar: { id: 'abc123', url: 'http://placekitten.com/512/512' },
} as unknown as Account;
