/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionSubsequentInvoiceDiscount',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionSubsequentInvoiceDiscount',
  'Sent when the latest subscription payment is received (coupon).',
  {
    productName: 'Firefox Fortress',
    invoiceDateOnly: '12/14/2021',
    invoiceNumber: '8675309',
    invoiceTotal: '$18.00',
    invoiceSubtotal: '$20.00',
    invoiceDiscountAmount: '$2.00',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    nextInvoiceDateOnly: '1/14/2022',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    showPaymentMethod: true,
    discountType: 'forever',
    discountDuration: null,
  }
);

export const SubscriptionSubsequentInvoicePayPalProrated = createStory(
  {
    payment_provider: 'paypal',
    paymentProrated: '$5,231.00',
    showProratedAmount: true,
  },
  'PayPal with prorated amount'
);

export const SubscriptionSubsequentInvoicePayPalNoProrated = createStory(
  {
    payment_provider: 'paypal',
    showProratedAmount: false,
  },
  'PayPal with no prorated amount'
);

export const SubscriptionSubsequentInvoiceStripeProrated = createStory(
  {
    cardType: 'MasterCard',
    lastFour: '5309',
    payment_provider: 'stripe',
    paymentProrated: '$5,231.00',
    showProratedAmount: true,
  },
  'Stripe with prorated amount'
);

export const SubscriptionSubsequentInvoiceStripeNoProrated = createStory(
  {
    cardType: 'MasterCard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
  },
  'Stripe with no prorated amount'
);

export const SubscriptionSubsequentInvoiceCouponFullAmount = createStory(
  {
    cardType: 'MasterCard',
    lastFour: '5309',
    payment_provider: 'stripe',
    invoiceTotal: '$0.00',
    invoiceDiscountAmount: '$20.00',
    showProratedAmount: false,
    showPaymentMethod: false,
  },
  'Payment method hidden - coupon covered entire amount'
);

export const SubscriptionSubsequentInvoiceStripeNoProrated3Month = createStory(
  {
    cardType: 'MasterCard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
    discountType: 'repeating',
    discountDuration: 3,
  },
  'Stripe - 3 Month Coupon'
);

export const SubscriptionSubsequentInvoiceStripeNoProratedOneTime = createStory(
  {
    cardType: 'MasterCard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
    discountType: 'once',
    discountDuration: null,
  },
  'Stripe - One Time Coupon'
);
