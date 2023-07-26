/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignedUpAccountPayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field((_type) => String)
  public uid!: hexstring;

  @Field((_type) => String)
  public sessionToken!: hexstring;

  @Field((_type) => String, { nullable: true })
  keyFetchToken?: hexstring;

  @Field()
  authAt!: number;

  @Field({ nullable: true })
  verificationMethod?: string;
}
