/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SubplatInterval } from '@fxa/payments/customer';

export class PageContent {
  @IsString()
  currentInterval!: SubplatInterval;

  @IsNumber()
  advertisedSavings!: number;

  @IsString()
  ctaMessage!: string;

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

  @Type(() => PageContent)
  pageContent!: PageContent | null;
}
