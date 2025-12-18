/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as SubscriptionSupportTemplateData } from '../../partials/subscriptionSupport';
import { TemplateData as SubscriptionUpdatePaymentTemplateData } from '../../partials/subscriptionUpdatePayment';

export type TemplateData = SubscriptionSupportTemplateData &
  SubscriptionUpdatePaymentTemplateData & {
    productName: string;
    updateBillingUrl: string;
    subscriptionSupportUrl: string;
  };

export const template = 'subscriptionPaymentExpired';
export const version = 4;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionPaymentExpired-subject-2',
    message: 'Payment method for <%- productName %> expired or expiring soon',
  },
};
