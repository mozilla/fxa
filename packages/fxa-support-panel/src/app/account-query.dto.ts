/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { IsHexadecimal, IsInt, IsOptional, Length } from 'class-validator';

export class AccountQuery {
  @IsOptional()
  @IsInt()
  requestTicket?: number;

  @IsHexadecimal()
  @Length(32, 32)
  uid!: string;
}
