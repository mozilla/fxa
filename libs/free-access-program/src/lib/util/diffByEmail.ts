/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { FreeAccessProjection } from '@fxa/shared/cms';

import { capabilityMapsEqual } from './capabilityMapsEqual';

export function diffByEmail(
  before: FreeAccessProjection,
  after: FreeAccessProjection
): string[] {
  const emails = new Set<string>([
    ...Object.keys(before),
    ...Object.keys(after),
  ]);
  const changed: string[] = [];
  for (const email of emails) {
    const b = before[email]?.capabilities ?? {};
    const a = after[email]?.capabilities ?? {};
    if (!capabilityMapsEqual(b, a)) {
      changed.push(email);
    }
  }
  return changed;
}
