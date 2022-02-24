/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionTokens {
  @Field({ nullable: true })
  public tokenId!: string;

  @Field({ nullable: true })
  public tokenData!: string;

  @Field({ nullable: true })
  public uid!: string;

  @Field({ nullable: true })
  public createdAt!: number;

  @Field({ nullable: true })
  public uaBrowser!: string;

  @Field({ nullable: true })
  public uaBrowserVersion!: string;

  @Field({ nullable: true })
  public uaOS!: string;

  @Field({ nullable: true })
  public uaOSVersion!: string;

  @Field({ nullable: true })
  public uaDeviceType!: string;

  @Field({ nullable: true })
  public lastAccessTime!: number;
}
