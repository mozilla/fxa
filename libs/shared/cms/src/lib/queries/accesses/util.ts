/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccessesQuery } from '../../../__generated__/graphql';
import { normalizeGraphQLAccess } from './utils/normalizeGraphQLAccess';
import { projectAccess } from './utils/projectAccess';
import { FreeAccessProjection, FreeAccessProjectionEntry } from './types';

export class AccessUtil {
  constructor(private rawResult: AccessesQuery) {}

  project(): FreeAccessProjection {
    const result = this.rawResult;
    const builder = new Map<
      string,
      { caps: Map<string, Set<string>>; offerings: Set<string> }
    >();
    const now = new Date();
    for (const access of result.accesses ?? []) {
      if (!access) continue;
      const { records } = projectAccess(normalizeGraphQLAccess(access), now);
      for (const record of records) {
        let entry = builder.get(record.email);
        if (!entry) {
          entry = { caps: new Map(), offerings: new Set() };
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
}
