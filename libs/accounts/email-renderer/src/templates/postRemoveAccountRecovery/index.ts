/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
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
};

export const template = 'postRemoveAccountRecovery';
export const version = 8;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postRemoveAccountRecovery-subject-2',
    message: 'Account recovery key deleted',
  },
  action: {
    id: 'postRemoveAccountRecovery-action',
    message: 'Manage account',
  },
};
