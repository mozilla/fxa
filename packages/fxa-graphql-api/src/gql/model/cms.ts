/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Example CMS' })
export class Cms {
  @Field()
  public offering!: string;

  @Field((type) => [String])
  public details!: string[];

  @Field()
  public productName!: string;

  @Field()
  public termsOfService!: string;

  @Field()
  public termsOfServiceDownload!: string;

  @Field()
  public privacyNotice!: string;
}
