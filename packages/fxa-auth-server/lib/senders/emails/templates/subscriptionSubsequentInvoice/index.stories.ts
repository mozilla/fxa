/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionSubsequentInvoice',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionSubsequentInvoice',
  'Sent when the latest subscription payment is received.',
  {
    productName: 'Firefox Fortress',
    invoiceDateOnly: '12/14/2021',
    invoiceNumber: '8675309',
    invoiceTotalInCents: 2000,
    invoiceTotal: '$20.00',
    invoiceSubtotal: null,
    invoiceTaxAmount: null,
    invoiceDiscountAmount: null,
    discountType: null,
    discountDuration: null,
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    nextInvoiceDateOnly: '1/14/2022',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    paymentProrated: null,
    showPaymentMethod: true,
    showProratedAmount: false,
    showTaxAmount: false,
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
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    paymentProrated: '$5,231.00',
    showProratedAmount: true,
  },
  'Stripe with prorated amount'
);

export const SubscriptionSubsequentInvoiceStripeNoProrated = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
  },
  'Stripe with no prorated amount'
);

export const SubscriptionSubsequentInvoiceCouponFullAmount = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    invoiceSubtotal: '$20.00',
    invoiceTotal: '$0.00',
    invoiceDiscountAmount: '$20.00',
    showProratedAmount: false,
    showPaymentMethod: false,
  },
  'Payment method hidden - coupon covered entire amount'
);

export const SubscriptionSubsequentInvoiceStripeNoProrated3Month = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
    invoiceTotal: '$15.00',
    invoiceSubtotal: '$20.00',
    invoiceDiscountAmount: '$5.00',
    discountType: 'repeating',
    discountDuration: 3,
  },
  'Stripe - 3 Month Coupon'
);

export const SubscriptionSubsequentInvoiceStripeNoProratedOneTime = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
    invoiceTotal: '$15.00',
    invoiceSubtotal: '$20.00',
    invoiceDiscountAmount: '$5.00',
    discountType: 'once',
    discountDuration: null,
  },
  'Stripe - One Time Coupon'
);

export const SubscriptionSubsequentInvoiceStripeNoProratedOneTimeWithTax =
  createStory(
    {
      cardType: 'mastercard',
      cardName: 'Mastercard',
      lastFour: '5309',
      payment_provider: 'stripe',
      showProratedAmount: false,
      invoiceTotal: '$15.00',
      invoiceSubtotal: '$20.00',
      invoiceDiscountAmount: '$5.00',
      invoiceTaxAmount: '$2.00',
      discountType: 'once',
      discountDuration: null,
      showTaxAmount: true,
    },
    'Stripe - One Time Coupon with Tax'
  );

export const SubscriptionSubsequentInvoiceStripeNoProratedWithTax = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    showProratedAmount: false,
    invoiceTaxAmount: '$2.00',
    discountType: null,
    discountDuration: null,
    showTaxAmount: true,
  },
  'Stripe - With Tax'
);
