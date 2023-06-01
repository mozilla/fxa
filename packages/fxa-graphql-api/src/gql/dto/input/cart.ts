/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class SingleCartInput {
  @Field((type) => Int)
  public id!: number;
}

@InputType()
export class AddCartInput {
  @Field((type) => String)
  public promotionCode!: string;
}

@InputType()
export class UpdateCartInput {
  @Field((type) => Int)
  public id!: number;

  @Field((type) => String)
  public promotionCode!: string;
}

@InputType()
export class CheckPromotionCodeInput {
  @Field((type) => Int)
  public id!: number;

  @Field((type) => String)
  public promotionCode!: string;
}
