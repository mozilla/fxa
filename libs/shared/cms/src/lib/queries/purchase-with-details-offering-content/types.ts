/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface PurchaseDetailsResult {
  details: string;
  productName: string;
  subtitle: string | null;
  webIcon: string;
}

export interface PurchaseDetailsTransformed
  extends Omit<PurchaseDetailsResult, 'details'> {
  details: string[];
}

export interface OfferingCommonContentResult {
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

export interface PurchaseOfferingResult {
  stripeProductId: string;
  stripeLegacyPlans: {
    stripeLegacyPlan: string;
  }[];
  commonContent: OfferingCommonContentResult & {
    localizations: OfferingCommonContentResult[];
  };
}

export interface PurchaseWithDetailsOfferingContentResult {
  stripePlanChoices: {
    stripePlanChoice: string;
  }[];
  purchaseDetails: PurchaseDetailsResult & {
    localizations: PurchaseDetailsResult[];
  };
  offering: PurchaseOfferingResult;
}

export interface PurchaseWithDetailsOfferingContentTransformed
  extends Omit<PurchaseWithDetailsOfferingContentResult, 'purchaseDetails'> {
  purchaseDetails: PurchaseDetailsTransformed & {
    localizations: PurchaseDetailsTransformed[];
  };
}

export interface PurchaseWithDetailsOfferingContentByPlanIdsResult {
  purchases: PurchaseWithDetailsOfferingContentResult[];
}
