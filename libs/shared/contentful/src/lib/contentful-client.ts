/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  ApolloClient,
  InMemoryCache,
  ApolloQueryResult,
  ApolloError,
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

@Injectable()
export class ContentfulClient {
  client = new ApolloClient({
    uri: `${this.contentfulClientConfig.graphqlApiUri}?access_token=${this.contentfulClientConfig.graphqlApiKey}`,
    cache: new InMemoryCache(),
  });

  constructor(private contentfulClientConfig: ContentfulClientConfig) {}

  async query<Result, Variables>(
    query: TypedDocumentNode<Result, Variables>,
    variables: Variables
  ): Promise<ApolloQueryResult<Result> | null> {
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

  private parseErrors<Result>(
    errors: NonNullable<ApolloQueryResult<Result>['errors']>
  ) {
    return new ContentfulError(
      errors.map((error) => {
        const contentfulErrorCode = (error as any).extensions?.['contentful']
          .code;

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
