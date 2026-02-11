/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailNoActionTemplateData &
  UserInfoTemplateData & {
    code: string;
    codeExpiryMinutes: number;
    time: string;
    date: string;
  };

export const template = 'passwordlessSigninOtp';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'passwordless-signin-otp-subject',
    message: 'Use <%- code %> to finish sign in',
  },
  preview: {
    id: 'passwordless-signin-otp-preview',
    message: 'Code expires in <%- codeExpiryMinutes %> minutes',
  },
};
