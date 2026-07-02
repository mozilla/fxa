/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  FreeAccessRecord,
  NormalizedAccess,
  ProjectionResult,
  ProjectionSkip,
} from '../types';
import { collectCapabilityMap } from './collectCapabilityMap';
import { parseMatcherValue } from './parseMatcherValue';
import { parseStrictDate } from './parseStrictDate';

export function projectAccess(
  input: NormalizedAccess,
  now: Date
): ProjectionResult {
  const skipped: ProjectionSkip[] = [];

  if (!input.documentId) {
    skipped.push({ reason: 'missing-document-id' });
    return { records: [], skipped };
  }

  const documentId = input.documentId;
  const capabilityMap = collectCapabilityMap(input.capabilities ?? []);
  if (Object.keys(capabilityMap).length === 0) {
    skipped.push({ reason: 'no-capabilities', detail: { documentId } });
    return { records: [], skipped };
  }

  const records: FreeAccessRecord[] = [];
  const createdAt = now.getTime();
  const offeringApiIdentifiers = Object.freeze([
    ...new Set(
      (input.offeringApiIdentifiers ?? []).filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      )
    ),
  ]);

  for (const rawEmails of input.emailLists ?? []) {
    if (Array.isArray(rawEmails)) {
      // Legacy plain-array shape carries no expiry — skip rather than grant forever.
      skipped.push({ reason: 'array-email-form', detail: { documentId } });
      continue;
    }
    if (!rawEmails || typeof rawEmails !== 'object') {
      skipped.push({ reason: 'malformed-emails', detail: { documentId } });
      continue;
    }

    for (const [rawEmail, rawValue] of Object.entries(
      rawEmails as Record<string, unknown>
    )) {
      const email = rawEmail.trim().toLowerCase();
      if (!email) {
        skipped.push({ reason: 'empty-email', detail: { documentId } });
        continue;
      }
      const parsed = parseMatcherValue(rawValue);
      if (!parsed) {
        skipped.push({
          reason: 'malformed-tuple',
          detail: { documentId, email },
        });
        continue;
      }
      const { dateStr, description } = parsed;
      const expiresAtDate = parseStrictDate(dateStr);
      if (!expiresAtDate) {
        skipped.push({
          reason: 'invalid-date',
          detail: { documentId, email, value: dateStr },
        });
        continue;
      }
      if (expiresAtDate.getTime() <= now.getTime()) {
        skipped.push({ reason: 'past-expiry', detail: { documentId, email } });
        continue;
      }
      records.push({
        entitlementId: documentId,
        email,
        offeringApiIdentifiers,
        capabilities: capabilityMap,
        expiresAt: expiresAtDate.getTime(),
        description: description ?? '',
        internalName: input.internalName ?? '',
        createdAt,
      });
    }
  }

  return { records, skipped };
}
