/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Documentation-only aliases (not branded — each is still `string`, so they are
// mutually assignable) to make the Record key positions below self-describing.
export type FreeAccessEmail = string;
export type FreeAccessClientId = string;

// Structurally identical to fxa-shared ClientIdCapabilityMap; duplicated to
// avoid a shared/cms → fxa-shared dependency.
export type FreeAccessCapabilityMap = Record<
  FreeAccessClientId,
  readonly string[]
>;

export interface FreeAccessProjectionEntry {
  capabilities: FreeAccessCapabilityMap;
  offeringApiIdentifiers: readonly string[];
}

export type FreeAccessProjection = Record<
  FreeAccessEmail,
  FreeAccessProjectionEntry
>;

export interface FreeAccessGrant {
  offeringApiIdentifier: string;
  /** epoch ms, start-of-next-day UTC */
  expiresAt: number;
}

/**
 * The full per-offering access, keyed by lowercased email then lowercased
 * clientId. Unlike FreeAccessProjection, offerings are NOT flattened across
 * clients — each client only sees the offerings whose capabilities it holds.
 */
export type FreeAccessByClientProjection = Record<
  FreeAccessEmail,
  Record<FreeAccessClientId, FreeAccessGrant[]>
>;

export interface FreeAccessRecord {
  entitlementId: string;
  email: string;
  offeringApiIdentifiers: readonly string[];
  capabilities: FreeAccessCapabilityMap;
  expiresAt: number;
  description: string;
  internalName: string;
  createdAt: number;
}

export interface NormalizedAccess {
  documentId?: string | null;
  internalName?: string | null;
  offeringApiIdentifiers?: ReadonlyArray<string>;
  capabilities?: ReadonlyArray<{
    slug?: string | null;
    services?: ReadonlyArray<{ oauthClientId?: string | null } | null> | null;
  } | null> | null;
  emailLists?: ReadonlyArray<unknown>;
}

export type ProjectionSkipReason =
  | 'missing-document-id'
  | 'no-capabilities'
  | 'malformed-emails'
  | 'array-email-form'
  | 'empty-email'
  | 'malformed-tuple'
  | 'invalid-date'
  | 'past-expiry';

export interface ProjectionSkip {
  reason: ProjectionSkipReason;
  detail?: Record<string, string>;
}

export interface ProjectionResult {
  records: FreeAccessRecord[];
  skipped: ProjectionSkip[];
}
