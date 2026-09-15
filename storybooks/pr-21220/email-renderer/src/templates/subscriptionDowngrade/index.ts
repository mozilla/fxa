/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as IconTemplateData } from '../../partials/icon';
import { TemplateData as SubscriptionSupportTemplateData } from '../../partials/subscriptionSupport';

export type TemplateData = IconTemplateData &
  SubscriptionSupportTemplateData & {
    paymentAmountNew: string;
    paymentAmountOld: string;
    paymentProrated: string;
    productIconURLNew: string;
    productIconURLOld: string;
    productName: string;
    productNameOld: string;
    productPaymentCycleNew: string;
    productPaymentCycleOld: string;
    subscriptionSupportUrl: string;
  };

export const template = 'subscriptionDowngrade';
export const version = 2;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionDowngrade-subject',
    message: 'You have switched to <%- productName %>',
  },
};
