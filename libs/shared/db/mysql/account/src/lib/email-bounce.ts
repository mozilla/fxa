/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

export class EmailBounce extends BaseModel {
  public static tableName = 'emailBounces';
  public static idColumn = ['email', 'createdAt'];

  // table fields
  email!: string;
  emailTypeId!: number;
  bounceType!: number;
  bounceSubType!: number;
  createdAt!: number;
  diagnosticCode?: string | null;
}
