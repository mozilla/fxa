import { faker } from '@faker-js/faker';
import { StripeApiList, StripeResponse } from '../stripe.client.types';

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
