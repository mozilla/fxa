/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class RelyingPartyUpdateDto {
  @Field()
  name!: string;

  @Field()
  imageUri!: string;

  @Field()
  redirectUri!: string;

  @Field()
  canGrant!: boolean;

  @Field()
  publicClient!: boolean;

  @Field()
  trusted!: boolean;

  @Field()
  allowedScopes!: string;

  @Field()
  notes!: string;
}

@ObjectType()
export class RelyingPartyDto {
  @Field((type) => ID)
  id!: string;

  @Field()
  createdAt!: Date;

  @Field()
  name!: string;

  @Field()
  imageUri!: string;

  @Field()
  redirectUri!: string;

  @Field()
  canGrant!: boolean;

  @Field()
  publicClient!: boolean;

  @Field()
  trusted!: boolean;

  @Field()
  allowedScopes!: string;

  @Field()
  notes!: string;

  @Field()
  hasSecret!: boolean;

  @Field()
  hasPreviousSecret!: boolean;
}

@ObjectType()
export class RelyingPartyCreatedDto {
  @Field()
  id!: string;

  @Field()
  secret!: string;
}

@ObjectType()
export class RotateSecretDto {
  @Field()
  secret!: string;
}
