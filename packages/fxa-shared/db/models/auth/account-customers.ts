/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

export class AccountCustomers extends BaseAuthModel {
  public static tableName = 'accountCustomers';
  public static idColumn = 'uid';

  protected $uuidFields = ['uid'];

  public uid!: string;
  public stripeCustomerId?: string;

  public createdAt!: number;
  public updatedAt!: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['uid'],
      properties: {
        uid: {
          type: 'string',
          pattern: '^(?:[a-fA-F0-9]{2})+$',
        },
        stripeCustomerId: {
          type: 'string',
          pattern: '^cus_[A-Za-z0-9]+$',
        },
      },
    };
  }

  $beforeInsert() {
    this.createdAt = this.updatedAt = Date.now();
  }

  $beforeUpdate() {
    this.updatedAt = Date.now();
  }
}
