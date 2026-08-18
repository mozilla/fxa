/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailSignInTemplateData } from '../../partials/automatedEmailSignIn';
import { TemplateData as UserInfoTemplateData } from '../../partials/userInfo';

export type TemplateData = AutomatedEmailSignInTemplateData &
  UserInfoTemplateData & {
    link: string;
    passkeySupportUrl: string;
    showSyncPasswordNote: boolean;
  };

export const template = 'postAddPasskey';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postAddPasskey-subject',
    message: 'Passkey created',
  },
  action: {
    id: 'postAddPasskey-action',
    message: 'Manage account',
  },
  preview: {
    id: 'postAddPasskey-preview',
    message: 'You can now use your device to sign in',
  },
};
