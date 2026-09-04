/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  StripeApiList,
  StripeApiSearchResult,
  StripeResponse,
  type StripeApiListPromise,
} from '../stripe.client.types';

export const StripeApiListFactory = <T extends Array<any>>(
  data: T,
  override?: Partial<StripeApiList<T>>
): StripeApiList<T[0]> => ({
  object: 'list',
  url: '/v1/subscriptions',
  has_more: false,
  data,
  ...override,
});

export const StripeApiSearchResultFactory = <T>(
  data: T[],
  override?: Partial<StripeApiSearchResult<T>>
): StripeApiSearchResult<T> => ({
  object: 'search_result',
  url: '/v1/prices/search',
  has_more: false,
  next_page: null,
  data,
  ...override,
});

export const StripeResponseFactory = <T>(
  data: T,
  override?: Partial<StripeResponse<T>>
): StripeResponse<T> => ({
  lastResponse: {
    headers: {},
    requestId: faker.string.uuid(),
    statusCode: 200,
  },
  ...data,
  ...override,
});

export const StripeApiListPromiseFactory = <T>(
  data: T[]
): StripeApiListPromise<T> => {
  let index = 0;

  const promise = Promise.resolve(
    StripeApiListFactory(data)
  ) as StripeApiListPromise<T>;

  promise.next = async (): Promise<IteratorResult<T>> => {
    if (index < data.length) {
      return { value: data[index++], done: false };
    }
    return { value: undefined as any, done: true };
  };
  promise[Symbol.asyncIterator] = function () {
    return promise;
  };

  promise.autoPagingEach = async (handler: (item: T) => any) => {
    for (const item of data) {
      await handler(item);
    }
  };

  promise.autoPagingToArray = async () => [...data];

  return promise;
};
