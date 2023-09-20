/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  ApolloClient,
  InMemoryCache,
  ApolloQueryResult,
  ApolloError,
  NormalizedCacheObject,
} from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
  ContentfulError,
  ContentfulExecutionError,
  ContentfulLinkError,
  ContentfulLocaleError,
} from './errors';
import { BaseError } from '@fxa/shared/error';
import { ContentfulClientConfig } from './contentful-client.config';
import { ContentfulPaginationHelper } from './contentful-pagination';

@Injectable()
export class ContentfulClient {
  client: ApolloClient<NormalizedCacheObject>;

  constructor(
    private contentfulClientConfig: ContentfulClientConfig,
    private contentfulPaginationHelper: ContentfulPaginationHelper
  ) {
    this.client = new ApolloClient({
      uri: `${this.contentfulClientConfig.graphqlApiUri}?access_token=${this.contentfulClientConfig.graphqlApiKey}`,
      cache: new InMemoryCache(),
    });
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

  async autoPaginateQuery<Result, Variables>(
    query: TypedDocumentNode<Result, Variables>,
    variables: Variables,
    pageSize: number = 1
  ): Promise<ApolloQueryResult<Result>> {
    const baseResponse = await this.query(query, {
      ...variables,
      skip: 0,
      limit: pageSize,
    });

    const pageCount = this.contentfulPaginationHelper.getPageCount(
      query,
      baseResponse,
      pageSize
    );

    let combined = baseResponse;
    for (let page = 0; page < pageCount; page++) {
      const pageResponse = await this.query(query, {
        ...variables,
        skip: page * pageSize,
        limit: pageSize,
      });

      combined.data = this.contentfulPaginationHelper.merge(
        query,
        combined.data,
        pageResponse.data
      );
    }

    return combined;
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
}
