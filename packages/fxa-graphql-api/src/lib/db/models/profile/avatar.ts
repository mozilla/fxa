/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProfileBaseModel } from './profile-base';

export class Avatar extends ProfileBaseModel {
  public static tableName = 'avatars';

  protected $uuidFields = ['id', 'userId'];

  public id!: string;
  public userId!: string;
  public name!: string;
  public url!: string;
}
