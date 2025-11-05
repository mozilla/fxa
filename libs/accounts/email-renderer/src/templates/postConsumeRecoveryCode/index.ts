/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  resetLink: string;
  twoFactorSettingsLink: string;
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

export const template = 'postConsumeRecoveryCode';
export const version = 8;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postConsumeRecoveryCode-subject-v3',
    message: 'Backup authentication code used',
  },
  action: {
    id: 'postConsumeRecoveryCode-action',
    message: 'Manage account',
  },
  preview: {
    id: 'postConsumeRecoveryCode-preview',
    message: 'Check to make sure this was you',
  },
};
