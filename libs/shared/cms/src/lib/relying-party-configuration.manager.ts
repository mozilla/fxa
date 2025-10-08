/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOperationName } from '@apollo/client/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { Firestore } from '@google-cloud/firestore';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import { relyingPartyQuery } from '@fxa/shared/cms';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import { Cacheable, CacheClear } from '@type-cacheable/core';
import {
  CacheFirstStrategy,
  FirestoreAdapter,
  MemoryAdapter,
  StaleWhileRevalidateWithFallbackStrategy,
} from '@fxa/shared/db/type-cacheable';
import * as Sentry from '@sentry/node';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import type { Logger } from '@fxa/shared/log';

const CMS_FTL_CACHE_KEY = 'cmsFtlCache';

@Injectable()
export class RelyingPartyConfigurationManager {
  private memoryCacheAdapter: MemoryAdapter;
  private firestoreCacheAdapter: FirestoreAdapter;
  constructor(
    private strapiClient: StrapiClient,
    @Inject(StatsDService)
    private statsd: StatsD,
    @Inject(FirestoreService) private firestore: Firestore,
    @Inject(LOGGER_PROVIDER) private readonly log: Logger,
  ) {
    if (this.strapiClient) {
      this.strapiClient.on('response', this.onStrapiClientResponse.bind(this));
    }

    // Initialize cache adapters
    this.memoryCacheAdapter = new MemoryAdapter();
    this.firestoreCacheAdapter = new FirestoreAdapter(
      this.firestore,
      CMS_FTL_CACHE_KEY
    );
  }

  onStrapiClientResponse(response: StrapiClientEventResponse) {
    const defaultTags = {
      method: response.method,
      error: response.error ? 'true' : 'false',
      cache: `${response.cache}`,
      cacheType: `${response.cacheType}`,
    };
    const operationName = response.query && getOperationName(response.query);
    const tags = operationName
      ? { ...defaultTags, operationName }
      : defaultTags;
    this.statsd.timing(
      'cms_accounts_request',
      response.elapsed,
      undefined,
      tags
    );
  }

  async fetchCMSData(clientId: string, entrypoint: string) {
    return await this.strapiClient.query(relyingPartyQuery, {
      clientId,
      entrypoint,
    });
  }

  async invalidateCache(clientId: string, entrypoint: string) {
    return await this.strapiClient.invalidateQueryCache(relyingPartyQuery, {
      clientId,
      entrypoint,
    });
  }

  /**
   * Get FTL content for a specific locale with caching
   * Uses memory cache first, then Firestore cache with fallback strategy
   *
   * Expected config structure:
   * {
   *   cmsl10n: {
   *     ftlUrl: { template: string, timeout: number },
   *     ftlCache: {
   *       memoryTtlSeconds: number,        // Memory cache TTL (default: 300s)
   *       firestoreTtlSeconds: number,    // Firestore cache TTL (default: 1800s)
   *       firestoreOfflineTtlSeconds: number // Firestore offline TTL (default: 604800s)
   *     }
   *   }
   * }
   */
  @Cacheable({
    cacheKey: (args: any) => `ftl:${args[0]}`,
    strategy: (args: any, context: RelyingPartyConfigurationManager) =>
      new CacheFirstStrategy(
        (err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (context.log) {
            context.log.error('cms.ftl.cache.error', { error: errorMessage, locale: args[0] });
          }
          Sentry.captureException(err);
        },
        (startTime, endTime, result) => {
          // Report cache hits for memory cache
          if (result === 'cache') {
            context.statsd.timing('cms_ftl_cache_hit', endTime - startTime, undefined, {
              method: 'getFtlContent',
              cacheType: 'memory',
              locale: args[0],
            });
          }
        }
      ),
    ttlSeconds: (args: any) => {
      // Get TTL from config, fallback to 5 minutes if not specified
      const config = args[1];
      return config?.cmsl10n?.ftlCache?.memoryTtlSeconds || 300;
    },
    client: (_, context: RelyingPartyConfigurationManager) => context.memoryCacheAdapter,
  })
  @Cacheable({
    cacheKey: (args: any) => `ftl:${args[0]}`,
    strategy: (args: any, context: RelyingPartyConfigurationManager) => {
      // Get TTL from config, fallback to 30 minutes if not specified
      const config = args[1];
      const firestoreTtl = config?.cmsl10n?.ftlCache?.firestoreTtlSeconds || 1800;

      return new StaleWhileRevalidateWithFallbackStrategy(
        firestoreTtl,
        (err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (context.log) {
            context.log.error('cms.ftl.cache.error', { error: errorMessage, locale: args[0] });
          }
          Sentry.captureException(err);
        },
        (startTime, endTime, result) => {
          context.statsd.timing('cms_ftl_cache_hit', endTime - startTime, undefined, {
            method: 'getFtlContent',
            cacheType: result,
            locale: args[0],
          });
        }
      );
    },
    ttlSeconds: (args: any) => {
      // Get TTL from config, fallback to 7 days if not specified
      const config = args[1];
      return config?.cmsl10n?.ftlCache?.firestoreOfflineTtlSeconds || 604800;
    },
    client: (_, context: RelyingPartyConfigurationManager) => context.firestoreCacheAdapter,
  })
  async getFtlContent(locale: string, config: any): Promise<string> {
    const requestStartTime = Date.now();

    try {
      const { ftlUrl } = config.cmsl10n;
      const urlTemplate = ftlUrl.template;

      if (!urlTemplate) {
        return '';
      }

      // Replace {locale} placeholder with actual locale
      const resolvedUrl = urlTemplate.replace('{locale}', locale);

      const headers: Record<string, string> = {
        'Accept': 'text/plain'
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ftlUrl.timeout);

      try {
        const response = await fetch(resolvedUrl, {
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return '';
        }

        const ftlContent = await response.text();

        return ftlContent;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      const requestEndTime = Date.now();
      this.statsd.timing('cms_ftl_request', requestEndTime - requestStartTime, undefined, {
        method: 'getFtlContent',
        error: 'true',
        cache: 'false',
        locale,
      });
      throw error;
    }
  }

  /**
   * Invalidate FTL cache for a specific locale
   */
  @CacheClear({
    cacheKey: (args: any) => `ftl:${args[0]}`,
    client: (_, context: RelyingPartyConfigurationManager) => context.memoryCacheAdapter,
  })
  @CacheClear({
    cacheKey: (args: any) => `ftl:${args[0]}`,
    client: (_, context: RelyingPartyConfigurationManager) => context.firestoreCacheAdapter,
  })
  async invalidateFtlCache(locale: string): Promise<void> {
    // Method body is not needed as the decorators handle the cache clearing
  }

}
