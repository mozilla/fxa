/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailNoActionTemplateData &
  UserInfoTemplateData & {
    link: string;
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
export const template = 'recovery';
export const version = 6;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'recovery-subject',
    message: 'Reset your password',
  },
  action: {
    id: 'recovery-action',
    message: 'Create new password',
  },
};
