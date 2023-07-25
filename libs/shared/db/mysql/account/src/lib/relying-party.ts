/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

export class RelyingParty extends BaseModel {
  static tableName = 'clients';
  protected $uuidFields = ['id'];

  id!: string;
  name!: string;
  imageUri!: string;
  redirectUri!: string;
  canGrant!: boolean;
  publicClient!: boolean;
  createdAt!: number;
  trusted!: boolean;
  allowedScopes!: string | null;
  notes!: string | null;
}
