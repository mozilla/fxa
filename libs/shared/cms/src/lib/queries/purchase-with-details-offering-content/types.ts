/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiEntity } from '../../types';

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
  commonContent: {
    data: StrapiEntity<
      OfferingCommonContentResult & {
        localizations: {
          data: StrapiEntity<OfferingCommonContentResult>[];
        };
      }
    >;
  };
}

export interface PurchaseWithDetailsOfferingContentResult {
  stripePlanChoices: {
    stripePlanChoice: string;
  }[];
  purchaseDetails: {
    data: StrapiEntity<
      PurchaseDetailsResult & {
        localizations: {
          data: StrapiEntity<PurchaseDetailsResult>[];
        };
      }
    >;
  };
  offering: {
    data: StrapiEntity<PurchaseOfferingResult>;
  };
}

export interface PurchaseWithDetailsOfferingContentTransformed
  extends Omit<PurchaseWithDetailsOfferingContentResult, 'purchaseDetails'> {
  purchaseDetails: {
    data: StrapiEntity<
      PurchaseDetailsTransformed & {
        localizations: {
          data: StrapiEntity<PurchaseDetailsTransformed>[];
        };
      }
    >;
  };
}

export interface PurchaseWithDetailsOfferingContentByPlanIdsResult {
  purchases: {
    data: StrapiEntity<PurchaseWithDetailsOfferingContentResult>[];
  };
}
