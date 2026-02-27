/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  productName: string;
};

export const template = 'subscriptionReplaced';
export const version = 1;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionReplaced-subject',
    message: 'Your subscription has been updated as part of your upgrade',
  },
};
