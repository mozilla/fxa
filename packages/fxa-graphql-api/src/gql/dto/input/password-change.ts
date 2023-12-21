/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PasswordChangeInputOptions {
  @Field({ nullable: true })
  public keys?: boolean;

  @Field((type) => String,{ nullable: true })
  public sessionToken?: hexstring;
}

@InputType()
export class PasswordChangeInput {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public email!: string;

  @Field()
  public oldPasswordAuthPW!: string;

  @Field()
  public newPasswordAuthPW!: string;

  @Field()
  public oldUnwrapBKey!: string;

  @Field()
  public newUnwrapBKey!: string;

  @Field()
  public clientSalt!: string;

  @Field({ nullable: true })
  public options?: PasswordChangeInputOptions;
}
