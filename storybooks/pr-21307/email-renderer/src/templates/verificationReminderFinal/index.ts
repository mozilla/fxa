/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';

export type TemplateData = AutomatedEmailNoActionTemplateData & {
  link: string;
};

export const template = 'verificationReminderFinal';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'verificationReminderFinal-subject',
    message: 'Final reminder to confirm your account',
  },
  action: {
    id: 'confirm-account',
    message: 'Confirm account',
  },
};
