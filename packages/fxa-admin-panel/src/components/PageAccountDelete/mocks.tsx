/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ACCOUNT_DELETE_MUTATION,
  ACCOUNT_DELETE_TASK_STATUS_QUERY,
} from './index.gql';

export function mockGqlAccountDeleteTaskStatusQuery() {
  return {
    request: {
      query: ACCOUNT_DELETE_TASK_STATUS_QUERY,
      variables: {
        taskNames: ['task-foo', 'task-bar'],
      },
    },
    result: {
      data: {
        getDeleteStatus: [
          {
            taskName: 'task-foo',
            status: 'Pending',
          },
          {
            taskName: 'task-bar',
            status: 'Task completed.',
          },
        ],
      },
    },
  };
}

export function mockGqlAccountDeleteMutation() {
  return {
    request: {
      query: ACCOUNT_DELETE_MUTATION,
      variables: {
        locators: ['foo@mozilla.com', 'bar@mozilla.com'],
      },
    },
    result: {
      data: {
        deleteAccounts: [
          {
            taskName: 'task-foo',
            locator: 'foo@mozilla.com',
            status: 'Pending',
          },
          {
            taskName: 'task-bar',
            locator: 'bar@mozilla.com',
            status: 'Pending',
          },
        ],
      },
    },
  };
}
