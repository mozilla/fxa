/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  BannerVariant,
  PaymentProvider,
  SubPlatPaymentMethodType,
  type DefaultPaymentMethod,
  type DefaultPaymentMethodError,
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

export const DefaultPaymentMethodErrorFactory = (
  override?: Partial<DefaultPaymentMethodError>
): DefaultPaymentMethodError => ({
  paymentMethodType: SubPlatPaymentMethodType.PayPal,
  bannerType: BannerVariant.Error,
  bannerTitle: faker.lorem.words(3),
  bannerTitleFtl: faker.lorem.slug(5),
  bannerMessage: faker.lorem.sentence(),
  bannerMessageFtl: faker.lorem.slug(5),
  bannerLinkLabel: faker.lorem.words(3),
  bannerLinkLabelFtl: faker.lorem.slug(5),
  message: faker.lorem.sentence(),
  messageFtl: faker.lorem.slug(5),
  ...override,
});

export const DefaultPaymentMethodFactory = (
  override?: Partial<DefaultPaymentMethod>
): DefaultPaymentMethod => ({
  type: SubPlatPaymentMethodType.Card,
  brand: 'visa',
  last4: faker.string.numeric(4),
  expMonth: faker.number.int({ min: 1, max: 12 }),
  expYear: faker.number.int({ min: 2025, max: 2035 }),
  hasPaymentMethodError: undefined,
  ...override,
});
