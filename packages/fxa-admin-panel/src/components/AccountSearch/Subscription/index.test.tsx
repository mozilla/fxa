/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Subscription from '.';

const subscription = {
  created: 1583259953,
  currentPeriodEnd: 1596758906,
  currentPeriodStart: 1594080506,
  cancelAtPeriodEnd: false,
  endAt: 1596759006,
  latestInvoice:
    'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_HbGuRujVERsyXZy0zArp7SLFRhY9i6S/pdf',
  planId: 'plan_GqM9N6qyhvxaVk',
  productName: 'Cooking with Foxkeh',
  productId: 'il_1H24MIBVqmGyQTMa2hcoK0YW',
  status: 'succeeded',
  subscriptionId: 'sub_HbGu2EjvFQpuD2',
};

it('renders each field as expected', () => {
  render(<Subscription {...subscription} />);

  screen.getByText(subscription.productName);
  screen.getByText(subscription.status);
  expect(screen.getAllByText('1970-01-19 @', { exact: false })).toHaveLength(4);
  screen.getByText('No');

  screen.getByText(subscription.subscriptionId);
  screen.getByText(subscription.productId);
  screen.getByText(subscription.planId);

  const invoiceLink = screen.getByText('Latest invoice');
  expect(invoiceLink).toHaveAttribute('href', subscription.latestInvoice);
});
