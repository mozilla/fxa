/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PasswordChangeFinishInput {
  @Field()
  passwordChangeToken!: string;

  @Field()
  authPW!: string;

  @Field()
  wrapKb!: string;

  @Field({ nullable: true })
  authPWVersion2!: string;

  @Field({ nullable: true })
  wrapKbVersion2?: string;

  @Field({ nullable: true })
  clientSalt?: string;

  @Field({ nullable: true })
  sessionToken?: string;

  @Field({ nullable: true })
  keys?: string;
}
