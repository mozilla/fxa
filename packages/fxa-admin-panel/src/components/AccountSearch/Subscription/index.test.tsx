/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Subscription from '.';
import { MozSubscription } from 'fxa-admin-server/src/graphql';

const subscription: MozSubscription = {
  created: 1583259953 * 1e3,
  currentPeriodEnd: 1583259953 * 1e3 + 60 * 60,
  currentPeriodStart: 1583259953 * 1e3,
  cancelAtPeriodEnd: false,
  endedAt: 1583259953 * 1e3 + 60 * 60,
  latestInvoice:
    'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_HbGuRujVERsyXZy0zArp7SLFRhY9i6S/pdf',
  planId: 'plan_GqM9N6qyhvxaVk',
  productName: 'Cooking with Foxkeh',
  productId: 'il_1H24MIBVqmGyQTMa2hcoK0YW',
  status: 'succeeded',
  subscriptionId: 'sub_HbGu2EjvFQpuD2',
  manageSubscriptionLink: 'https://billing.stripe.com/session/test_123',
};

it('renders each field as expected', () => {
  render(<Subscription {...subscription} />);

  screen.getByText(subscription.productName);
  screen.getByText(subscription.status);

  // The date is rendered based on user local time. So depending on the user's clock
  // the date could land on the 6th or 7th.
  expect(screen.getAllByText(/2020-03-0[34] @/, { exact: false })).toHaveLength(
    4
  );
  screen.getByText('No');

  screen.getByText(subscription.subscriptionId);
  screen.getByText(subscription.productId);
  screen.getByText(subscription.planId);

  const invoiceLink = screen.getByText('Latest invoice');
  expect(invoiceLink).toHaveAttribute('href', subscription.latestInvoice);

  const manageSubscriptionLink = screen.getByText('Manage Subscription');
  expect(manageSubscriptionLink).toHaveAttribute(
    'href',
    subscription.manageSubscriptionLink
  );
});
