/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationStatus } from '@fxa/payments/eligibility';

class LocationInformation {
  @IsEnum(LocationStatus)
  status!: string;

  @IsString()
  message!: string;
}
export class GetProductAvailabilityForLocationActionResult {
  @ValidateNested()
  @Type(() => LocationInformation)
  locationInformation!: LocationInformation;
}
