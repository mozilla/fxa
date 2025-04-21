import { IsString } from 'class-validator';

export class TaxAddress {
  @IsString()
  countryCode!: string;

  @IsString()
  postalCode!: string;
}
