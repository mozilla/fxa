/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

export class Group extends BaseAuthModel {
  public static tableName = 'groups';
  public static idColumn = 'id';

  // table fields
  id!: number;
  name!: string;
  capabilities!: string;

  static async findByUserId(uid: string) {
    return this.query()
      .select('groups.name', 'groups.capabilities')
      .join('accountGroups', 'groups.id', 'accountGroups.group_id')
      .where('accountGroups.uid', uid);
  }
}
