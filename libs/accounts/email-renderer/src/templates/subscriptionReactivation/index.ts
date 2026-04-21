/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as IconTemplateData } from '../../partials/icon';
import { TemplateData as SubscriptionSupportTemplateData } from '../../partials/subscriptionSupport';

export type TemplateData = IconTemplateData &
  SubscriptionSupportTemplateData & {
    productName: string;
    invoiceTotal: string;
    nextInvoiceDateOnly: string;
    icon: string;
    subscriptionSupportUrl: string;
    isFreeTrialReactivation: boolean;
  };

export const template = 'subscriptionReactivation';
export const version = 3;
export const layout = 'subscription';

export function getIncludes(isFreeTrialReactivation: boolean) {
  return {
    subject: isFreeTrialReactivation
      ? {
          id: 'subscriptionReactivation-freeTrial-subject',
          message: 'Your <%- productName %> trial has been reactivated',
        }
      : {
          id: 'subscriptionReactivation-subject-2',
          message: 'Your <%- productName %> subscription has been reactivated',
        },
  };
}
