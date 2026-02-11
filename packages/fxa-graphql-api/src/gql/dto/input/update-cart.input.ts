/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';
import { TaxAddressInput } from './tax-address.input';

@InputType()
export class UpdateCartInput {
  @Field({
    description: 'Cart ID',
  })
  public id!: string;

  @Field((type) => TaxAddressInput, { nullable: true })
  public taxAddress?: TaxAddressInput;

  @Field({ nullable: true })
  public couponCode?: string;

  @Field({ nullable: true })
  public email?: string;
}
