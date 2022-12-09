/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AccountStatusInput {
  @Field({ description: 'The uid to apply this operation to.', nullable: true })
  public uid?: string;

  @Field({
    description: 'The token id to apply this operation to.',
    nullable: true,
  })
  public token?: string;
}
