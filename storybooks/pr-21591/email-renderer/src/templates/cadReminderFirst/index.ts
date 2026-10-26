/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AppBadgesTemplateData } from '../../partials/appBadges';
import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';

export type TemplateData = AppBadgesTemplateData &
  AutomatedEmailNoActionTemplateData & {
    oneClickLink: string;
    link: string;
    productName: string;
  };
export const template = 'cadReminderFirst';
export const version = 3;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'cadReminderFirst-subject-1',
    message: 'Reminder! Let’s sync Firefox',
  },
  action: {
    id: 'cadReminderFirst-action',
    message: 'Sync another device',
  },
};
