/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class BlockStatus {
  @Field(() => Float)
  public retryAfter!: number;

  @Field()
  public reason!: string;

  @Field()
  public action!: string;

  @Field()
  public blockingOn!: string;

  @Field(() => Float)
  public startTime!: number;

  @Field(() => Int)
  public duration!: number;

  @Field(() => Int)
  public attempt!: number;

  @Field()
  public policy!: string;
}
