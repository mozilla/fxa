/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class Account {
  @Field((type) => ID)
  public uid!: string;

  @Field()
  public createdAt!: number;
}
