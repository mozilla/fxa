/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  oneClickLink: string;
  link: string;
  productName: string;
};

export const template = 'cadReminderSecond';
export const version = 3;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'cadReminderSecond-subject-2',
    message: 'Don’t miss out! Let’s finish your sync setup',
  },
  action: {
    id: 'cadReminderSecond-action',
    message: 'Sync another device',
  },
};
