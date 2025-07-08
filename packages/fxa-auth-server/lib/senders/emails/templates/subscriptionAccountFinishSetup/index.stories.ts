/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionAccountFinishSetup',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionAccountFinishSetup',
  'Sent to a user after they purchased the product through the password-less flow without an existing Mozilla account.',
  {
    productName: 'Firefox Fortress',
    icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
    link: 'http://localhost:3030/post_verify/finish_account_setup/set_password',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    isFinishSetup: true,
  }
);

export const SubscriptionFirstInvoiceNumberOnly = createStory(
  {
    invoiceNumber: '8675309',
  },
  'Missing Details - Invoice Number Only'
);

export const SubscriptionFirstInvoiceTotalOnly = createStory(
  {
    invoiceDateOnly: '10/13/2021',
    invoiceTotal: '$20.00',
  },
  'Missing Details - Invoice Date & Total Only'
);

export const SubscriptionFirstInvoiceNextOnly = createStory(
  {
    nextInvoiceDateOnly: '11/13/2021',
  },
  'Missing Details - Next Invoice Only'
);

export const SubscriptionAccountFinishSetupFullDetails = createStory(
  {
    invoiceDateOnly: '10/13/2021',
    invoiceNumber: '8675309',
    invoiceTotal: '$20.00',
    nextInvoiceDateOnly: '11/13/2021',
  },
  'Full Details'
);
