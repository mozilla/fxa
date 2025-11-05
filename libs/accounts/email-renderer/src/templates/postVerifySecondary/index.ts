/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  secondaryEmail: string;
  passwordChangeLink: string;
};
export const template = 'postVerifySecondary';
export const version = 6;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postVerifySecondary-subject',
    message: 'Secondary email added',
  },
  action: {
    id: 'postVerifySecondary-action',
    message: 'Manage account',
  },
};
