/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedEntries: { domain: string; createdAt: number }[] | null = null;
let cacheExpiresAt = 0;

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
    cachedEntries = null;
    cacheExpiresAt = 0;
  }

  /**
   * Returns the blocked domain if the email's domain is in the blocklist, or null.
   * Results are cached in-process for up to 5 minutes to avoid a full-table read
   * on every account registration. Writes invalidate the cache immediately.
   * Note: auth-server and admin-server are separate processes, so a write via
   * the admin panel may take up to 5 minutes to be reflected here.
   */
  static async findMatchingDomain(email: string): Promise<string | null> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;

    if (!cachedEntries || Date.now() > cacheExpiresAt) {
      cachedEntries = await DomainBlocklist.findAll();
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }

    const match = cachedEntries.find((entry) => entry.domain === domain);
    return match?.domain ?? null;
  }
}
