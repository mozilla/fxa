/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ACCOUNT_RESET_MUTATION } from './index.gql';

export function mockGqlAccountResetMutation() {
  return {
    request: {
      query: ACCOUNT_RESET_MUTATION,
      variables: {
        locators: ['foo@mozilla.com', 'bar@mozilla.com'],
        notificationEmail: 'sre@mozilla.com',
      },
    },
    result: {
      data: {
        resetAccounts: [
          {
            locator: 'foo@mozilla.com',
            status: 'Success',
          },
          {
            locator: 'bar@mozilla.com',
            status: 'Success',
          },
        ],
      },
    },
  };
}
