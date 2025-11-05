/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  email: string;
  link: string;
  passwordChangeLink: string;
};

export const template = 'postChangePrimary';
export const version = 5;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postChangePrimary-subject',
    message: 'Primary email updated',
  },
  action: {
    id: 'postChangePrimary-action',
    message: 'Manage account',
  },
};
