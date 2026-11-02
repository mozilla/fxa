/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';
import { TemplateData as CmsEmailTemplateData } from '../../partials/cmsEmail';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailNoActionTemplateData &
  CmsEmailTemplateData &
  UserInfoTemplateData & {
    date: string;
    time: string;
    clientName: string;
    passwordChangeLink: string;
    link: string;
    mozillaSupportUrl: string;
    showBannerWarning: boolean;
  };

export const template = 'newDeviceLogin';
export const version = 7;
export const layout = 'fxa';

export function getIncludes({ clientName }: TemplateData) {
  const subject =
    clientName === 'Mozilla'
      ? {
          id: 'newDeviceLogin-subjectForMozillaAccount',
          message: 'New sign-in to your Mozilla account',
        }
      : {
          id: 'newDeviceLogin-subject',
          message: 'New sign-in to <%- clientName %>',
        };

  return {
    subject,
    action: {
      id: 'newDeviceLogin-action',
      message: 'Manage account',
    },
  };
}
