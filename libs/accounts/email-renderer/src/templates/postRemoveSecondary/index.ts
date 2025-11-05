/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  secondaryEmail: string;
};

export const template = 'postRemoveSecondary';
export const version = 5;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postRemoveSecondary-subject',
    message: 'Secondary email removed',
  },
  action: {
    id: 'postRemoveSecondary-action',
    message: 'Manage account',
  },
};
