/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'node:crypto';

export function hashEventId(eventId: string): string {
  return crypto
    .createHash('sha256')
    .update(eventId, 'utf8')
    .digest()
    .readBigUInt64BE(0)
    .toString();
}
