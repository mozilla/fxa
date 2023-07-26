/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SingleCmsInput {
  @Field((type) => String)
  public offering!: string;
}
