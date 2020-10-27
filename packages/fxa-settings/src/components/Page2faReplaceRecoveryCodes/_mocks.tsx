/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CHANGE_RECOVERY_CODES_MUTATION } from '.';

export const CHANGE_RECOVERY_CODE_MOCK = [
  {
    request: {
      query: CHANGE_RECOVERY_CODES_MUTATION,
      variables: { input: {} },
    },
    result: {
      data: {
        changeRecoveryCodes: {
          recoveryCodes: ['06pw3ec276', 'ap0d60q2qn', '8pwzhsmsjm'],
        },
      },
    },
  },
];

export const CHANGE_RECOVERY_CODE_ERROR_MOCK = [
  {
    request: {
      query: CHANGE_RECOVERY_CODES_MUTATION,
      variables: { input: {} },
    },
    error: new Error('Borked'),
  },
];
