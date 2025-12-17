/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AppBadgesTemplateData } from '../../partials/appBadges';
import { TemplateData as AutomatedEmailChangePasswordTemplateData } from '../../partials/automatedEmailChangePassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AppBadgesTemplateData &
  AutomatedEmailChangePasswordTemplateData &
  UserInfoTemplateData & {
    link: string;
    passwordChangeLink: string;
    productName: string;
  };

export const template = 'passwordResetAccountRecovery';
export const version = 9;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'passwordResetAccountRecovery-subject-2',
    message: 'Your password has been reset',
  },
  action: {
    id: 'passwordResetAccountRecovery-action-4',
    message: 'Manage account',
  },
};
