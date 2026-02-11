/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isIapSubscription } from 'fxa-shared/subscriptions/type-guards';
import {
  IapSubscription,
  MozillaSubscription,
} from 'fxa-shared/subscriptions/types';
import { Customer } from '../store/types';
import {
  isNotChosen,
  isPaypal,
  isStripe,
  PaymentProviders,
} from './PaymentProvider';

export const hasSubscriptions = (c: Customer) =>
  !!(c.subscriptions && c.subscriptions.length > 0);

export const hasPaymentProvider = (c?: Customer | null) =>
  !!(
    c &&
    c.payment_provider &&
    !isNotChosen(c.payment_provider) &&
    Object.values(PaymentProviders).includes(c.payment_provider)
  );

export const isExistingStripeCustomer = (customer?: Customer | null) =>
  !!(
    customer &&
    hasSubscriptions(customer) &&
    isStripe(customer.payment_provider)
  );

export const isExistingPaypalCustomer = (customer: Customer | null) =>
  !!(
    customer &&
    hasSubscriptions(customer) &&
    isPaypal(customer.payment_provider)
  );

export const isExistingCustomer = (customer?: Customer | null) =>
  !!(customer && hasSubscriptions(customer) && hasPaymentProvider(customer));

export const findCustomerIapSubscriptionByProductId = (
  subscriptions: MozillaSubscription[] | null,
  productId: string
) =>
  subscriptions &&
  (subscriptions.find(
    (s) => isIapSubscription(s) && s.product_id === productId
  ) as IapSubscription);

export const needsCustomer = (customer: Customer | null) =>
  !(customer && customer.customerId);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  hasSubscriptions,
  hasPaymentProvider,
  isExistingCustomer,
  isExistingPaypalCustomer,
  isExistingStripeCustomer,
  findCustomerIapSubscriptionByProductId,
};
