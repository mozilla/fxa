/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TemplateResult } from './TemplateResult';

class UpdateStripePaymentDetailsSuccessResponse {
  @IsString()
  id!: string;

  @IsString()
  status!: string;

  @IsString()
  @IsOptional()
  clientSecret?: string;
}

export class UpdateStripePaymentDetailsResult extends TemplateResult {
  @ValidateNested()
  @Type(() => UpdateStripePaymentDetailsSuccessResponse)
  @IsOptional()
  result!: UpdateStripePaymentDetailsSuccessResponse | null;
}
