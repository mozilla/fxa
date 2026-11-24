/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailResetPasswordTemplateData } from '../../partials/automatedEmailResetPassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailResetPasswordTemplateData &
  UserInfoTemplateData & {
    time: string;
    date: string;
    resetLink: string;
  };

export const template = 'passwordChanged';
export const version = 5;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'passwordChanged-subject',
    message: 'Password updated',
  },
};
