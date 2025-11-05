/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  productName: string;
  isCancellationEmail: boolean;
  invoiceTotal: string;
  invoiceDateOnly: string;
  cancellationSurveryUrl: string;
};

export const template = 'subscriptionAccountDeletion';
export const version = 2;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionAccountDeletion-subject',
    message: 'Your <%- productName %> subscription has been cancelled',
  },
};
