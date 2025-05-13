/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionFirstInvoice',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionFirstInvoice',
  'Sent to inform a user that their first payment is currently being processed.',
  {
    productName: 'Firefox Fortress',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceDateOnly: '10/13/2021',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    invoiceNumber: '8675309',
    invoiceTotal: '$20.00',
    invoiceTotalInCents: 2000,
    invoiceSubtotal: null,
    invoiceTaxAmount: null,
    invoiceDiscountAmount: null,
    discountType: null,
    discountDuration: null,
    nextInvoiceDateOnly: '11/13/2021',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    paymentProrated: null,
    showPaymentMethod: true,
    showProratedAmount: false,
    showTaxAmount: false,
  }
);

export const SubscriptionFirstInvoiceWithPayPal = createStory(
  {
    payment_provider: 'paypal',
  },
  'Payment method - PayPal'
);

export const SubscriptionFirstInvoiceWithStripe = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
  },
  'Payment method - Stripe'
);

export const SubscriptionFirstInvoiceWithStripeUnknownCard = createStory(
  {
    cardType: 'unknown',
    cardName: 'Unknown',
    lastFour: '5309',
    payment_provider: 'stripe',
  },
  'Payment method - Stripe (Unknown card)'
);

export const SubscriptionFirstInvoiceWithCoupon = createStory(
  {
    cardType: null,
    lastFour: null,
    payment_provider: 'stripe',
    invoiceTotal: '$0.00',
    invoiceDiscountAmount: '$20.00',
    discountType: 'forever',
    discountDuration: null,
    showPaymentMethod: false,
  },
  'Payment method hidden - coupon covered entire amount'
);

export const SubscriptionFirstInvoiceWithStripe3Month = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    invoiceTotal: '$15.00',
    invoiceSubtotal: '$20.00',
    invoiceDiscountAmount: '$5.00',
    discountType: 'repeating',
    discountDuration: 3,
  },
  'Stripe - 3 month Coupon'
);

export const SubscriptionFirstInvoiceWithStripeOneTime = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    invoiceTotal: '$15.00',
    invoiceSubtotal: '$20.00',
    invoiceDiscountAmount: '$5.00',
    discountType: 'once',
    discountDuration: null,
  },
  'Stripe - One Time Coupon'
);

export const SubscriptionFirstInvoiceWithStripeTaxAndForeverCoupon =
  createStory(
    {
      cardType: 'mastercard',
      cardName: 'Mastercard',
      lastFour: '5309',
      payment_provider: 'stripe',
      invoiceTotal: '$15.00',
      invoiceSubtotal: '$20.00',
      invoiceDiscountAmount: '$5.00',
      invoiceTaxAmount: '$2.00',
      discountType: 'forever',
      discountDuration: null,
      showTaxAmount: true,
    },
    'Stripe - With Tax and Forever Coupon'
  );

export const SubscriptionFirstInvoiceWithStripeTax = createStory(
  {
    cardType: 'mastercard',
    cardName: 'Mastercard',
    lastFour: '5309',
    payment_provider: 'stripe',
    invoiceTaxAmount: '$3.00',
    discountType: null,
    discountDuration: null,
    showTaxAmount: true,
  },
  'Stripe - With Tax'
);
