/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PasswordChangeFinishPayload {
  @Field({ nullable: true })
  uid?: string;

  @Field({ nullable: true })
  sessionToken?: string;

  @Field({ nullable: true })
  verified?: boolean;

  @Field({ nullable: true })
  authAt?: number;

  @Field({ nullable: true })
  keyFetchToken?: String;

  @Field({ nullable: true })
  keyFetchToken2?: String;
}
