/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { NetworkStatus } from '@apollo/client';
import { ApolloQueryResult } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
  OfferingQuery,
  PaginationTestMissingIdsQuery,
  PaginationTestMissingTotalQuery,
  PaginationTestQuery,
  PaginationTestQueryVariables,
} from '../__generated__/graphql';
import { PurchaseWithDetailsQuery } from '../__generated__/graphql';
import { NestedPaginationTestQuery } from '../__generated__/graphql';

export const OfferingQueryFactory = (
  override?: Partial<OfferingQuery>
): OfferingQuery => ({
  offering: {
    stripeProductId: faker.string.sample(),
    countries: [faker.string.sample()],
    defaultPurchase: {
      purchaseDetails: {
        productName: faker.string.sample(),
        details: faker.string.sample(),
        subtitle: faker.string.sample(),
        webIcon: faker.string.sample(),
      },
    },
  },
  ...override,
});

export const PurchaseWithDetailsQueryFactory = (
  override?: Partial<PurchaseWithDetailsQuery>
): PurchaseWithDetailsQuery => ({
  purchase: {
    description: faker.string.sample(),
    purchaseDetails: {
      productName: faker.string.sample(),
      details: faker.string.sample(),
      webIcon: faker.string.sample(),
    },
  },
  ...override,
});

export const NestedPaginationTestQueryFactory = (
  override?: Partial<NestedPaginationTestQuery>
): NestedPaginationTestQuery => ({
  purchaseCollection: {
    total: faker.number.int(),
    items: [
      {
        sys: {
          id: faker.string.uuid(),
        },
        stripePlanChoices: [faker.string.uuid()],
        offering: {
          capabilitiesCollection: {
            total: faker.number.int(),
            items: [
              {
                slug: faker.string.uuid(),
              },
            ],
          },
        },
      },
    ],
  },
  ...override,
});

export const PaginationTestQueryFactory = (
  override?: Partial<PaginationTestQuery>
): PaginationTestQuery => ({
  offeringCollection: {
    total: faker.number.int(),
    items: [
      {
        description: faker.string.sample(),
      },
    ],
  },
  ...override,
});

export const PaginationTestMissingIdsQueryFactory = (
  override?: Partial<PaginationTestMissingIdsQuery>
): PaginationTestMissingIdsQuery => ({
  purchaseCollection: {
    total: faker.number.int(),
    items: [
      {
        stripePlanChoices: [faker.string.uuid()],
        offering: {
          capabilitiesCollection: {
            total: faker.number.int(),
            items: [
              {
                slug: faker.string.uuid(),
              },
            ],
          },
        },
      },
    ],
  },
  ...override,
});

export const PaginationTestMissingTotalQueryFactory = (
  override?: Partial<PaginationTestMissingTotalQuery>
): PaginationTestMissingTotalQuery => ({
  purchaseCollection: {
    items: [
      {
        sys: {
          id: faker.string.uuid(),
        },
        stripePlanChoices: [],
        offering: {
          capabilitiesCollection: {
            items: [
              {
                slug: faker.string.uuid(),
              },
            ],
          },
        },
      },
    ],
  },
  ...override,
});

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
