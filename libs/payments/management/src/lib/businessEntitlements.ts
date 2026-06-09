/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { ServicesWithCapabilitiesResultUtil } from '@fxa/shared/cms';

export interface BusinessEntitlementContent {
  clientId: string;
  displayName: string;
  description: string | null;
  capabilities: string[];
}

/**
 * Pure helper: from the user's email-resolved `{ clientId → capabilities[] }`
 * map, produce the list of entitlement cards to render on the subscription
 * management page. Skips any clientId already covered by an active
 * subscription/trial/IAP. Sorted by clientId for stable rendering.
 */
export function buildBusinessEntitlementsForPage(
  entitlementMap: Record<string, readonly string[]>,
  serviceCatalog: ServicesWithCapabilitiesResultUtil,
  subscribedClientIds: Iterable<string>
): BusinessEntitlementContent[] {
  const excluded = new Set<string>();
  for (const id of subscribedClientIds) {
    if (id) excluded.add(id.toLowerCase());
  }

  const out: BusinessEntitlementContent[] = [];
  for (const [rawClientId, capabilities] of Object.entries(entitlementMap)) {
    const clientId = rawClientId.toLowerCase();
    if (excluded.has(clientId)) continue;
    if (!capabilities || capabilities.length === 0) continue;

    const service = serviceCatalog.findServiceByClientId(clientId);
    out.push({
      clientId,
      displayName: service?.internalName ?? rawClientId,
      description: service?.description ?? null,
      capabilities: [...capabilities].sort(),
    });
  }

  out.sort((a, b) => a.clientId.localeCompare(b.clientId));
  return out;
}
