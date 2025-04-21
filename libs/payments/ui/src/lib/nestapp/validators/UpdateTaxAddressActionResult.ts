import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaxAddress } from './common/TaxAddress';

class SuccessResponse {
  @IsBoolean()
  ok!: true;

  @ValidateNested()
  @Type(() => TaxAddress)
  taxAddress!: TaxAddress;
}

class ErrorResponse {
  @IsBoolean()
  ok!: false;

  @IsString()
  error!: string;
}

export class UpdateTaxAddressActionResult {
  @ValidateNested()
  @Type(() => SuccessResponse || ErrorResponse)
  result!: SuccessResponse | ErrorResponse;
}
