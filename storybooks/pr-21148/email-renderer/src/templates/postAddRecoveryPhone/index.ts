/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailResetPasswordTemplateData } from '../../partials/automatedEmailResetPassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailResetPasswordTemplateData &
  UserInfoTemplateData & {
    maskedLastFourPhoneNumber: string;
    link: string;
    resetLink: string;
    twoFactorSupportLink: string;
    time: string;
    device: {
      uaBrowser: string;
      uaOSVersion: string;
      uaOS: string;
    };
    location: {
      stateCode: string;
      country: string;
      city: string;
    };
    date: string;
  };

export const template = 'postAddRecoveryPhone';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postAddRecoveryPhone-subject',
    message: 'Recovery phone added',
  },
  action: {
    id: 'postAddRecoveryPhone-action',
    message: 'Manage account',
  },
  preview: {
    id: 'postAddRecoveryPhone-preview',
    message: 'Account protected by two-step authentication',
  },
};
