/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailChangePasswordTemplateData } from '../../partials/automatedEmailChangePassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailChangePasswordTemplateData &
  UserInfoTemplateData & {
    code: string;
    expirationTime: number;
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
  };

export const template = 'verifyAccountChange';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'verifyAccountChange-subject',
    message: 'Use <%- code %> to change your account',
  },
  preview: {
    id: 'verifyAccountChange-preview',
    message:
      "This code expires in <%- expirationTime === 1 ? '1 minute' : expirationTime + ' minutes' %>.",
  },
};
