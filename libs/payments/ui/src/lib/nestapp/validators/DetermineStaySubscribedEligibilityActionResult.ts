/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CmsChurnInterventionEntryResult {
  @IsString()
  webIcon!: string;

  @IsString()
  apiIdentifier!: string;

  @IsString()
  churnInterventionId!: string;

  @IsString()
  churnType!: string;

  @IsOptional()
  @IsNumber()
  redemptionLimit?: number | null;

  @IsString()
  stripeCouponId!: string;

  @IsString()
  interval!: string;

  @IsNumber()
  discountAmount!: number;

  @IsString()
  ctaMessage!: string;

  @IsString()
  modalHeading!: string;

  @IsArray()
  @IsString({ each: true })
  modalMessage!: string[];

  @IsString()
  productPageUrl!: string;

  @IsString()
  termsHeading!: string;

  @IsArray()
  @IsString({ each: true })
  termsDetails!: string[];

  @IsString()
  supportUrl!: string;
}

export class CmsOfferingContent {
  @IsString()
  productName!: string;

  @IsString()
  successActionButtonUrl!: string;

  @IsString()
  supportUrl!: string;

  @IsString()
  webIcon!: string;
}

export class StaySubscribedFlowResult {
  @IsString()
  @IsIn(['not_found', 'stay_subscribed'])
  flowType!: 'not_found' | 'stay_subscribed';

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsBoolean()
  active!: boolean;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsBoolean()
  cancelAtPeriodEnd!: boolean;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  currency!: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsNumber()
  currentPeriodEnd!: number;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsOptional()
  @IsString()
  defaultPaymentMethodType?: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsOptional()
  @IsString()
  last4?: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsOptional()
  @IsNumber()
  nextInvoiceTax?: number;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsOptional()
  @IsNumber()
  nextInvoiceTotal?: number;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  productName!: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  webIcon!: string;
}

export class DetermineStaySubscribedEligibilityActionResult {
  @IsBoolean()
  isEligible!: boolean;

  @IsString()
  reason!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CmsChurnInterventionEntryResult)
  cmsChurnInterventionEntry!: CmsChurnInterventionEntryResult | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CmsOfferingContent)
  cmsOfferingContent!: CmsOfferingContent | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaySubscribedFlowResult)
  staySubscribedContent!: StaySubscribedFlowResult | null;
}
