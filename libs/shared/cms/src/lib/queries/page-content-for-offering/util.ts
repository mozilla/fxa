/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    const offering = this.offerings.data.at(0);
    if (!offering) throw Error('getOffering - No offering exists');
    if (this.offerings.data.length > 1)
      throw Error('getOffering - More than one offering');

    return {
      ...offering.attributes,
      defaultPurchase: {
        data: {
          attributes: {
            purchaseDetails: {
              data: {
                attributes: {
                  ...this.purchaseDetailsTransform(
                    offering.attributes.defaultPurchase.data.attributes
                      .purchaseDetails.data.attributes
                  ),
                  localizations: {
                    data: offering.attributes.defaultPurchase.data.attributes.purchaseDetails.data.attributes.localizations.data.map(
                      (localization) => ({
                        attributes: this.purchaseDetailsTransform(
                          localization.attributes
                        ),
                      })
                    ),
                  },
                },
              },
            },
          },
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
