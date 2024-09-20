/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SubplatInterval } from '@fxa/payments/stripe';
import { IsOptional, IsString } from 'class-validator';

export class SetupCartActionArgs {
  @IsString()
  interval!: SubplatInterval;

  @IsString()
  offeringConfigId!: string;

  @IsString()
  @IsOptional()
  experiment?: string;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsString()
  @IsOptional()
  uid?: string;

  @IsString()
  @IsOptional()
  ip?: string;
}
