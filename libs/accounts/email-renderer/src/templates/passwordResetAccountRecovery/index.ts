/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  passwordChangeLink: string;
  productName: string;
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

export const template = 'passwordResetAccountRecovery';
export const version = 9;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'passwordResetAccountRecovery-subject-2',
    message: 'Your password has been reset',
  },
  action: {
    id: 'passwordResetAccountRecovery-action-4',
    message: 'Manage account',
  },
};
