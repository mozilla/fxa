/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Two-factor authentication backup codes.' })
export class BackupCodes {
  @Field({ description: 'Whether backup codes exists for the user.' })
  public hasBackupCodes?: boolean;

  @Field({
    description: 'The number of remaining backup codes the user has available.',
  })
  public count?: number;
}
