/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeApiListFactory,
  StripePriceFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import { UniqueSubscriptionItemNotFoundError } from '../customer.error';
import { getPriceFromSubscription } from './getPriceFromSubscription';

describe('getPriceFromSubscription', () => {
  it('returns subscription price successfully', async () => {
    const mockPrice = StripePriceFactory();
    const mockSubItem = StripeSubscriptionItemFactory({
      price: mockPrice,
    });
    const mockSubscription = StripeSubscriptionFactory({
      items: StripeApiListFactory([mockSubItem]),
    });

    const result = getPriceFromSubscription(mockSubscription);
    expect(result).toEqual(mockPrice);
  });

  it('throws error if no subscription price exists', async () => {
    const mockSubscription = StripeSubscriptionFactory({
      items: StripeApiListFactory([]),
    });

    expect(() => getPriceFromSubscription(mockSubscription)).toThrowError(
      UniqueSubscriptionItemNotFoundError
    );
  });

  it('throws error if multiple subscription prices exists', async () => {
    const mockSubItem1 = StripeSubscriptionItemFactory();
    const mockSubItem2 = StripeSubscriptionItemFactory();
    const mockSubscription = StripeSubscriptionFactory({
      items: StripeApiListFactory([mockSubItem1, mockSubItem2]),
    });

    expect(() => getPriceFromSubscription(mockSubscription)).toThrowError(
      UniqueSubscriptionItemNotFoundError
    );
  });
});
