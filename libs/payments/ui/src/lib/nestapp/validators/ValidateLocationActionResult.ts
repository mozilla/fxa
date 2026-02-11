/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TaxChangeAllowedStatus } from 'libs/payments/cart/src/lib/tax.types';
import { LocationStatus } from '@fxa/payments/eligibility';

const CombinedLocationAndTaxChangeAllowedStatus = {
  ...LocationStatus,
  ...TaxChangeAllowedStatus,
};

export class ValidateLocationActionResult {
  @IsBoolean()
  isValid!: boolean;

  @IsEnum(CombinedLocationAndTaxChangeAllowedStatus)
  status!: LocationStatus | TaxChangeAllowedStatus;

  @IsOptional()
  @IsString()
  currentCurrency!: string;
}
