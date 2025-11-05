/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  subscriptions: Array<{ productName: string }>;
  subscriptionSupportUrl: string;
  updateBillingUrl: string;
  productName: string;
};

export const template = 'subscriptionsPaymentProviderCancelled';
export const version = 3;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionsPaymentProviderCancelled-subject-2',
    message: 'Your <%- productName %> subscription has been cancelled',
  },
};
