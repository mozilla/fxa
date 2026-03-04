/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountDeleteTaskStatus } from 'fxa-admin-server/src/types';

export const mockDeleteResults = [
  { taskName: 'task-foo', locator: 'foo@mozilla.com', status: 'Pending' },
  { taskName: 'task-bar', locator: 'bar@mozilla.com', status: 'Pending' },
];

export const mockTaskStatuses: AccountDeleteTaskStatus[] = [
  { taskName: 'task-foo', status: 'Pending' },
  { taskName: 'task-bar', status: 'Task completed.' },
];
