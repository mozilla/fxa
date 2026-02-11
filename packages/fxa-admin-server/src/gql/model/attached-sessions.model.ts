/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttachedSession {
  @Field((type) => ID)
  public id!: string;

  @Field()
  createdAt!: number;

  @Field()
  lastAccessTime!: number;

  @Field()
  location!: Location;

  @Field()
  uaBrowser!: string;

  @Field()
  uaOS!: string;

  @Field()
  uaBrowserVersion!: string;

  @Field()
  uaOSVersion!: string;

  @Field()
  uaFormFactor!: string;
}
