/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum AccountDeleteStatus {
  Success = 'Success',
  Failure = 'Failure',
  NoAccount = 'No account found',
}

export class AccountDeleteResponse {
  /** Name of task held in the task queue. This can be used to get task's status later. */
  public taskName!: string;

  /** A valid account email or UID */
  public locator!: string;

  /** A short status message. */
  status!: AccountDeleteStatus;
}

export class AccountDeleteTaskStatus {
  /** Name of task held in the task queue.. */
  public taskName!: string;

  /** A short status message. */
  status!: string;
}
