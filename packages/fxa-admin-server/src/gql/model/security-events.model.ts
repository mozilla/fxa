/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SecurityEvents {
  @Field({ nullable: true })
  public uid!: string;

  @Field({ nullable: true })
  public nameId!: number;

  @Field({ nullable: true })
  public verified!: boolean;

  @Field({ nullable: true })
  public ipAddrHmac!: string;

  @Field({ nullable: true })
  public createdAt!: number;

  @Field({ nullable: true })
  public tokenVerificationId!: string;

  @Field({ nullable: true })
  public name!: string;

  @Field({ nullable: true })
  public ipAddr!: string;

  @Field(() => String, {
    nullable: true,
    description: 'JSON data for additional info about the security event',
  })
  additionalInfo?: string;
}
