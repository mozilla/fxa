/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccountEvent {
  @Field({ nullable: true })
  public name!: string;

  @Field({ nullable: true })
  public createdAt!: number;

  @Field({ nullable: true })
  eventType!: string;

  // Email event based properties
  @Field({ nullable: true })
  template!: string;

  // Metrics properties
  @Field({ nullable: true })
  flowId!: string;

  @Field({ nullable: true })
  service!: string;
}
