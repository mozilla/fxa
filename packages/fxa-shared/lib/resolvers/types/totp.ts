/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Two-factor authentication configuration (TOTP).' })
export class Totp {
  @Field({ description: 'Whether a TOTP token exists for the user.' })
  public exists!: boolean;

  @Field({
    description:
      'Whether the current session was verified with the TOTP token.',
  })
  public verified!: boolean;
}
