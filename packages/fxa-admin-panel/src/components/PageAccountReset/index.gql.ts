/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export type AccountResetResult = {
  locator: string;
  status: string;
};

export const ACCOUNT_RESET_MUTATION = gql`
  mutation resetAccounts($locators: [String!]!, $notificationEmail: String!) {
    resetAccounts(locators: $locators, notificationEmail: $notificationEmail) {
      locator
      status
    }
  }
`;
