/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthBaseModel, Proc } from './auth-base';

export class EmailBounce extends AuthBaseModel {
  public static tableName = 'emailBounces';
  public static idColumn = ['email', 'createdAt'];

  // table fields
  email!: string;
  bounceType!: number;
  bounceSubType!: number;
  createdAt!: number;

  static async findByEmail(email: string) {
    const rows = await EmailBounce.callProcedure(Proc.EmailBounces, email);
    return rows.map((row: any) => EmailBounce.fromDatabaseJson(rows));
  }
}
