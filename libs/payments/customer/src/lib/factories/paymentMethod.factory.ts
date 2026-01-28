/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  PaymentProvider,
  SubPlatPaymentMethodType,
  type StripePaymentMethod,
} from '../types';

export const StripePaymentMethodTypeResponseFactory = (
  override?: Partial<StripePaymentMethod>
): StripePaymentMethod => ({
  provider: PaymentProvider.Stripe,
  type: faker.helpers.arrayElement([
    SubPlatPaymentMethodType.Card,
    SubPlatPaymentMethodType.ApplePay,
    SubPlatPaymentMethodType.GooglePay,
    SubPlatPaymentMethodType.Link,
    SubPlatPaymentMethodType.Stripe,
  ]),
  paymentMethodId: `pm_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});
