/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { BusinessEntitlementsQuery } from '../../../__generated__/graphql';

// Mirrors `fxa-shared/subscriptions/types#ClientIdCapabilityMap`. Inlined
// here to keep this package from depending on fxa-shared, which itself
// depends on @fxa/shared/cms via fxa-shared/payments/stripe — importing
// fxa-shared would create a circular build dependency.
type ClientIdCapabilityMap = Record<string, readonly string[]>;

type BusinessEntitlement = NonNullable<
  BusinessEntitlementsQuery['businessEntitlements'][number]
>;

// Shared, frozen empty result returned on every negative lookup. Negative
// lookups dominate the hot path (most users are not on any allowlist), so
// reusing one frozen object avoids per-call allocation and accidental mutation.
const EMPTY_RESULT: ClientIdCapabilityMap = Object.freeze({});

/**
 * Wraps the `businessEntitlements` query result and lets auth-server resolve
 * the `{ clientId → capabilities[] }` map for a given email.
 *
 * The snapshot is walked once at construction time to build an
 * `email → ClientIdCapabilityMap` index, so `findCapabilitiesForEmail` is
 * O(1) for both hits and misses. Combined with the WeakMap cache in
 * `ProductConfigurationManager.getBusinessEntitlements`, the index is built
 * once per StrapiClient cache cycle, not per request.
 */
export class BusinessEntitlementsResultUtil {
  private readonly emailIndex: ReadonlyMap<string, ClientIdCapabilityMap>;

  constructor(private rawResult: BusinessEntitlementsQuery) {
    this.emailIndex = buildEmailIndex(this.entitlements);
  }

  get entitlements() {
    return this.rawResult.businessEntitlements ?? [];
  }

  findCapabilitiesForEmail(email?: string | null): ClientIdCapabilityMap {
    if (!email) return EMPTY_RESULT;
    return this.emailIndex.get(email.toLowerCase()) ?? EMPTY_RESULT;
  }
}

function buildEmailIndex(
  entitlements: ReadonlyArray<BusinessEntitlement | null>
): ReadonlyMap<string, ClientIdCapabilityMap> {
  // Accumulate Sets so we can dedup capability slugs per clientId across
  // multiple entitlements that match the same email, before freezing into
  // the final shape.
  const builder = new Map<string, Map<string, Set<string>>>();

  for (const entitlement of entitlements) {
    if (!entitlement) continue;

    const emails = collectEntitlementEmails(entitlement);
    if (emails.length === 0) continue;

    const capabilityMap = collectEntitlementCapabilities(entitlement);
    if (capabilityMap.size === 0) continue;

    for (const email of emails) {
      let perEmail = builder.get(email);
      if (!perEmail) {
        perEmail = new Map();
        builder.set(email, perEmail);
      }
      for (const [clientId, slugs] of capabilityMap) {
        let set = perEmail.get(clientId);
        if (!set) {
          set = new Set();
          perEmail.set(clientId, set);
        }
        for (const slug of slugs) set.add(slug);
      }
    }
  }

  const index = new Map<string, ClientIdCapabilityMap>();
  for (const [email, perEmail] of builder) {
    const result: Record<string, readonly string[]> = {};
    for (const [clientId, slugs] of perEmail) {
      result[clientId] = Object.freeze(Array.from(slugs));
    }
    index.set(email, Object.freeze(result));
  }
  return index;
}

function collectEntitlementCapabilities(
  entitlement: BusinessEntitlement
): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const capability of entitlement.capabilities ?? []) {
    if (!capability?.slug) continue;
    const services = (capability.services ?? []).filter(
      (s): s is { __typename?: 'Service'; oauthClientId: string } =>
        !!s &&
        typeof s.oauthClientId === 'string' &&
        s.oauthClientId.length > 0
    );
    // No services means no client receives this capability. We could
    // alternatively bucket under ALL_RPS_CAPABILITIES_KEY, but that would
    // diverge from how subscription-derived capabilities behave.
    if (services.length === 0) continue;
    for (const service of services) {
      const key = service.oauthClientId.toLowerCase();
      let slugs = out.get(key);
      if (!slugs) {
        slugs = [];
        out.set(key, slugs);
      }
      slugs.push(capability.slug);
    }
  }
  return out;
}

function collectEntitlementEmails(entitlement: BusinessEntitlement): string[] {
  const out: string[] = [];
  for (const matcher of entitlement.matchers ?? []) {
    if (!matcher) continue;
    if (matcher.__typename !== 'ComponentMatchersEmailList') continue;
    appendNormalizedEmails(matcher.emails, out);
  }
  return out;
}

// `emails` is a Strapi JSON scalar (typed `any` in the generated GraphQL).
// In production it is sent as an object whose keys are the addresses; some
// fixtures and earlier shapes used a plain string array. Accept both.
function appendNormalizedEmails(raw: unknown, out: string[]): void {
  if (!raw) return;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && item.length > 0) {
        out.push(item.toLowerCase());
      }
    }
    return;
  }
  if (typeof raw === 'object') {
    for (const key of Object.keys(raw as Record<string, unknown>)) {
      if (key.length > 0) out.push(key.toLowerCase());
    }
  }
}
