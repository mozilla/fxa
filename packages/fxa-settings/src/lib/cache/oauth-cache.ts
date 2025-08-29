/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { storage } from '../storage/storage';

const STORAGE_KEY__OAUTH = 'oauth';

/**
 * Clears any existing oauth data from the cache'
 */
export function clearOAuthData() {
  storage.local.remove(STORAGE_KEY__OAUTH);
}
