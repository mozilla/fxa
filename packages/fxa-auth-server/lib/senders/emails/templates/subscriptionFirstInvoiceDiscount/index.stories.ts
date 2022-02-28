/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionFirstInvoiceDiscount',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionFirstInvoiceDiscount',
  'Sent to inform a user that their first payment, with a discount coupon, is currently being processed.',
  {
    productName: 'Firefox Fortress',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceDateOnly: '10/13/2021',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    invoiceNumber: '8675309',
    invoiceTotal: '$18.00',
    invoiceSubtotal: '$20.00',
    invoiceDiscountAmount: '$2.00',
    nextInvoiceDateOnly: '11/13/2021',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    showPaymentMethod: true,
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
    cardType: 'MasterCard',
    lastFour: '5309',
    payment_provider: 'stripe',
  },
  'Payment method - Stripe'
);

export const SubscriptionFirstInvoiceWithCoupon = createStory(
  {
    cardType: null,
    lastFour: null,
    payment_provider: 'stripe',
    invoiceTotal: '$0.00',
    invoiceDiscountAmount: '$20.00',
    showPaymentMethod: false,
  },
  'Payment method hidden - coupon covered entire amount'
);
