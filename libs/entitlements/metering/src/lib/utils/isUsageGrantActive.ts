/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Timestamp } from '@google-cloud/firestore';

export function isUsageGrantActive(
  expiresAt: Timestamp | null,
  now: Date
): boolean {
  if (expiresAt === null) {
    return true;
  }
  return expiresAt.toMillis() > now.getTime();
}
