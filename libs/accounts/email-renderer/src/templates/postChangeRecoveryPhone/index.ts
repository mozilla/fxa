/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
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

export const template = 'postChangeRecoveryPhone';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postChangeRecoveryPhone-subject',
    message: 'Recovery phone updated',
  },
  preview: {
    id: 'postChangeRecoveryPhone-preview',
    message: 'Account protected by two-step authentication',
  },
};
