/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as SubscriptionSupportTemplateData } from '../../partials/subscriptionSupport';
import { TemplateData as SubscriptionUpdatePaymentTemplateData } from '../../partials/subscriptionUpdatePayment';

export type TemplateData = SubscriptionSupportTemplateData &
  SubscriptionUpdatePaymentTemplateData & {
    subscriptions: Array<{ productName: string }>;
    updateBillingUrl: string;
    subscriptionSupportUrl: string;
    productName: string;
  };

export const template = 'subscriptionsPaymentExpired';
export const version = 4;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionsPaymentExpired-subject',
    message: 'Payment method for <%- productName %> expired or expiring soon',
  },
};
