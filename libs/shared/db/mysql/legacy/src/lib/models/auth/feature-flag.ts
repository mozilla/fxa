/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

export interface FeatureFlagRow {
  name: string;
  enabled: boolean;
  description: string;
  updatedAt: number;
  updatedBy: string;
}

// Set from host config at boot; reads throw until it is.
let cacheTtlMs: number | undefined;
let cachedFlags: FeatureFlagRow[] | null = null;
let cacheExpiresAt = 0;

/** MySQL hands back TINYINT(1) as 0/1; normalize to booleans at the boundary. */
function toRow(raw: any): FeatureFlagRow {
  return {
    name: raw.name,
    enabled: !!raw.enabled,
    description: raw.description ?? '',
    updatedAt: Number(raw.updatedAt),
    updatedBy: raw.updatedBy,
  };
}

export class FeatureFlag extends BaseAuthModel {
  public static tableName = 'featureFlags';
  public static idColumn = 'name';

  name!: string;
  enabled!: boolean;
  description!: string;
  updatedAt!: number;
  updatedBy!: string;

  /**
   * Sets how long reads are served from the in-process cache. The host passes
   * its config value once at boot so the TTL is tunable without a deploy. A
   * TTL of 0 reads through to the database on every call.
   */
  static setCacheTtlMs(ms: number): void {
    cacheTtlMs = ms;
    FeatureFlag.invalidateCache();
  }

  /** Every flag with its metadata. Bypasses the cache. */
  static async findAll(): Promise<FeatureFlagRow[]> {
    const rows = await FeatureFlag.knex()(FeatureFlag.tableName)
      .select('name', 'enabled', 'description', 'updatedAt', 'updatedBy')
      .orderBy('name', 'asc');
    return rows.map(toRow);
  }

  /** Creates the flag, or overwrites every field of an existing one. */
  static async upsert(
    flag: Pick<FeatureFlagRow, 'name' | 'enabled' | 'description'>,
    updatedBy: string
  ): Promise<void> {
    await FeatureFlag.knex()(FeatureFlag.tableName)
      .insert({
        name: flag.name,
        enabled: flag.enabled,
        description: flag.description,
        updatedAt: Date.now(),
        updatedBy,
      })
      .onConflict('name')
      .merge(['enabled', 'description', 'updatedAt', 'updatedBy']);
    FeatureFlag.invalidateCache();
  }

  static async remove(name: string): Promise<boolean> {
    const count = await FeatureFlag.knex()(FeatureFlag.tableName)
      .where({ name })
      .delete();
    FeatureFlag.invalidateCache();
    return count > 0;
  }

  static invalidateCache(): void {
    cachedFlags = null;
    cacheExpiresAt = 0;
  }

  /**
   * Every flag as a `{ name: enabled }` map, served from an in-process cache.
   *
   * The cache is per-process and writes land in a different process (the admin
   * server), so a flip takes up to one TTL to reach any given auth-server pod,
   * plus skew between pods. Size the TTL against how fast a flip must land.
   */
  static async getFlagMap(): Promise<Record<string, boolean>> {
    if (cacheTtlMs === undefined) {
      throw new Error(
        'FeatureFlag cache TTL is not configured; call setCacheTtlMs at boot'
      );
    }
    if (!cachedFlags || Date.now() >= cacheExpiresAt) {
      cachedFlags = await FeatureFlag.findAll();
      cacheExpiresAt = Date.now() + cacheTtlMs;
    }

    return Object.fromEntries(
      cachedFlags.map((flag) => [flag.name, flag.enabled])
    );
  }
}
