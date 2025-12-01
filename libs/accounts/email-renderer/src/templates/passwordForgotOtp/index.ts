/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailNoActionTemplateData &
  UserInfoTemplateData & {
    code: string;
    time: string;
    date: string;
  };

export const template = 'passwordForgotOtp';
export const version = 2;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'password-forgot-otp-subject-2',
    message: 'Use <%- code %> to change your password',
  },
  preview: {
    id: 'password-forgot-otp-preview',
    message: 'This code expires in 10 minutes',
  },
};
