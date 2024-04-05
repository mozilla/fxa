import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsDefined } from 'class-validator';

class LocationOverride {
  @IsString()
  public readonly countryCode?: string;

  @IsString()
  public readonly postalCode?: string;
}

export class GeodbConfig {
  @IsString()
  public readonly dbPath!: string;
}

export class GeodbManagerConfig {
  @Type(() => LocationOverride)
  @ValidateNested()
  @IsDefined()
  public readonly locationOverride!: Partial<LocationOverride>;
}
