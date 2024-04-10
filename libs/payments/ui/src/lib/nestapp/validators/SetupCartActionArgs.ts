/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class SetupCartActionArgs {
  @IsString()
  interval!: string;

  @IsString()
  offeringConfigId!: string;

  @IsString()
  @Optional()
  experiment?: string;

  @IsString()
  @Optional()
  promoCode?: string;

  @IsString()
  @Optional()
  uid?: string;

  @IsString()
  @Optional()
  ip?: string;
}
