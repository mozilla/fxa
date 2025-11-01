/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  reminderShortForm: boolean;
  resetLink: string;
  subscriptionSupportUrl: string;
};

export const template = 'subscriptionAccountReminderFirst';
export const version = 3;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionAccountReminderFirst-subject',
    message: 'Reminder: Finish setting up your account',
  },
  action: {
    id: 'subscriptionAccountReminderFirst-action',
    message: 'Create Password',
  },
};
