/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TaxAddress {
  @IsString()
  countryCode!: string;

  @IsString()
  postalCode!: string;
}

export class GetTaxAddressResult {
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxAddress)
  taxAddress?: TaxAddress;
}
