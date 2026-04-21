/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedEntries: { regex: string; createdAt: number }[] | null = null;
let cacheExpiresAt = 0;

export class EmailBlocklist extends BaseAuthModel {
  public static tableName = 'emailBlocklist';

  regex!: string;
  createdAt!: number;

  static async findAll(): Promise<{ regex: string; createdAt: number }[]> {
    return EmailBlocklist.knex()(EmailBlocklist.tableName)
      .select('regex', 'createdAt')
      .orderBy('createdAt', 'desc')
      .orderBy('regex', 'asc');
  }

  /** Inserts regexes; silently skips duplicates via onConflict().ignore(). */
  static async addMany(regexes: string[]): Promise<void> {
    const rows = regexes.map((regex) => ({ regex, createdAt: Date.now() }));
    await EmailBlocklist.knex()(EmailBlocklist.tableName)
      .insert(rows)
      .onConflict('regex')
      .ignore();
    EmailBlocklist.invalidateCache();
  }

  static async removeByRegex(regex: string): Promise<boolean> {
    const count = await EmailBlocklist.knex()(EmailBlocklist.tableName)
      .where({ regex })
      .delete();
    EmailBlocklist.invalidateCache();
    return count > 0;
  }

  static async deleteAll(): Promise<void> {
    await EmailBlocklist.knex()(EmailBlocklist.tableName).delete();
    EmailBlocklist.invalidateCache();
  }

  static invalidateCache(): void {
    cachedEntries = null;
    cacheExpiresAt = 0;
  }

  /**
   * Returns the first blocklist regex that matches the given email, or null.
   * Results are cached in-process for up to 5 minutes to avoid a full-table
   * read on every account registration. Writes invalidate the cache immediately.
   * Note: auth-server and admin-server are separate processes, so a write via
   * the admin panel may take up to 5 minutes to be reflected here.
   */
  static async findMatchingRegex(email: string): Promise<string | null> {
    if (!cachedEntries || Date.now() > cacheExpiresAt) {
      cachedEntries = await EmailBlocklist.findAll();
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }
    for (const entry of cachedEntries) {
      try {
        if (new RegExp(entry.regex).test(email)) {
          return entry.regex;
        }
      } catch {
        // skip malformed stored regex
      }
    }
    return null;
  }
}
