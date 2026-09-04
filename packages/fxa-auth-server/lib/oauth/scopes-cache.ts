/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Process-lifetime cache of scope string -> scopes.id for the
// accountAuthorizations v2 dual-write path (FXA-14169).
//
// scope -> id is immutable: ids are never reassigned and scopes are
// effectively never deleted, so a cached hit never needs invalidation.
// Misses are deliberately NOT cached — a scope absent from the scopes table
// today may be seeded later, and the next write must pick it up without a
// process restart. `clear()` is the cache-busting escape hatch if a scope's
// id is ever changed out-of-band.

export type ScopeRow = { scope: string; id: number };

/**
 * Bulk-resolves scope strings to their scopes rows. e.g. a DB query like:
 *   SELECT scope, id FROM scopes WHERE scope IN ( ... )
 * */
export type ScopeResolver = (scopes: string[]) => Promise<ScopeRow[]>;

export interface ResolvedScopeIds {
  /** scope string -> scopes.id for every input scope found in the table. */
  resolved: Map<string, number>;
  /** input scopes with no row in the scopes table (no id; left uncached). */
  missing: string[];
}

export class ScopeIdCache {
  private readonly cache = new Map<string, number>();

  constructor(private readonly resolver: ScopeResolver) {}

  /**
   * Resolve scope strings to their scopes.id. Served from the in-mem cache
   * where possible; a single bulk resolver call fills any misses. Found ids
   * are cached; scopes absent from the table are returned in `missing` and
   * left uncached so a later seed is picked up without a restart.
   */
  async resolve(scopes: string[]): Promise<ResolvedScopeIds> {
    const resolved = new Map<string, number>();
    const uncached: string[] = [];
    const seen = new Set<string>();

    // Dedupe and check the cache first, so we only call the resolver for scopes we haven't seen before.
    // Cache is case-insensitive, but we preserve the original case of the input scopes in the resolved map.
    for (const scope of scopes) {
      const key = scope.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const cachedId = this.cache.get(key);
      if (cachedId !== undefined) {
        resolved.set(scope, cachedId);
      } else {
        uncached.push(scope);
      }
    }

    if (uncached.length > 0) {
      const rows = await this.resolver(uncached);
      const byKey = new Map<string, number>();
      for (const { scope, id } of rows) {
        const key = scope.toLowerCase();
        this.cache.set(key, id);
        byKey.set(key, id);
      }
      for (const scope of uncached) {
        const id = byKey.get(scope.toLowerCase());
        if (id !== undefined) {
          resolved.set(scope, id);
        }
      }
    }

    // Anything we had to look up but the resolver didn't return is missing
    // from the scopes table; leave it uncached so a later seed resolves it.
    const missing = uncached.filter((scope) => !resolved.has(scope));
    return { resolved, missing };
  }

  /** Drop all cached entries. Cache-busting hook; rarely needed (ids are immutable). */
  clear(): void {
    this.cache.clear();
  }
}
