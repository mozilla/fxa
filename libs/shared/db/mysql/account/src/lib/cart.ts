/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';
import { Account } from './account';
import { CartState, TaxAddress } from './types';
import { generateFxAUuid, uuidTransformer } from '../../../core/src';

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

  static async create(items: Partial<Cart>) {
    const currentDate = Date.now();
    return Cart.query().insert({
      ...items,
      id: generateFxAUuid(),
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  }

  static async findById(id: string) {
    return Cart.query()
      .where('id', uuidTransformer.to(id))
      .first()
      .throwIfNotFound();
  }

  static async patchById(id: string, items: Partial<Cart>) {
    const cart = await this.findById(id);
    // Patch and fetch instance
    // Use update if you update the whole row with all its columns. Otherwise, using the patch method is recommended.
    // https://vincit.github.io/objection.js/api/query-builder/mutate-methods.html#update
    await cart.$query().patchAndFetch({
      ...items,
      updatedAt: Date.now(),
    });

    // Patch changes to the DB
    await Cart.query().patch(cart).where('id', id);

    return cart;
  }
}
