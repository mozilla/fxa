/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RequestArgs } from './common/RequestArgs';

export class SubmitNeedsInputActionArgs {
  @IsString()
  cartId!: string;

  @Type(() => RequestArgs)
  @ValidateNested()
  requestArgs!: RequestArgs;
}
