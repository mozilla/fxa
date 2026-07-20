/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { FreeAccessCapabilityMap } from '@fxa/shared/cms';

export function capabilityMapsEqual(
  a: FreeAccessCapabilityMap,
  b: FreeAccessCapabilityMap
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const aSlugs = a[key];
    const bSlugs = b[key];
    if (!bSlugs) return false;
    if (aSlugs.length !== bSlugs.length) return false;
    const bSet = new Set(bSlugs);
    for (const slug of aSlugs) {
      if (!bSet.has(slug)) return false;
    }
  }
  return true;
}
