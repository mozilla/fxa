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
  'Sent to a user to inform them that their payment is processing and prompt them to create a password and download subscription.',
  {
    productName: 'Firefox Fortress',
    invoiceDateOnly: '10/13/2021',
    invoiceNumber: '8675309',
    invoiceTotal: '$20.00',
    nextInvoiceDateOnly: '11/13/2021',
    icon: 'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    link: 'http://localhost:3030/post_verify/finish_account_setup/set_password',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const SubscriptionAccountFinishSetup = createStory();
