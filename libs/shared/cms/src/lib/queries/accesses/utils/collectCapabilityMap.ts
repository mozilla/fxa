/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { FreeAccessCapabilityMap, NormalizedAccess } from '../types';

export function collectCapabilityMap(
  capabilities: NonNullable<NormalizedAccess['capabilities']>
): FreeAccessCapabilityMap {
  const builder = new Map<string, Set<string>>();
  for (const capability of capabilities) {
    if (!capability?.slug) continue;
    for (const service of capability.services ?? []) {
      if (!service?.oauthClientId) continue;
      const key = service.oauthClientId.toLowerCase();
      let set = builder.get(key);
      if (!set) {
        set = new Set();
        builder.set(key, set);
      }
      set.add(capability.slug);
    }
  }
  const out: Record<string, readonly string[]> = {};
  for (const [clientId, slugs] of builder) {
    out[clientId] = Object.freeze(Array.from(slugs));
  }
  return out;
}
