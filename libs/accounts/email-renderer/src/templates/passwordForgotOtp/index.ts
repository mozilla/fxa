/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
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

export const template = 'passwordForgotOtp';
export const version = 2;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'password-forgot-otp-subject-2',
    message: 'Use <%- code %> to change your password',
  },
  preview: {
    id: 'password-forgot-otp-preview',
    message: 'This code expires in 10 minutes',
  },
};
