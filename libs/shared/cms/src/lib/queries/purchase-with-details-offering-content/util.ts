/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  PurchaseDetailsResult,
  PurchaseDetailsTransformed,
  PurchaseWithDetailsOfferingContentByPlanIdsResult,
  PurchaseWithDetailsOfferingContentTransformed,
} from './types';

export class PurchaseWithDetailsOfferingContentUtil {
  private transformedPurchaseByPlanId: Record<
    string,
    PurchaseWithDetailsOfferingContentTransformed
  > = {};

  constructor(
    private rawResults: PurchaseWithDetailsOfferingContentByPlanIdsResult[]
  ) {
    for (const rawResult of rawResults) {
      for (const purchase of rawResult.purchaseCollection.items) {
        const transformedPurchaseDetails = this.purchaseDetailsTransform(
          purchase.purchaseDetails
        );
        purchase.stripePlanChoices?.forEach((planId) => {
          this.transformedPurchaseByPlanId[planId] = {
            ...purchase,
            purchaseDetails: transformedPurchaseDetails,
          };
        });
        purchase.offering.stripeLegacyPlans?.forEach((planId) => {
          this.transformedPurchaseByPlanId[planId] = {
            ...purchase,
            purchaseDetails: transformedPurchaseDetails,
          };
        });
      }
    }
  }

  private transformPurchaseDetails(details: string): string[] {
    return details.split('\n').filter((detail) => !!detail);
  }

  purchaseDetailsTransform(
    purchaseDetails: PurchaseDetailsResult
  ): PurchaseDetailsTransformed {
    return {
      ...purchaseDetails,
      details: this.transformPurchaseDetails(purchaseDetails.details),
    };
  }

  transformedPurchaseWithCommonContentForPlanId(
    planId: string
  ): PurchaseWithDetailsOfferingContentTransformed | undefined {
    return this.transformedPurchaseByPlanId[planId];
  }

  get purchaseCollection(): PurchaseWithDetailsOfferingContentByPlanIdsResult['purchaseCollection'] {
    // Deduplicating items as there could be duplicates from splitting up the
    // stripePlanIds and making multiple Contentful calls
    return {
      items: [
        ...new Map(
          this.rawResults
            .map((rawResult) => rawResult.purchaseCollection.items)
            .flat()
            .map((res) => [JSON.stringify(res), res])
        ).values(),
      ],
    };
  }
}
