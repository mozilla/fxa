/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartState } from '@fxa/shared/db/mysql/account';
import {
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class GetDbCartActionResult {
  @IsEnum(CartState)
  state!: CartState;

  @IsBoolean()
  isFreeTrial!: boolean;
}
