/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Structurally identical to fxa-shared ClientIdCapabilityMap; duplicated to
// avoid a shared/cms → fxa-shared dependency.
export type FreeAccessCapabilityMap = Record<string, readonly string[]>;

export interface FreeAccessProjectionEntry {
  capabilities: FreeAccessCapabilityMap;
  offeringApiIdentifiers: readonly string[];
}

export type FreeAccessProjection = Record<string, FreeAccessProjectionEntry>;

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
