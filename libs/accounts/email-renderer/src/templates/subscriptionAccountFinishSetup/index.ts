/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  productName: string;
  icon: string;
  link: string;
  subscriptionSupportUrl: string;
  isFinishSetup: boolean;
};

export const template = 'subscriptionAccountFinishSetup';
export const version = 2;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionAccountFinishSetup-subject',
    message: 'Welcome to <%- productName %>: Please set your password.',
  },
  action: {
    id: 'subscriptionAccountFinishSetup-action-2',
    message: 'Get started',
  },
};
