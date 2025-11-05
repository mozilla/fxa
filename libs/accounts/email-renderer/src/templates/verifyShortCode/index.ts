/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  code: string;
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
  cmsRpClientId?: string;
  cmsRpFromName?: string;
  entrypoint?: string;
  subject?: string;
  headline?: string;
  description?: string;
  time?: string;
};

export const template = 'verifyShortCode';
export const version = 4;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'verifyShortCode-subject-4',
    message: 'Use <%- code %> to confirm your account',
  },
  preview: {
    id: 'verifyShortCode-preview-2',
    message: 'This code expires in 5 minutes',
  },
};
