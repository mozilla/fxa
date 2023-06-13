/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */

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
