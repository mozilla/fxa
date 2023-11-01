/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ApolloClient,
  ApolloError,
  ApolloQueryResult,
  InMemoryCache,
} from '@apollo/client';
import { BaseError } from '@fxa/shared/error';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Injectable } from '@nestjs/common';
import { determineLocale } from '@fxa/shared/l10n';
import { ContentfulClientConfig } from './contentful.client.config';
import {
  ContentfulCDNError,
  ContentfulCDNExecutionError,
  ContentfulError,
  ContentfulExecutionError,
  ContentfulLinkError,
  ContentfulLocaleError,
} from './contentful.error';
import { ContentfulErrorResponse } from './types';

const DEFAULT_CACHE_TTL = 300000; // Milliseconds

@Injectable()
export class ContentfulClient {
  client = new ApolloClient({
    uri: `${this.contentfulClientConfig.graphqlApiUri}/spaces/${this.contentfulClientConfig.graphqlSpaceId}/environments/${this.contentfulClientConfig.graphqlEnvironment}?access_token=${this.contentfulClientConfig.graphqlApiKey}`,
    cache: new InMemoryCache(),
  });
  private locales: string[] = [];

  constructor(private contentfulClientConfig: ContentfulClientConfig) {
    this.setupCacheBust();
  }

  async getLocale(acceptLanguage: string): Promise<string> {
    const contentfulLocales = await this.getLocales();
    return determineLocale(acceptLanguage, contentfulLocales);
  }

  async query<Result, Variables>(
    query: TypedDocumentNode<Result, Variables>,
    variables: Variables
  ): Promise<ApolloQueryResult<Result>> {
    try {
      const response = await this.client.query<Result, Variables>({
        query,
        variables,
      });

      return response;
    } catch (e) {
      if (e instanceof ApolloError && e.graphQLErrors.length) {
        throw this.parseErrors(e.graphQLErrors);
      }
      if (e instanceof Error) {
        throw new ContentfulError([e]);
      }
      throw new ContentfulError([new BaseError(e, e.message)]);
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

  private parseErrors<Result>(
    errors: NonNullable<ApolloQueryResult<Result>['errors']>
  ) {
    return new ContentfulError(
      errors.map((error) => {
        const contentfulErrorCode = error.extensions?.['contentful'].code;

        if (contentfulErrorCode === 'UNKNOWN_LOCALE') {
          return new ContentfulLocaleError(error, 'Contentful: Unknown Locale');
        }
        if (contentfulErrorCode === 'UNRESOLVABLE_LINK') {
          return new ContentfulLinkError(
            error,
            'Contentful: Unresolvable Link'
          );
        }
        if (contentfulErrorCode === 'UNEXPECTED_LINKED_CONTENT_TYPE') {
          return new ContentfulLinkError(
            error,
            'Contentful: Unexpected Linked Content Type'
          );
        }

        return new ContentfulExecutionError(
          error,
          'Contentful: Execution Error'
        );
      })
    );
  }

  private setupCacheBust() {
    const cacheTTL = this.contentfulClientConfig.cacheTTL || DEFAULT_CACHE_TTL;

    setInterval(() => {
      this.locales = [];
    }, cacheTTL);
  }
}
