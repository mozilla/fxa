/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { OperationVariables } from '@apollo/client';
import { GraphQLClient } from 'graphql-request';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Inject, Injectable } from '@nestjs/common';
import { determineLocale } from '@fxa/shared/l10n';
import { DEFAULT_LOCALE } from './constants';
import { ContentfulClientConfig } from './contentful.client.config';
import {
  ContentfulCDNError,
  ContentfulCDNExecutionError,
  ContentfulError,
} from './contentful.error';
import { ContentfulErrorResponse } from './types';
import EventEmitter from 'events';
import {
  FirestoreAdapter,
  NetworkFirstStrategy,
} from '@fxa/shared/db/type-cacheable';
import { CONTENTFUL_QUERY_CACHE_KEY, cacheKeyForQuery } from './util';
import { Cacheable } from '@type-cacheable/core';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { Firestore } from '@google-cloud/firestore';

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
export class ContentfulClient {
  client: GraphQLClient;
  private locales: string[] = [];
  private emitter: EventEmitter;
  public on: (
    event: 'response',
    listener: (response: EventResponse) => void
  ) => EventEmitter;
  private graphqlMemCache: Record<string, unknown> = {};

  constructor(
    private contentfulClientConfig: ContentfulClientConfig,
    @Inject(FirestoreService) private firestore: Firestore
  ) {
    this.client = new GraphQLClient(
      `${this.contentfulClientConfig.graphqlApiUri}/spaces/${this.contentfulClientConfig.graphqlSpaceId}/environments/${this.contentfulClientConfig.graphqlEnvironment}?access_token=${this.contentfulClientConfig.graphqlApiKey}`
    );
    this.setupCacheBust();
    this.emitter = new EventEmitter();
    this.on = this.emitter.on.bind(this.emitter);
  }

  async getLocale(acceptLanguage: string): Promise<string> {
    const contentfulLocales = await this.getLocales();
    const result = determineLocale(acceptLanguage, contentfulLocales);
    if (result === 'en') {
      return DEFAULT_LOCALE;
    }
    return result;
  }

  // Not sure what's happening here. Context is undefined which results in an error.
  // @Cacheable({
  //   cacheKey: (args: any) => cacheKeyForQuery(args[0], args[1]),
  //   strategy: new NetworkFirstStrategy(),
  //   ttlSeconds: (_, context: ContentfulClient) =>
  //     context.contentfulClientConfig.firestoreCacheTTL ||
  //     DEFAULT_FIRESTORE_CACHE_TTL,
  //   client: (_, context: ContentfulClient) =>
  //     new FirestoreAdapter(
  //       context.firestore,
  //       context.contentfulClientConfig.firestoreCacheCollectionName ||
  //         CONTENTFUL_QUERY_CACHE_KEY
  //     ),
  // })
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

      throw new ContentfulError([e]);
    }
  }

  private async getLocales(): Promise<string[]> {
    const emitterResponse = {
      method: 'getLocales',
      requestStartTime: Date.now(),
      cache: false,
    };

    if (!!this.locales?.length) {
      this.emitter.emit('response', {
        ...emitterResponse,
        cache: true,
        elapsed: 0,
        requestEndTime: emitterResponse.requestStartTime,
      });
      return this.locales;
    }

    try {
      const localesUrl = `${this.contentfulClientConfig.cdnApiUri}/spaces/${this.contentfulClientConfig.graphqlSpaceId}/environments/${this.contentfulClientConfig.graphqlEnvironment}/locales?access_token=${this.contentfulClientConfig.graphqlApiKey}`;
      const response = await fetch(localesUrl);

      const requestEndTime = Date.now();
      this.emitter.emit('response', {
        ...emitterResponse,
        elapsed: requestEndTime - emitterResponse.requestStartTime,
        requestEndTime,
      });

      const results = await response.json();

      if (!response.ok) {
        const errorResult = results as ContentfulErrorResponse;
        throw new ContentfulCDNError(errorResult.message, {
          info: errorResult,
        });
      }

      // Assign value to locale "cache"
      this.locales = results.items.map((locale: any) => locale.code);

      return this.locales;
    } catch (error) {
      const requestEndTime = Date.now();
      this.emitter.emit('response', {
        ...emitterResponse,
        elapsed: requestEndTime - emitterResponse.requestStartTime,
        requestEndTime,
        error,
      });
      if (error instanceof ContentfulCDNError) {
        throw error;
      } else {
        throw new ContentfulCDNExecutionError('Contentful: Execution Error', {
          cause: error,
        });
      }
    }
  }

  private setupCacheBust() {
    const cacheTTL =
      this.contentfulClientConfig.memCacheTTL || DEFAULT_MEM_CACHE_TTL * 1000;

    setInterval(() => {
      this.locales = [];
      this.graphqlMemCache = {};
    }, cacheTTL);
  }
}
