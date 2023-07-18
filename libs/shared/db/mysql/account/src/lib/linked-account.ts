/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

export class LinkedAccount extends BaseModel {
  static tableName = 'linkedAccounts';
  static idColumn = 'id';

  protected $uuidFields = ['uid'];
  protected $intBoolFields = ['enabled'];

  uid!: string;
  id!: string;
  providerId!: number;
  enabled!: boolean;
  authAt!: number;
}
