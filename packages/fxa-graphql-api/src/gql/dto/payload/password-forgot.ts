/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PasswordForgotSendCodePayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public passwordForgotToken!: string;
}

@ObjectType()
export class PasswordForgotVerifyCodePayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public accountResetToken!: string;
}

@ObjectType()
export class PasswordForgotCodeStatusPayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public tries!: number;

  @Field()
  public ttl!: number;
}

@ObjectType()
export class AccountResetPayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field({ nullable: true })
  public uid?: string;

  @Field({ nullable: true })
  public sessionToken?: string;

  @Field({ nullable: true })
  public verified?: boolean;

  @Field({ nullable: true })
  public authAt?: number;

  @Field({ nullable: true })
  public keyFetchToken?: string;

  @Field({ nullable: true })
  public unwrapBKey?: string;
}
