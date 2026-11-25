/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

const CACHE_TTL_MS = 60 * 1000;
const CACHE_MAX_ENTRIES = 10_000;

// Misses are cached too, so repeat signups from one domain do not hit MySQL.
const cache = new Map<string, { blocked: string | null; expiresAt: number }>();

export class DomainBlocklist extends BaseAuthModel {
  public static tableName = 'domainBlocklist';

  domain!: string;
  createdAt!: number;

  static async findAll(): Promise<{ domain: string; createdAt: number }[]> {
    return DomainBlocklist.knex()(DomainBlocklist.tableName)
      .select('domain', 'createdAt')
      .orderBy('createdAt', 'desc')
      .orderBy('domain', 'asc');
  }

  static async findByDomain(domain: string): Promise<string | null> {
    const row = await DomainBlocklist.knex()(DomainBlocklist.tableName)
      .select('domain')
      .where({ domain })
      .first();
    return row?.domain ?? null;
  }

  /** Inserts domains; silently skips duplicates via onConflict().ignore(). */
  static async addMany(domains: string[]): Promise<void> {
    const rows = domains.map((domain) => ({ domain, createdAt: Date.now() }));
    await DomainBlocklist.knex()(DomainBlocklist.tableName)
      .insert(rows)
      .onConflict('domain')
      .ignore();
    DomainBlocklist.invalidateCache();
  }

  static async removeByDomain(domain: string): Promise<boolean> {
    const count = await DomainBlocklist.knex()(DomainBlocklist.tableName)
      .where({ domain })
      .delete();
    DomainBlocklist.invalidateCache();
    return count > 0;
  }

  static async deleteAll(): Promise<void> {
    await DomainBlocklist.knex()(DomainBlocklist.tableName).delete();
    DomainBlocklist.invalidateCache();
  }

  static invalidateCache(): void {
    cache.clear();
  }

  /**
   * Returns the blocked domain if the email's domain is in the blocklist, or null.
   * Each domain's result is cached in-process for CACHE_TTL_MS. Writes clear the
   * cache, but auth-server and admin-server are separate processes, so an admin
   * write can take up to CACHE_TTL_MS to show here.
   */
  static async findMatchingDomain(email: string): Promise<string | null> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;

    const now = Date.now();
    const cached = cache.get(domain);
    if (cached && now <= cached.expiresAt) return cached.blocked;

    const blocked = await DomainBlocklist.findByDomain(domain);
    if (cache.size >= CACHE_MAX_ENTRIES) cache.clear();
    cache.set(domain, { blocked, expiresAt: now + CACHE_TTL_MS });
    return blocked;
  }
}
