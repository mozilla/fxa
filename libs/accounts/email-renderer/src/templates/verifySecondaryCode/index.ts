/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  email: string;
  code: string;
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

export const template = 'verifySecondaryCode';
export const version = 1;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'verifySecondaryCode-subject-2',
    message: 'Use <%- code %> to confirm your secondary email',
  },
  preview: {
    id: 'verifySecondaryCode-preview',
    message: 'This code expires in 5 minutes.',
  },
  action: {
    id: 'verifySecondaryCode-action-2',
    message: 'Confirm email',
  },
};
