/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Model } from 'objection';

export class EmailBounces extends Model {
  public static tableName = 'emailBounces';
  public static idColumn = ['email', 'createdAt'];

  public readonly email!: string;
  public createdAt!: number;
  public bounceType!: number;
  public bounceSubType!: number;
}
