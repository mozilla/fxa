/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

export class DeletedAccount extends BaseAuthModel {
  public static tableName = 'deletedAccounts';
  public static idColumn = 'uid';

  protected $uuidFields = ['uid'];

  uid!: string;
  deletedAt!: number;
}
