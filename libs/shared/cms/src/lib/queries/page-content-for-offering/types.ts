/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiEntity } from '../../types';

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
  purchaseDetails: {
    data: StrapiEntity<
      PageContentPurchaseDetailsResult & {
        localizations: {
          data: StrapiEntity<PageContentPurchaseDetailsResult>[];
        };
      }
    >;
  };
}

export interface PageContentOfferingDefaultPurchaseTransformed {
  purchaseDetails: {
    data: StrapiEntity<
      PageContentPurchaseDetailsTransformed & {
        localizations: {
          data: StrapiEntity<PageContentPurchaseDetailsTransformed>[];
        };
      }
    >;
  };
}

export interface PageContentOfferingTransformed
  extends Omit<PageContentOfferingResult, 'defaultPurchase'> {
  defaultPurchase: {
    data: StrapiEntity<PageContentOfferingDefaultPurchaseTransformed>;
  };
}

export interface PageContentOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  defaultPurchase: {
    data: StrapiEntity<PageContentOfferingDefaultPurchaseResult>;
  };
  commonContent: {
    data: StrapiEntity<
      PageContentCommonContentResult & {
        localizations: {
          data: StrapiEntity<PageContentCommonContentResult>[];
        };
      }
    >;
  };
}

export interface PageContentForOfferingResult {
  offerings: {
    meta: {
      pagination: {
        total: number;
      };
    };
    data: StrapiEntity<PageContentOfferingResult>[];
  };
}
