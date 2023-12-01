/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GlobalTemplateValues } from '../../../renderer';

export const getIncludes = (clientName: string): GlobalTemplateValues => {
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
};

export default getIncludes;
