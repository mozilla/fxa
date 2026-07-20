/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum AccountResetStatus {
  Success = 'Success',
  Failure = 'Failure',
  NoAccount = 'No account found',
}

export class AccountResetResponse {
  locator!: string;

  status!: string;
}
