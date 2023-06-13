/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Example cart' })
export class Cart {
  @Field()
  public id!: number;

  @Field({ nullable: true })
  public promotionCode?: string;

  @Field({ nullable: true })
  public paymentProvider?: string;
}
