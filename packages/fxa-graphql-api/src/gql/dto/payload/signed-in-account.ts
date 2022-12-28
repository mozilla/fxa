/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType, OmitType } from '@nestjs/graphql';

@ObjectType()
export class SignedInAccountPayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field()
  public uid!: string;

  @Field()
  public sessionToken!: string;

  @Field()
  verified!: boolean;

  @Field()
  authAt!: number;

  @Field()
  metricsEnabled!: boolean;

  @Field(() => String, { nullable: true })
  keyFetchToken?: hexstring;

  @Field({ nullable: true })
  verificationMethod?: string;

  @Field({ nullable: true })
  verificationReason?: string;
}

@ObjectType()
export class SessionReauthedAccountPayload extends OmitType(
  SignedInAccountPayload,
  ['sessionToken']
) {}
