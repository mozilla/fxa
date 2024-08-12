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

import { FirestoreService } from '@fxa/shared/db/firestore';
import {
  FirestoreAdapter,
  NetworkFirstStrategy,
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

const DEFAULT_FIRESTORE_CACHE_TTL = 604800; // Seconds. 604800 is 7 days.
const DEFAULT_MEM_CACHE_TTL = 300; // Seconds

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
  private graphqlMemCache: Record<string, unknown> = {};

  constructor(
    private strapiClientConfig: StrapiClientConfig,
    @Inject(FirestoreService) private firestore: Firestore
  ) {
    this.client = new GraphQLClient(this.strapiClientConfig.graphqlApiUri, {
      headers: {
        Authorization: `Bearer ${this.strapiClientConfig.apiKey}`,
      },
    });
    this.setupCacheBust();
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
    strategy: new NetworkFirstStrategy(),
    ttlSeconds: (_, context: StrapiClient) =>
      context.strapiClientConfig.firestoreCacheTTL ||
      DEFAULT_FIRESTORE_CACHE_TTL,
    client: (_, context: StrapiClient) =>
      new FirestoreAdapter(
        context.firestore,
        context.strapiClientConfig.firestoreCacheCollectionName ||
          CMS_QUERY_CACHE_KEY
      ),
  })
  async query<Result, Variables extends OperationVariables>(
    query: TypedDocumentNode<Result, Variables>,
    variables: Variables
  ): Promise<Result> {
    const cacheKey = cacheKeyForQuery(query, variables);

    const emitterResponse = {
      method: 'query',
      query,
      variables: JSON.stringify(variables),
      requestStartTime: Date.now(),
      cache: false,
    };

    if (this.graphqlMemCache[cacheKey]) {
      this.emitter.emit('response', {
        ...emitterResponse,
        requestEndTime: emitterResponse.requestStartTime,
        elapsed: 0,
        cache: true,
      });
      return this.graphqlMemCache[cacheKey] as Result;
    }

    try {
      const response = await this.client.request<Result, any>({
        document: query,
        variables,
      });

      const requestEndTime = Date.now();
      this.emitter.emit('response', {
        ...emitterResponse,
        elapsed: requestEndTime - emitterResponse.requestStartTime,
        requestEndTime,
      });

      this.graphqlMemCache[cacheKey] = response;

      return response;
    } catch (e) {
      const requestEndTime = Date.now();
      this.emitter.emit('response', {
        ...emitterResponse,
        elapsed: requestEndTime - emitterResponse.requestStartTime,
        requestEndTime,
        error: e,
      });

      throw new CMSError([e]);
    }
  }

  private async getLocales(): Promise<string[]> {
    const localesResult = (await this.query(localesQuery, {})) as LocalesResult;

    return (
      localesResult.i18NLocales.data.map((locale) => locale.attributes.code) ||
      []
    );
  }

  private setupCacheBust() {
    const cacheTTL =
      this.strapiClientConfig.memCacheTTL || DEFAULT_MEM_CACHE_TTL * 1000;

    setInterval(() => {
      this.graphqlMemCache = {};
    }, cacheTTL);
  }
}
