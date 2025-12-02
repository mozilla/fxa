/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsString,
  IsOptional,
  IsIn,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { SubplatInterval } from '@fxa/payments/customer';

export class GetCMSChurnInterventionActionArgs {
  @IsEnum(SubplatInterval)
  interval!: string;

  @IsString()
  @IsIn(['cancel', 'stay_subscribed'])
  churnType!: string;

  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @ValidateIf(
    (args: GetCMSChurnInterventionActionArgs) => !args.stripeProductId,
    {
      message:
        'Either stripeProductId or offeringApiIdentifier must be provided',
    }
  )
  @IsString()
  @IsNotEmpty()
  offeringApiIdentifier?: string;

  @IsString()
  @IsOptional()
  acceptLanguage?: string;

  @IsString()
  @IsOptional()
  selectedLanguage?: string;
}
