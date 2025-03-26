/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OfferingMultipleError, OfferingNotFoundError } from '../../cms.error';
import {
  PageContentForOfferingResult,
  PageContentOfferingTransformed,
  PageContentPurchaseDetailsResult,
  PageContentPurchaseDetailsTransformed,
} from './types';

export class PageContentForOfferingResultUtil {
  constructor(private rawResult: PageContentForOfferingResult) {}

  private transformPageContentPurchaseDetails(details: string): string[] {
    return details.split('\n').filter((detail) => !!detail);
  }

  getOffering(): PageContentOfferingTransformed {
    const offering = this.offerings.at(0);
    if (!offering) {
      throw new OfferingNotFoundError();
    }
    if (this.offerings.length > 1) {
      throw new OfferingMultipleError();
    }

    return {
      ...offering,
      defaultPurchase: {
        purchaseDetails: {
          ...this.purchaseDetailsTransform(
            offering.defaultPurchase.purchaseDetails
          ),
          localizations:
            offering.defaultPurchase.purchaseDetails.localizations.map(
              (localization) => this.purchaseDetailsTransform(localization)
            ),
        },
      },
    };
  }

  purchaseDetailsTransform(
    purchaseDetails: PageContentPurchaseDetailsResult
  ): PageContentPurchaseDetailsTransformed {
    return {
      ...purchaseDetails,
      details: this.transformPageContentPurchaseDetails(
        purchaseDetails.details
      ),
    };
  }

  get offerings(): PageContentForOfferingResult['offerings'] {
    return this.rawResult.offerings;
  }
}
