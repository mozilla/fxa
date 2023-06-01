import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Example CMS' })
export class Cart {
  @Field()
  public offering!: string;

  @Field({ nullable: true })
  public details?: string[];
}
