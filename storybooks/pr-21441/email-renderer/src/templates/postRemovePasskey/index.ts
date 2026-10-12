/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailChangePasswordTemplateData } from '../../partials/automatedEmailChangePassword';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailChangePasswordTemplateData &
  UserInfoTemplateData & {
    link: string;
  };

export const template = 'postRemovePasskey';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postRemovePasskey-subject',
    message: 'Passkey deleted',
  },
  action: {
    id: 'postRemovePasskey-action',
    message: 'Manage account',
  },
  preview: {
    id: 'postRemovePasskey-preview',
    message: 'A passkey was removed from your account',
  },
};
