/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Cacheable, CacheClear } from '@type-cacheable/core';
import { Firestore } from '@google-cloud/firestore';
import * as Sentry from '@sentry/node';

import { FirestoreService } from '@fxa/shared/db/firestore';
import {
  CacheFirstStrategy,
  FirestoreAdapter,
  MemoryAdapter,
  StaleWhileRevalidateWithFallbackStrategy,
} from '@fxa/shared/db/type-cacheable';

import type {
  FreeAccessByClientProjection,
  FreeAccessProjection,
} from './queries/accesses/types';
import { StrapiClient } from './strapi.client';
import { AccessUtil } from './queries/accesses/util';
import { accessesQuery } from './queries/accesses';
import { StrapiClientConfig } from './strapi.client.config';

const PROJECTION_CACHE_KEY = 'freeAccessProgramProjection';
const ACCESS_GRANTS_CACHE_KEY = 'freeAccessProgramAccessGrantsByClient';

// Match StrapiClientConfig so a Strapi-degraded window survives end-to-end.
const DEFAULT_FIRESTORE_OFFLINE_CACHE_TTL_SECONDS = 604800; // 7 days
const DEFAULT_FIRESTORE_CACHE_TTL_SECONDS = 1800; // 30 minutes
const DEFAULT_MEM_CACHE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class FreeAccessProgramConfigurationManager {
  private memoryCacheAdapter: MemoryAdapter;
  private firestoreCacheAdapter: FirestoreAdapter;

  constructor(
    private config: StrapiClientConfig,
    private strapiClient: StrapiClient,
    @Inject(FirestoreService) firestore: Firestore,
    @Inject(Logger) private log: LoggerService
  ) {
    this.memoryCacheAdapter = new MemoryAdapter();
    this.firestoreCacheAdapter = new FirestoreAdapter(
      firestore,
      this.config.firestoreCacheCollectionName
    );
  }

  @Cacheable({
    cacheKey: () => PROJECTION_CACHE_KEY,
    strategy: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      new CacheFirstStrategy(
        (err) => Sentry.captureException(err),
        () => {},
        context.log
      ),
    ttlSeconds: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.config.memCacheTTL ?? DEFAULT_MEM_CACHE_TTL_SECONDS,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.memoryCacheAdapter,
  })
  @Cacheable({
    cacheKey: () => PROJECTION_CACHE_KEY,
    strategy: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      new StaleWhileRevalidateWithFallbackStrategy(
        context.config.firestoreCacheTTL ?? DEFAULT_FIRESTORE_CACHE_TTL_SECONDS,
        (err) => Sentry.captureException(err),
        () => {},
        context.log
      ),
    ttlSeconds: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.config.firestoreOfflineCacheTTL ??
      DEFAULT_FIRESTORE_OFFLINE_CACHE_TTL_SECONDS,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.firestoreCacheAdapter,
  })
  async getCachedProjection(): Promise<FreeAccessProjection> {
    const queryResult = await this.strapiClient.queryUncached(
      accessesQuery,
      {}
    );
    const util = new AccessUtil(queryResult);

    return util.project();
  }

  async getFreshProjection(): Promise<FreeAccessProjection> {
    const queryResult = await this.strapiClient.queryUncached(
      accessesQuery,
      {}
    );
    const util = new AccessUtil(queryResult);

    return util.project();
  }

  /**
   * The full per-offering access keyed by email then clientId. Cached with the
   * same two-tier strategy as the projection; callers should gate on
   * getCachedProjection() first so this heavier shape is only resolved for
   * actual Free Access Program members.
   */
  @Cacheable({
    cacheKey: () => ACCESS_GRANTS_CACHE_KEY,
    strategy: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      new CacheFirstStrategy(
        (err) => Sentry.captureException(err),
        () => {},
        context.log
      ),
    ttlSeconds: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.config.memCacheTTL ?? DEFAULT_MEM_CACHE_TTL_SECONDS,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.memoryCacheAdapter,
  })
  @Cacheable({
    cacheKey: () => ACCESS_GRANTS_CACHE_KEY,
    strategy: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      new StaleWhileRevalidateWithFallbackStrategy(
        context.config.firestoreCacheTTL ?? DEFAULT_FIRESTORE_CACHE_TTL_SECONDS,
        (err) => Sentry.captureException(err),
        () => {},
        context.log
      ),
    ttlSeconds: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.config.firestoreOfflineCacheTTL ??
      DEFAULT_FIRESTORE_OFFLINE_CACHE_TTL_SECONDS,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.firestoreCacheAdapter,
  })
  async getCachedAccessGrantsByClient(): Promise<FreeAccessByClientProjection> {
    const queryResult = await this.strapiClient.queryUncached(
      accessesQuery,
      {}
    );
    const util = new AccessUtil(queryResult);

    return util.projectByClient();
  }

  @CacheClear({
    cacheKey: () => PROJECTION_CACHE_KEY,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.memoryCacheAdapter,
  })
  @CacheClear({
    cacheKey: () => PROJECTION_CACHE_KEY,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.firestoreCacheAdapter,
  })
  @CacheClear({
    cacheKey: () => ACCESS_GRANTS_CACHE_KEY,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.memoryCacheAdapter,
  })
  @CacheClear({
    cacheKey: () => ACCESS_GRANTS_CACHE_KEY,
    client: (_args: any, context: FreeAccessProgramConfigurationManager) =>
      context.firestoreCacheAdapter,
  })
  async invalidateProjectionCache(): Promise<void> {}
}
