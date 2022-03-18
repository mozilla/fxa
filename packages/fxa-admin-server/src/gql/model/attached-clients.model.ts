/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

import { Location } from './location.model';

@ObjectType()
export class AttachedClient {
  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  deviceId?: string;

  @Field({ nullable: true })
  sessionTokenId?: string;

  @Field({ nullable: true })
  refreshTokenId?: string;

  @Field({ nullable: true })
  isCurrentSession!: boolean;

  @Field({ nullable: true })
  deviceType?: string;

  @Field({ nullable: true })
  name?: string;

  @Field((type) => [String], { nullable: true })
  scope?: string[];

  @Field({ nullable: true })
  location!: Location;

  @Field({ nullable: true })
  userAgent!: string;

  @Field({ nullable: true })
  os?: string;

  @Field({ nullable: true })
  createdTime?: number;

  @Field({ nullable: true })
  createdTimeFormatted?: string;

  @Field({ nullable: true })
  lastAccessTime?: number;

  @Field({ nullable: true })
  lastAccessTimeFormatted?: string;

  @Field({ nullable: true })
  approximateLastAccessTime?: number;

  @Field({ nullable: true })
  approximateLastAccessTimeFormatted?: string;
}
