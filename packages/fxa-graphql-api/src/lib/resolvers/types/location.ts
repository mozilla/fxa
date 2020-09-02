/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Location {
  @Field({ nullable: true })
  public city!: string;

  @Field({ nullable: true })
  public country!: string;

  @Field({ nullable: true })
  public state!: string;

  @Field({ nullable: true })
  public stateCode!: string;
}
