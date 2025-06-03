/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaxAddress } from './common/TaxAddress';

// Additional nesting is required to support undefined results;
class TaxAddressResult {
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxAddress)
  result?: TaxAddress;
}

export class GetTaxAddressResult {
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxAddressResult)
  taxAddress?: TaxAddressResult
}
