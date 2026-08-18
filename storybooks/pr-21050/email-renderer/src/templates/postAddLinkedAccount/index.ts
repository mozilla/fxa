/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailChangePasswordTemplateData } from '../../partials/automatedEmailChangePassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailChangePasswordTemplateData &
  UserInfoTemplateData & {
    link: string;
    passwordChangeLink: string;
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
    providerName: string;
  };

export const template = 'postAddLinkedAccount';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postAddLinkedAccount-subject-2',
    message: 'New account linked to your Mozilla account',
  },
  action: {
    id: 'postAddLinkedAccount-action',
    message: 'Manage account',
  },
};
