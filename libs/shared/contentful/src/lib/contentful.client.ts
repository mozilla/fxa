/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OperationVariables } from '@apollo/client';
import { GraphQLClient } from 'graphql-request';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Injectable } from '@nestjs/common';
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

const DEFAULT_CACHE_TTL = 300000; // Milliseconds

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
  client = new GraphQLClient(
    `${this.contentfulClientConfig.graphqlApiUri}/spaces/${this.contentfulClientConfig.graphqlSpaceId}/environments/${this.contentfulClientConfig.graphqlEnvironment}?access_token=${this.contentfulClientConfig.graphqlApiKey}`
  );
  private locales: string[] = [];
  private graphqlResultCache: Record<string, unknown> = {};
  private emitter: EventEmitter;
  public on: (
    event: 'response',
    listener: (response: EventResponse) => void
  ) => EventEmitter;

  constructor(private contentfulClientConfig: ContentfulClientConfig) {
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

  async query<Result, Variables extends OperationVariables>(
    query: TypedDocumentNode<Result, Variables>,
    variables: Variables
  ): Promise<Result> {
    // Sort variables prior to stringifying to not be caller order dependent
    const variablesString = JSON.stringify(
      variables,
      Object.keys(variables as Record<string, unknown>).sort()
    );
    const cacheKey = variablesString + query;

    const emitterResponse = {
      method: 'query',
      query,
      variables: variablesString,
      requestStartTime: Date.now(),
      cache: false,
    };

    if (this.graphqlResultCache[cacheKey]) {
      this.emitter.emit('response', {
        ...emitterResponse,
        requestEndTime: emitterResponse.requestStartTime,
        elapsed: 0,
        cache: true,
      });
      return this.graphqlResultCache[cacheKey] as Result;
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

      this.graphqlResultCache[cacheKey] = response;

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
        throw new ContentfulCDNError(
          { info: errorResult },
          errorResult.message
        );
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
        throw new ContentfulCDNExecutionError(
          error,
          'Contentful: Execution Error'
        );
      }
    }
  }

  private setupCacheBust() {
    const cacheTTL = this.contentfulClientConfig.cacheTTL || DEFAULT_CACHE_TTL;

    setInterval(() => {
      this.locales = [];
      this.graphqlResultCache = {};
    }, cacheTTL);
  }
}
