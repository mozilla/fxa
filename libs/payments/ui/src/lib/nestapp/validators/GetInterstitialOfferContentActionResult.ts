/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsString,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PageContent {
  @IsString()
  currentInterval!: string;

  @IsString()
  modalHeading1!: string;

  @IsArray()
  @IsString({ each: true })
  modalMessage!: string[];

  @IsString()
  upgradeButtonLabel!: string;

  @IsString()
  upgradeButtonUrl!: string;

  @IsString()
  webIcon!: string;

  @IsString()
  productName!: string;

  @IsString()
  supportUrl!: string;
}

export class CancelFlowResult {
  @IsString()
  @IsIn(['not_found', 'cancel'])
  flowType!: 'not_found' | 'cancel';

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsBoolean()
  active!: boolean;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsBoolean()
  cancelAtPeriodEnd!: boolean;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsNumber()
  currentPeriodEnd!: number;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  productName!: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  supportUrl!: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  webIcon!: string;
}

export class GetInterstitialOfferContentActionResult {
  @IsBoolean()
  isEligible!: boolean;

  @IsString()
  reason!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageContent)
  pageContent!: PageContent | null;

  @ValidateNested()
  @Type(() => CancelFlowResult)
  cancelContent!: CancelFlowResult;
}
