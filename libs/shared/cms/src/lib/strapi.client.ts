/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { OperationVariables } from '@apollo/client';
import { Firestore } from '@google-cloud/firestore';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Inject, Injectable } from '@nestjs/common';
import cacheManager, { Cacheable } from '@type-cacheable/core';
import EventEmitter from 'events';
import { GraphQLClient } from 'graphql-request';
import * as Sentry from '@sentry/node';

import { FirestoreService } from '@fxa/shared/db/firestore';
import {
  CacheFirstStrategy,
  FirestoreAdapter,
  MemoryAdapter,
  StaleWhileRevalidateWithFallbackStrategy,
} from '@fxa/shared/db/type-cacheable';
import { determineLocale } from '@fxa/shared/l10n';
import { DEFAULT_LOCALE } from './constants';
import { CMSError } from './cms.error';
import { CMS_QUERY_CACHE_KEY, cacheKeyForQuery } from './util';
import { StrapiClientConfig } from './strapi.client.config';
import { LocalesResult, localesQuery } from './queries/locales';

cacheManager.setOptions({
  // Must be disabled globally per https://github.com/joshuaslate/type-cacheable?tab=readme-ov-file#change-global-options
  // otherwise @Cacheable context will be undefined
  excludeContext: false,
});

const DEFAULT_FIRESTORE_CACHE_TTL_SECONDS = 604800; // 604800 is 7 days.
const DEFAULT_MEM_CACHE_TTL_SECONDS = 300;

interface EventResponse {
  method: string;
  requestStartTime: number;
  requestEndTime: number;
  elapsed: number;
  cache: boolean;
  query?: TypedDocumentNode;
  variables?: string;
  error?: Error;
}

@Injectable()
export class StrapiClient {
  client: GraphQLClient;
  private emitter: EventEmitter;
  public on: (
    event: 'response',
    listener: (response: EventResponse) => void
  ) => EventEmitter;
  constructor(
    private strapiClientConfig: StrapiClientConfig,
    @Inject(FirestoreService) private firestore: Firestore
  ) {
    this.client = new GraphQLClient(this.strapiClientConfig.graphqlApiUri, {
      headers: {
        Authorization: `Bearer ${this.strapiClientConfig.apiKey}`,
      },
    });
    this.emitter = new EventEmitter();
    this.on = this.emitter.on.bind(this.emitter);
  }

  async getLocale(acceptLanguage: string): Promise<string> {
    const strapiLocales = await this.getLocales();
    const result = determineLocale(acceptLanguage, strapiLocales);
    if (result === 'en') {
      return DEFAULT_LOCALE;
    }
    return result;
  }

  @Cacheable({
    cacheKey: (args: any) => cacheKeyForQuery(args[0], args[1]),
    strategy: (args: any, context: StrapiClient) =>
      new StaleWhileRevalidateWithFallbackStrategy(
        context.strapiClientConfig.memCacheTTL || DEFAULT_MEM_CACHE_TTL_SECONDS,
        (err) => {
          Sentry.captureException(err);
        },
        (startTime, endTime, result) => {
          context.emitter.emit('response', {
            method: 'query',
            query: args[0],
            variables: JSON.stringify(args[1]),
            requestStartTime: startTime,
            requestEndTime: endTime,
            elapsed: endTime - startTime,
            cache: result === 'stale' || result === 'fallback',
          });
        }
      ),
    ttlSeconds: (_, context: StrapiClient) =>
      context.strapiClientConfig.firestoreCacheTTL ||
      DEFAULT_FIRESTORE_CACHE_TTL_SECONDS,
    client: (_, context: StrapiClient) =>
      new FirestoreAdapter(
        context.firestore,
        context.strapiClientConfig.firestoreCacheCollectionName ||
          CMS_QUERY_CACHE_KEY
      ),
  })
  @Cacheable({
    cacheKey: (args: any) => cacheKeyForQuery(args[0], args[1]),
    strategy: (args: any, context: StrapiClient) =>
      new CacheFirstStrategy(
        (err) => {
          Sentry.captureException(err);
        },
        (startTime, endTime, result) => {
          // We only report cache hits since the second cache decorator above will report status
          // if this strategy misses, and we don't want to double report.
          if (result === 'cache') {
            context.emitter.emit('response', {
              method: 'query',
              query: args[0],
              variables: JSON.stringify(args[1]),
              requestStartTime: startTime,
              requestEndTime: endTime,
              elapsed: endTime - startTime,
              cache: true,
            });
          }
        }
      ),
    ttlSeconds: (_, context: StrapiClient) =>
      context.strapiClientConfig.memCacheTTL || DEFAULT_MEM_CACHE_TTL_SECONDS,
    client: new MemoryAdapter(),
  })
  async query<Result, Variables extends OperationVariables>(
    query: TypedDocumentNode<Result, Variables>,
    variables: Variables
  ): Promise<Result> {
    const requestStartTime = Date.now();

    try {
      const response = await this.client.request<Result, any>({
        document: query,
        variables,
      });

      return response;
    } catch (e) {
      const requestEndTime = Date.now();
      this.emitter.emit('response', {
        method: 'query',
        query,
        variables: JSON.stringify(variables),
        requestStartTime,
        requestEndTime,
        elapsed: requestEndTime - requestStartTime,
        error: e,
      });

      throw new CMSError([e]);
    }
  }

  private async getLocales(): Promise<string[]> {
    const localesResult = (await this.query(localesQuery, {})) as LocalesResult;

    return localesResult.i18NLocales.map((locale) => locale.code) || [];
  }
}
