/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface PageContentCommonContentResult {
  privacyNoticeUrl: string;
  privacyNoticeDownloadUrl: string;
  termsOfServiceUrl: string;
  termsOfServiceDownloadUrl: string;
  cancellationUrl: string | null;
  emailIcon: string | null;
  successActionButtonUrl: string;
  successActionButtonLabel: string;
  newsletterLabelTextCode: string | null;
  newsletterSlug: string[] | null;
}

export interface PageContentPurchaseDetailsResult {
  details: string;
  productName: string;
  subtitle: string | null;
  webIcon: string;
}

export interface PageContentPurchaseDetailsTransformed
  extends Omit<PageContentPurchaseDetailsResult, 'details'> {
  details: string[];
}

export interface PageContentOfferingDefaultPurchaseResult {
  purchaseDetails: PageContentPurchaseDetailsResult & {
    localizations: PageContentPurchaseDetailsResult[];
  };
}

export interface PageContentOfferingDefaultPurchaseTransformed {
  purchaseDetails: PageContentPurchaseDetailsTransformed & {
    localizations: PageContentPurchaseDetailsTransformed[];
  };
}

export interface PageContentOfferingTransformed
  extends Omit<PageContentOfferingResult, 'defaultPurchase'> {
  defaultPurchase: PageContentOfferingDefaultPurchaseTransformed;
}

export interface PageContentOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  defaultPurchase: PageContentOfferingDefaultPurchaseResult;
  commonContent: PageContentCommonContentResult & {
    localizations: PageContentCommonContentResult[];
  };
}

export interface PageContentForOfferingResult {
  offerings: PageContentOfferingResult[];
}
