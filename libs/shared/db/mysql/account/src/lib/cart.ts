/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';
import { Account } from './account';
import { CartState, TaxAddress } from './types';

export class Cart extends BaseModel {
  static tableName = 'carts';

  protected $uuidFields = ['id', 'uid'];

  // table fields
  id!: string;
  uid?: string;
  state!: CartState;
  errorReasonId?: string;
  offeringConfigId!: string;
  interval!: string;
  experiment?: string;
  taxAddress?: TaxAddress;
  createdAt!: number;
  updatedAt!: number;
  couponCode?: string;
  stripeCustomerId?: string;
  email?: string;
  amount!: number;

  static relationMappings = {
    account: {
      join: {
        from: 'carts.uid',
        to: 'accounts.uid',
      },
      modelClass: Account,
      relation: BaseModel.BelongsToOneRelation,
    },
  };
}
