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
    invoiceTotal: '$20.00',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    nextInvoiceDateOnly: '1/14/2022',
    subscriptionSupportUrl: 'http://localhost:3030/support',
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
