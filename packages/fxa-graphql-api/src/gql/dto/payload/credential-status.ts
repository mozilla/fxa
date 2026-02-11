/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CredentialStatusPayload {
  @Field({
    description:
      'Indicates the credentials need to be upgraded to a later version. Note, this could also signal that the current version is fine, but the upgrade needs to be run again for some reason.',
  })
  public upgradeNeeded!: boolean;

  @Field({
    description: 'The current version of the credentials.',
    nullable: true,
  })
  public currentVersion?: string;

  @Field({
    description:
      'The current salt value used by the client. This was added in v2.',
    nullable: true,
  })
  public clientSalt?: string;
}
