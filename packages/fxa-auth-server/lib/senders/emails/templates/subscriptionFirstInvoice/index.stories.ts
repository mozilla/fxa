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
  'Sent to inform a user that their payment is currently being processed.',
  {
    productName: 'Firefox Fortress',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceDateOnly: '10/13/2021',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    invoiceNumber: '8675309',
    invoiceTotal: '$20.00',
    nextInvoiceDateOnly: '11/13/2021',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const SubscriptionFirstInvoice = createStory();

export const SubscriptionFirstInvoiceWithPayPal = createStory(
  {
    productName: 'Firefox Fortress',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceDateOnly: '10/13/2021',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    invoiceNumber: '8675309',
    invoiceTotal: '$20.00',
    nextInvoiceDateOnly: '11/13/2021',
    payment_provider: 'paypal',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  },
  'PayPal'
);

export const SubscriptionFirstInvoiceWithStripe = createStory(
  {
    productName: 'Firefox Fortress',
    cardType: 'MasterCard',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    invoiceDateOnly: '10/13/2021',
    invoiceLink:
      'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_GyHjTyIXBg8jj5yjt7Z0T4CCG3hfGtp',
    invoiceNumber: '8675309',
    invoiceTotal: '$20.00',
    lastFour: '5309',
    nextInvoiceDateOnly: '11/13/2021',
    payment_provider: 'stripe',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  },
  'Stripe'
);
