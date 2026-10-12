/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailResetPasswordTemplateData } from '../../partials/automatedEmailResetPassword';
import { TemplateData as SubscriptionSupportTemplateData } from '../../partials/subscriptionSupport';

export type TemplateData = AutomatedEmailResetPasswordTemplateData &
  SubscriptionSupportTemplateData & {
    link: string;
    reminderShortForm: boolean;
    resetLink: string;
    subscriptionSupportUrl: string;
  };

export const template = 'subscriptionAccountReminderSecond';
export const version = 3;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionAccountReminderSecond-subject',
    message: 'Final reminder: Setup your account',
  },
  action: {
    id: 'subscriptionAccountReminderSecond-action',
    message: 'Create Password',
  },
};
