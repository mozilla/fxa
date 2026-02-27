/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailChangePasswordTemplateData } from '../../partials/automatedEmailChangePassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailChangePasswordTemplateData &
  UserInfoTemplateData & {
    code: string;
    passwordChangeLink: string;
    serviceName: string;
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

    cmsRpClientId?: string;
    cmsRpFromName?: string;
    entrypoint?: string;
    subject?: string;
    headline?: string;
    description?: string;
  };

export const template = 'verifyLoginCode';
export const version = 9;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'verifyLoginCode-subject-line-3',
    message: 'Use <%- code %> to sign in',
  },
  preview: {
    id: 'verifyLoginCode-preview',
    message: 'This code expires in 5 minutes.',
  },
};
