/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetupCartInput {
  @Field()
  public offeringConfigId!: string;

  @Field({ nullable: true })
  public interval?: string;

  @Field({
    nullable: true,
    description: 'Cart ID',
  })
  public id?: string;

  @Field({
    nullable: true,
    description: 'FxA UID',
  })
  public uid?: string;
}
