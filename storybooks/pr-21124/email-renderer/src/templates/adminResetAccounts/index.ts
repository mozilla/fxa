/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  status: Array<{
    locator: string;
    status: string;
  }>;
};

export const template = 'adminResetAccounts';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'adminResetAccounts-subject-1',
    message: 'Fxa Admin: Accounts Reset',
  },
};
