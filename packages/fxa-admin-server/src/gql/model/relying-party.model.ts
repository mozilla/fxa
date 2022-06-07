/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RelyingParty {
  @Field((type) => ID)
  id!: string;

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
  createdAt!: number;

  @Field()
  trusted!: boolean;

  @Field({ nullable: true })
  allowedScopes!: string;
}
