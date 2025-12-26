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

export const template = 'postNewRecoveryCodes';
export const version = 7;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'postNewRecoveryCodes-subject-2',
    message: 'New backup authentication codes created',
  },
  action: {
    id: 'postNewRecoveryCodes-action',
    message: 'Manage account',
  },
};
