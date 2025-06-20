/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redis } from 'ioredis';

import { CMSConfigFetchError, StrapiConfigNotFoundError, StrapiFetchError } from './error';
import { StrapiClient, StrapiClientConfig } from './strapi.client';
import { StatsD } from '@fxa/shared/metrics/statsd';

export interface CMSManagerConfig {
  enabled: boolean;
  cacheTTL: number;
  strapiClient: {
    apiUrl: string; // Base URL for Strapi API
    apiKey: string; // Bearer token for authentication
  }
}

/**
 * CMSManager class for fetching and caching Strapi configurations using Redis.
 */
export class CMSManager {
  private readonly strapiClient: StrapiClient | undefined;
  private readonly redis: Redis | undefined;
  private readonly cacheTTL; // Default cache TTL in seconds
  private readonly statsd: any;
  private readonly enabled: boolean;
  private readonly redisKeyPrefix: string;

  constructor(config: CMSManagerConfig, redis: Redis, statsd: StatsD, redisKeyPrefix = 'cmsaccounts:') {
    this.enabled = config.enabled;
    this.redisKeyPrefix = redisKeyPrefix;
    this.redis = redis;
    this.cacheTTL = config.cacheTTL;
    this.statsd = statsd;

    if (!this.enabled) {
      return;
    }

    if (!config.strapiClient || !config.strapiClient.apiUrl || !config.strapiClient.apiKey) {
      throw new Error('Invalid Strapi client configuration');
    }
    if (!redis) {
      throw new Error('Redis client is required for Strapi');
    }

    this.strapiClient = new StrapiClient(
      config.strapiClient.apiUrl,
      config.strapiClient.apiKey
    );
  }

  private getCacheKey(clientId: string, entrypoint: string): string {
    return `${this.redisKeyPrefix}${clientId}:${entrypoint}`;
  }

  async getConfig(
    clientId: string,
    entrypoint: string
  ): Promise<StrapiClientConfig | undefined> {
    if (!this.enabled || !this.redis || !this.strapiClient) {
      return;
    }

    const cacheKey = this.getCacheKey(clientId, entrypoint);

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.statsd?.increment(
          `cms_manager.cache_hit.${clientId}.${entrypoint}`
        );
        return JSON.parse(cached) as StrapiClientConfig;
      }
      this.statsd?.increment(
        `cms_manager.cache_miss.${clientId}.${entrypoint}`
      );
    } catch (err) {
      this.statsd?.increment(
        `cms_manager.cache_error.${clientId}.${entrypoint}`
      );
    }

    // Cache miss: fetch from Strapi
    try {
      const config = await this.strapiClient.fetchConfig(clientId, entrypoint);
      this.statsd?.increment(
        `cms_manager.strapi_fetch_success.${clientId}.${entrypoint}`
      );
      try {
        await this.redis.set(
          cacheKey,
          JSON.stringify(config),
          'EX',
          this.cacheTTL
        );
      } catch (err) {
        this.statsd?.increment(
          `cms_manager.cache_set_error.${clientId}.${entrypoint}`
        );
      }

      return config;
    } catch (err) {
      this.statsd?.increment(`cms_manager.error.${clientId}.${entrypoint}`);

      if (
        err instanceof StrapiFetchError ||
        err instanceof StrapiConfigNotFoundError
      ) {
        throw err;
      }
      throw new CMSConfigFetchError(clientId, entrypoint, err as Error);
    }
  }

  async clearCache(clientId: string, entrypoint: string): Promise<void> {
    if (!this.enabled || !this.redis || !this.strapiClient) {
      return;
    }

    const cacheKey = this.getCacheKey(clientId, entrypoint);
    try {
      await this.redis.del(cacheKey);
    } catch (err) {}
  }
}