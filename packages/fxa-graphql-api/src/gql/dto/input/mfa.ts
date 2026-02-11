/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MfaTestInput {
  @Field({
    description: 'A jwt tor provide access to auth server endpoints.',
    nullable: true,
  })
  public jwt!: string;
}
