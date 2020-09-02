/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from 'type-graphql';

import { Location } from './location';

@ObjectType()
export class AttachedClient {
  @Field({ nullable: true })
  public clientId!: string;

  @Field({ nullable: true })
  public sessionTokenId!: string;

  @Field({ nullable: true })
  public refreshTokenId!: string;

  @Field({ nullable: true })
  public deviceId!: string;

  @Field({ nullable: true })
  public deviceType!: string;

  @Field()
  public isCurrentSession!: boolean;

  @Field({ nullable: true })
  public name!: string;

  @Field({ nullable: true })
  public createdTime!: number;

  @Field({ nullable: true })
  public createdTimeFormatted!: string;

  @Field({ nullable: true })
  public lastAccessTime!: number;

  @Field({ nullable: true })
  public lastAccessTimeFormatted!: string;

  @Field({ nullable: true })
  public approximateLastAccessTime!: number;

  @Field({ nullable: true })
  public approximateLastAccessTimeFormatted!: string;

  @Field((type) => [String], { nullable: true })
  public scope!: string[];

  @Field({ nullable: true })
  public location!: Location;

  @Field()
  public userAgent!: string;

  @Field({ nullable: true })
  public os!: string;
}
