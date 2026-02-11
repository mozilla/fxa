/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEnum, IsString } from 'class-validator';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';

export class FinalizeCartWithErrorArgs {
  @IsString()
  cartId!: string;

  @IsEnum(CartErrorReasonId)
  errorReasonId!: CartErrorReasonId;
}
