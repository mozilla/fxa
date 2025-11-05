/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  unblockCode: string;
  reportSignInLink: string;
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

export const template = 'unblockCode';
export const version = 7;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'unblockCode-subject-2',
    message: 'Use <%- unblockCode %> to sign in',
  },
  preview: {
    id: 'unblockCode-preview',
    message: 'This code expires in one hour',
  },
};
