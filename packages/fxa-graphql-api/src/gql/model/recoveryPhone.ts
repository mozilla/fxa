/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RecoveryPhone {
  @Field({
    nullable: false,
    description: 'Whether recovery phone number exists',
  })
  public exists!: boolean;

  @Field({
    nullable: true,
    description:
      'The registered recovery phone number. If the user does not have a verified session, this field will return the last 4 digits of the phone number with a mask on the rest.',
  })
  public phoneNumber!: string;

  @Field({
    nullable: true,
    description:
      'Returns true if the user is eligible to set up a recovery phone.',
  })
  public available!: boolean;
}
