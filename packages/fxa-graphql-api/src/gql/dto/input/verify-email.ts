/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyEmailInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ description: 'The email to verify' })
  public email!: string;

  @Field({ description: 'The code to check' })
  public code!: string;
}

@InputType()
export class VerifyEmailCodeInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ description: 'The code to check' })
  public code!: string;

  @Field({ description: 'Account uid' })
  public uid!: string;

  @Field({ nullable: true })
  public service?: string;
}
