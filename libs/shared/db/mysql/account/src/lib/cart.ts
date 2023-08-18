/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';
import { CartState, TaxAddress } from './types';
import { generateFxAUuid, uuidTransformer } from '../../../core/src';

export class Cart extends BaseModel {
  static tableName = 'carts';

  protected $uuidFields = ['id', 'uid'];

  // table fields
  readonly id!: string;
  uid?: string;
  state!: CartState;
  errorReasonId?: string;
  offeringConfigId!: string;
  interval!: string;
  experiment?: string;
  taxAddress?: TaxAddress;
  readonly createdAt!: number;
  readonly updatedAt!: number;
  couponCode?: string;
  stripeCustomerId?: string;
  email?: string;
  amount!: number;
  readonly version!: number;

  static relationMappings = {};

  static async create(items: Partial<Cart>) {
    const currentDate = Date.now();
    return Cart.query().insert({
      ...items,
      id: generateFxAUuid(),
      createdAt: currentDate,
      updatedAt: currentDate,
      version: 0,
    });
  }

  static async findById(id: string) {
    return Cart.query()
      .where('id', uuidTransformer.to(id))
      .first()
      .throwIfNotFound();
  }

  async delete() {
    return Cart.query()
      .delete()
      .where('id', uuidTransformer.to(this.id))
      .where('version', this.version)
      .throwIfNotFound();
  }

  setCart(cartItems: Partial<Cart>) {
    this.$set(cartItems);
  }

  async update() {
    const currentVersion = this.version;
    this.$set({
      updatedAt: Date.now(),
      version: currentVersion + 1,
    });
    return Cart.query()
      .update(this)
      .where('id', uuidTransformer.to(this.id))
      .where('version', currentVersion);
  }
}
