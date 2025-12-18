/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString, IsOptional } from 'class-validator';
import { SubplatInterval } from '@fxa/payments/customer';

export class DetermineCancellationInterventionActionArgs {
  @IsString()
  uid!: string;

  @IsString()
  subscriptionId!: string;

  @IsString()
  offeringApiIdentifier!: string;

  @IsString()
  currentInterval!: SubplatInterval;

  @IsString()
  upgradeInterval!: SubplatInterval;

  @IsString()
  @IsOptional()
  acceptLanguage?: string;

  @IsString()
  @IsOptional()
  selectedLanguage?: string;
}
