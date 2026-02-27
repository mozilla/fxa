/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  productName: string;
  serviceLastActiveDateOnly: string;
  accountSettingsUrl: string;
  subscriptionSupportUrlWithUtm: string;
  churnTermsUrlWithUtm: string;
  productIconURLNew: string;
  ctaButtonLabel?: string;
  ctaButtonUrlWithUtm?: string;
  showChurn: boolean;
};

export const template = 'subscriptionEndingReminder';
export const version = 1;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionEndingReminder-subject',
    message: 'Your <%- productName %> subscription will expire soon',
  },
};
