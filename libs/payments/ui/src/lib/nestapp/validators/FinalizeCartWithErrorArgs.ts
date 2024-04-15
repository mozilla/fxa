/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';

export class FinalizeCartWithErrorArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @ValidateNested()
  errorReasonId!: CartErrorReasonId;
}
