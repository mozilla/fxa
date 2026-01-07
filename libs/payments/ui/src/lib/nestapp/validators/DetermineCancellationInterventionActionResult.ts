/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CmsChurnInterventionEntryResult {
  @IsString()
  webIcon!: string;

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

export class CmsPurchaseDetailsLocalizationObject {
  @IsString()
  webIcon!: string;

  @IsString()
  productName!: string;
}

export class CmsPurchaseDetailsDataObject {
  @IsString()
  webIcon!: string;

  @IsString()
  productName!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsPurchaseDetailsLocalizationObject)
  localizations!: CmsPurchaseDetailsLocalizationObject[]
}

export class CmsDefaultPurchaseDataObject {
  @ValidateNested()
  @Type(() => CmsPurchaseDetailsDataObject)
  purchaseDetails!: CmsPurchaseDetailsDataObject;
}

export class CancelInterstitialOfferOfferingObject {
  @IsString()
  stripeProductId!: string;

  @ValidateNested()
  @Type(() => CmsDefaultPurchaseDataObject)
  defaultPurchase!: CmsDefaultPurchaseDataObject;
}

export class CmsCancelInterstitialOfferPartialResult {
  @IsString()
  @IsOptional()
  offeringApiIdentifier?: string;

  @IsString()
  @IsOptional()
  currentInterval?: string;

  @IsString()
  @IsOptional()
  upgradeInterval?: string;

  @IsNumber()
  @IsOptional()
  advertisedSavings?: number;

  @IsString()
  @IsOptional()
  ctaMessage?: string;

  @IsString()
  @IsOptional()
  modalHeading1?: string;

  @IsString()
  @IsOptional()
  modalHeading2?: string;

  @IsString()
  @IsOptional()
  modalMessage?: string;

  @IsString()
  @IsOptional()
  productPageUrl?: string;

  @IsString()
  @IsOptional()
  upgradeButtonLabel?: string;

  @IsString()
  @IsOptional()
  upgradeButtonUrl?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CancelInterstitialOfferOfferingObject)
  offering?: CancelInterstitialOfferOfferingObject;
}

export class CmsCancelInterstitialOfferResult {
  @IsString()
  offeringApiIdentifier!: string;

  @IsString()
  currentInterval!: string;

  @IsString()
  upgradeInterval!: string;

  @IsNumber()
  advertisedSavings!: number;

  @IsString()
  ctaMessage!: string;

  @IsString()
  modalHeading1!: string;

  @IsString()
  modalHeading2!: string;

  @IsString()
  modalMessage!: string;

  @IsString()
  productPageUrl!: string;

  @IsString()
  upgradeButtonLabel!: string;

  @IsString()
  upgradeButtonUrl!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsCancelInterstitialOfferPartialResult)
  localizations!: CmsCancelInterstitialOfferPartialResult[];

  @ValidateNested()
  @Type(() => CancelInterstitialOfferOfferingObject)
  offering!: CancelInterstitialOfferOfferingObject;
}

export class DetermineCancellationInterventionActionResult {
  @IsString()
  cancelChurnInterventionType!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  cmsOfferContent!: CmsChurnInterventionEntryResult | CmsCancelInterstitialOfferResult | null;
}
