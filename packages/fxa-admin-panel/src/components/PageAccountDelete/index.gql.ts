/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export type TaskStatus = {
  taskName: string;
  status: string;
};

export const ACCOUNT_DELETE_TASK_STATUS_QUERY = gql`
  query getDeleteStatus($taskNames: [String!]!) {
    getDeleteStatus(taskNames: $taskNames) {
      taskName
      status
    }
  }
`;

export type AccountDeleteResult = {
  locator: string;
  taskName: string;
  status: string;
};

export const ACCOUNT_DELETE_MUTATION = gql`
  mutation deleteAccounts($locators: [String!]!) {
    deleteAccounts(locators: $locators) {
      taskName
      locator
      status
    }
  }
`;
