/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsDefined } from 'class-validator';

class LocationOverride {
  @IsString()
  public readonly countryCode?: string;

  @IsString()
  public readonly postalCode?: string;
}

export class GeoDBConfig {
  @IsString()
  public readonly dbPath!: string;
}

export class GeoDBManagerConfig {
  @Type(() => LocationOverride)
  @ValidateNested()
  @IsDefined()
  public readonly locationOverride!: Partial<LocationOverride>;
}
