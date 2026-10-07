/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';

export type TemplateData = AutomatedEmailNoActionTemplateData & {
  link: string;
};

export const template = 'verificationReminderFirst';
export const version = 10;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'verificationReminderFirst-subject-2',
    message: 'Remember to confirm your account',
  },
  action: {
    id: 'verificationReminderFirst-action-2',
    message: 'Confirm account',
  },
};
