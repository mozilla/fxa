/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  deletionDate: string;
  link: string;
};

export const template = 'inactiveAccountFinalWarning';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'inactiveAccountFinalWarning-subject',
    message: 'Donʼt lose your account',
  },
  action: {
    id: 'inactiveAccountFinalWarning-action',
    message: 'Sign in to keep your account',
  },
  preview: {
    id: 'inactiveAccountFinalWarning-preview',
    message: 'Sign in to keep your account',
  },
};
