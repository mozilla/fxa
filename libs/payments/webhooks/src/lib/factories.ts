/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeEventCustomerSubscriptionCreatedFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { CustomerSubscriptionDeletedResponse } from './types';

const subscription = StripeSubscriptionFactory();

export const CustomerSubscriptionDeletedResponseFactory = (
  override?: Partial<CustomerSubscriptionDeletedResponse>
): CustomerSubscriptionDeletedResponse => ({
  type: 'customer.subscription.deleted',
  event: StripeEventCustomerSubscriptionCreatedFactory(subscription),
  eventObjectData: subscription,
  ...override,
});
