/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccessesQuery } from '../../../__generated__/graphql';
import { normalizeGraphQLAccess } from './utils/normalizeGraphQLAccess';
import { parseMatcherValue } from './utils/parseMatcherValue';
import { parseStrictDate } from './utils/parseStrictDate';
import { projectAccess } from './utils/projectAccess';
import {
  FreeAccessByClientProjection,
  FreeAccessGrant,
  FreeAccessProjection,
  FreeAccessProjectionEntry,
} from './types';

export class AccessUtil {
  constructor(private rawResult: AccessesQuery) {}

  project(): FreeAccessProjection {
    const result = this.rawResult;
    const builder = new Map<
      string,
      {
        caps: Map<string, Set<string>>;
        offerings: Set<string>;
      }
    >();
    const now = new Date();
    for (const access of result.accesses ?? []) {
      if (!access) continue;
      const { records } = projectAccess(normalizeGraphQLAccess(access), now);
      for (const record of records) {
        let entry = builder.get(record.email);
        if (!entry) {
          entry = {
            caps: new Map(),
            offerings: new Set(),
          };
          builder.set(record.email, entry);
        }
        for (const [clientId, slugs] of Object.entries(record.capabilities)) {
          const key = clientId.toLowerCase();
          let slugSet = entry.caps.get(key);
          if (!slugSet) {
            slugSet = new Set();
            entry.caps.set(key, slugSet);
          }
          for (const slug of slugs) slugSet.add(slug);
        }
        for (const id of record.offeringApiIdentifiers ?? []) {
          if (id) entry.offerings.add(id);
        }
      }
    }
    const projection: FreeAccessProjection = {};
    for (const [email, { caps, offerings }] of builder) {
      const capabilities: Record<string, readonly string[]> = {};
      for (const [clientId, slugs] of caps) {
        capabilities[clientId] = [...slugs];
      }
      const entry: FreeAccessProjectionEntry = {
        capabilities,
        offeringApiIdentifiers: [...offerings],
      };
      projection[email] = entry;
    }
    return projection;
  }

  /**
   * Resolves the raw access into a per-email, per-client map of granted
   * offerings. Each offering is attributed only to the clients whose
   * capabilities it actually carries (offering → capability → service →
   * oauthClientId), so a client never sees offerings granted to a different
   * client on the same email — unlike project(), which flattens offerings
   * across clients.
   */
  projectByClient(): FreeAccessByClientProjection {
    const result = this.rawResult;
    const now = Date.now();
    // email -> clientId -> offeringApiIdentifier -> expiresAt (ms)
    const builder = new Map<string, Map<string, Map<string, number>>>();

    for (const access of result.accesses ?? []) {
      if (!access) continue;

      for (const matcher of access.matchers ?? []) {
        if (matcher?.__typename !== 'ComponentMatchersEmailList') continue;
        const emails = matcher.emails;
        if (!emails || typeof emails !== 'object' || Array.isArray(emails)) {
          continue;
        }

        for (const [rawEmail, rawValue] of Object.entries(
          emails as Record<string, unknown>
        )) {
          const email = rawEmail.trim().toLowerCase();
          if (!email) continue;
          const parsed = parseMatcherValue(rawValue);
          if (!parsed) continue;
          const expiresAtDate = parseStrictDate(parsed.dateStr);
          if (!expiresAtDate) continue;
          const expiresAt = expiresAtDate.getTime();
          if (expiresAt <= now) continue;

          for (const offering of access.offerings ?? []) {
            const offeringApiIdentifier = offering?.apiIdentifier;
            if (
              typeof offeringApiIdentifier !== 'string' ||
              offeringApiIdentifier.length === 0
            ) {
              continue;
            }

            const clientIds = new Set<string>();
            for (const capability of offering?.capabilities ?? []) {
              for (const service of capability?.services ?? []) {
                const clientId = service?.oauthClientId;
                if (typeof clientId === 'string' && clientId.length > 0) {
                  clientIds.add(clientId.toLowerCase());
                }
              }
            }
            if (clientIds.size === 0) continue;

            let byClient = builder.get(email);
            if (!byClient) {
              byClient = new Map();
              builder.set(email, byClient);
            }
            for (const clientId of clientIds) {
              let byOffering = byClient.get(clientId);
              if (!byOffering) {
                byOffering = new Map();
                byClient.set(clientId, byOffering);
              }
              // Most-generous grant wins across accesses for the same pairing.
              byOffering.set(
                offeringApiIdentifier,
                Math.max(byOffering.get(offeringApiIdentifier) ?? 0, expiresAt)
              );
            }
          }
        }
      }
    }

    const projection: FreeAccessByClientProjection = {};
    for (const [email, byClient] of builder) {
      const clients: Record<string, FreeAccessGrant[]> = {};
      for (const [clientId, byOffering] of byClient) {
        clients[clientId] = [...byOffering].map(
          ([offeringApiIdentifier, expiresAt]) => ({
            offeringApiIdentifier,
            expiresAt,
          })
        );
      }
      projection[email] = clients;
    }
    return projection;
  }
}
