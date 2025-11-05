/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  passwordChangeLink: string;
  twoFactorSupportLink: string;
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

export const template = 'postAddTwoStepAuthentication';
export const version = 11;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postAddTwoStepAuthentication-subject-v3',
    message: 'Two-step authentication is on',
  },
  preview: {
    id: 'postAddTwoStepAuthentication-preview',
    message: 'Your account is protected',
  },
  action: {
    id: 'postAddTwoStepAuthentication-action',
    message: 'Manage account',
  },
};
