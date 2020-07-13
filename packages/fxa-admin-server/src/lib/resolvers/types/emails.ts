/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Email {
  @Field()
  public email!: string;

  @Field()
  public isVerified!: boolean;

  @Field()
  public isPrimary!: boolean;

  @Field()
  public createdAt!: number;
}
