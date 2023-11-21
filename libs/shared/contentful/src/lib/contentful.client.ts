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

const DEFAULT_CACHE_TTL = 300000; // Milliseconds

@Injectable()
export class ContentfulClient {
  client = new GraphQLClient(
    `${this.contentfulClientConfig.graphqlApiUri}/spaces/${this.contentfulClientConfig.graphqlSpaceId}/environments/${this.contentfulClientConfig.graphqlEnvironment}?access_token=${this.contentfulClientConfig.graphqlApiKey}`
  );
  private locales: string[] = [];
  private graphqlResultCache: Record<string, unknown> = {};

  constructor(private contentfulClientConfig: ContentfulClientConfig) {
    this.setupCacheBust();
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

    if (this.graphqlResultCache[cacheKey]) {
      return this.graphqlResultCache[cacheKey] as Result;
    }

    try {
      const response = await this.client.request<Result, any>({
        document: query,
        variables,
      });

      this.graphqlResultCache[cacheKey] = response;

      return response;
    } catch (e) {
      throw new ContentfulError([e]);
    }
  }

  private async getLocales(): Promise<string[]> {
    if (!!this.locales?.length) {
      return this.locales;
    }

    try {
      const localesUrl = `${this.contentfulClientConfig.cdnApiUri}/spaces/${this.contentfulClientConfig.graphqlSpaceId}/environments/${this.contentfulClientConfig.graphqlEnvironment}/locales?access_token=${this.contentfulClientConfig.graphqlApiKey}`;
      const response = await fetch(localesUrl);
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
