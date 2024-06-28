/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloQueryResult, NetworkStatus } from '@apollo/client';
import { faker } from '@faker-js/faker';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { ContentfulErrorResponse } from './types';

/**
 * Generates a graphql response from the contentful client based on the passed query.
 * Use one of the query factories to provide data for the factory result.
 *
 * @param query The query to generate a result for
 * @param data The result of a QueryFactory matching the query passed
 */
export const ContentfulClientQueryFactory = <Result, Variables>(
  query: TypedDocumentNode<Result, Variables>,
  data: Result,
  override?: ApolloQueryResult<Result>
): ApolloQueryResult<Result> => ({
  data: data, // Must be used to negotiate the type inference for Result
  loading: false,
  networkStatus: NetworkStatus.ready,
  ...override,
});

export const ContentfulCDNErrorFactory = (
  override?: ContentfulErrorResponse
): ContentfulErrorResponse => ({
  sys: { type: 'Error', id: faker.string.alpha() },
  message: faker.string.alpha(),
  requestId: faker.string.uuid(),
  ...override,
});
