/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
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
  time: string;
  clientName: string;
  passwordChangeLink: string;
  link: string;
  mozillaSupportUrl: string;
  showBannerWarning: boolean;
  cmsRpClientId?: string;
  cmsRpFromName?: string;
  entrypoint?: string;
  subject?: string;
  headline?: string;
  description?: string;
};

export const template = 'newDeviceLogin';
export const version = 7;
export const layout = 'fxa';

export function getIncludes({ clientName }: TemplateData) {
  const subject =
    clientName === 'Mozilla'
      ? {
          id: 'newDeviceLogin-subjectForMozillaAccount',
          message: 'New sign-in to your Mozilla account',
        }
      : {
          id: 'newDeviceLogin-subject',
          message: 'New sign-in to <%- clientName %>',
        };

  return {
    subject,
    action: {
      id: 'newDeviceLogin-action',
      message: 'Manage account',
    },
  };
}
