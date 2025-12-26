/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  resetLink: string;
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

export const template = 'postSigninRecoveryPhone';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postSigninRecoveryPhone-subject',
    message: 'Recovery phone used to sign in',
  },
  action: {
    id: 'postSigninRecoveryPhone-action',
    message: 'Manage account',
  },
  preview: {
    id: 'postSigninRecoveryPhone-preview',
    message: 'Confirm account activity',
  },
};
