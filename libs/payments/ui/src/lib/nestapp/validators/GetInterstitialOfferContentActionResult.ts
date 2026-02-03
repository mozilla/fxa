/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
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
}

export class GetInterstitialOfferContentActionResult {
  @IsBoolean()
  isEligible!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageContent)
  pageContent!: PageContent | null;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  webIcon?: string | null;

  @IsOptional()
  @IsString()
  productName?: string | null;
}
