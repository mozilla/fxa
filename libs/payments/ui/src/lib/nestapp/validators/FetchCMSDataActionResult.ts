/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PageContentCommonContentResult {
  @IsString()
  privacyNoticeUrl!: string;

  @IsString()
  privacyNoticeDownloadUrl!: string;

  @IsString()
  termsOfServiceUrl!: string;

  @IsString()
  termsOfServiceDownloadUrl!: string;

  @IsOptional()
  @IsString()
  cancellationUrl!: string | null;

  @IsOptional()
  @IsString()
  emailIcon!: string | null;

  @IsString()
  successActionButtonUrl!: string;

  @IsString()
  successActionButtonLabel!: string;

  @IsOptional()
  @IsString()
  newsletterLabelTextCode!: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  newsletterSlug!: string[] | null;
}

class PageContentPurchaseDetailsTransformed {
  @IsArray()
  @IsString({ each: true })
  details!: string[];

  @IsString()
  productName!: string;

  @IsOptional()
  @IsString()
  subtitle!: string | null;

  @IsString()
  webIcon!: string;
}

class PageContentOfferingDefaultPurchaseTransformed {
  @ValidateNested()
  @Type(() => PageContentPurchaseDetailsTransformed)
  purchaseDetails!: PageContentPurchaseDetailsTransformed & {
    localizations: PageContentPurchaseDetailsTransformed[];
  };
}

class PageContentOfferingTransformed {
  @IsString()
  apiIdentifier!: string;

  @IsArray()
  @IsString({ each: true })
  countries!: string[];

  @IsString()
  stripeProductId!: string;

  @ValidateNested()
  @Type(() => PageContentOfferingDefaultPurchaseTransformed)
  defaultPurchase!: PageContentOfferingDefaultPurchaseTransformed;

  @ValidateNested()
  @Type(() => PageContentCommonContentResult)
  commonContent!: PageContentCommonContentResult & {
    localizations: PageContentCommonContentResult[];
  };
}

export class FetchCMSDataActionResult {
  @ValidateNested({ each: true })
  @Type(() => PageContentOfferingTransformed)
  offerings!: PageContentOfferingTransformed[];
}
