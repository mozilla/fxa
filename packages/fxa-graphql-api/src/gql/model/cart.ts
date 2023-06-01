import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Example cart' })
export class Cart {
  @Field()
  public id!: number;

  @Field({ nullable: true })
  public promotionCode?: string;
}
