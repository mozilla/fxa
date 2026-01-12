/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ChurnInterventionByProductIdRawResult,
  ChurnInterventionByProductIdResult,
  CmsOfferingContent,
} from './types';
import * as Sentry from '@sentry/node';

export class ChurnInterventionByProductIdResultUtil {
  constructor(private rawResult: ChurnInterventionByProductIdRawResult) {}

  getTransformedChurnInterventionByProductId() {
    if (this.rawResult.offerings.length !== 1) {
      Sentry.captureMessage(
        'Unexpected number of offerings found for product and interval',
        { extra: { offeringsCount: this.rawResult.offerings.length } }
      );
    }
    const {
      apiIdentifier,
      defaultPurchase,
      commonContent,
      churnInterventions,
    } = this.rawResult.offerings[0];

    // One ChurnInterventionByOfferingResult per churn intervention to handle multiple churn types
    const churnInterventionsByProductId: ChurnInterventionByProductIdResult[] =
      churnInterventions.map((churnIntervention) => {
        return {
          ...churnIntervention,
          apiIdentifier,
          webIcon:
            defaultPurchase.purchaseDetails.localizations.length > 0
              ? defaultPurchase.purchaseDetails.localizations[0].webIcon
              : defaultPurchase.purchaseDetails.webIcon,
          productName:
            defaultPurchase.purchaseDetails.localizations.length > 0
              ? defaultPurchase.purchaseDetails.localizations[0].productName
              : defaultPurchase.purchaseDetails.productName,
          supportUrl: commonContent.supportUrl,
          ctaMessage:
            churnIntervention.localizations.at(0)?.ctaMessage ??
            churnIntervention.ctaMessage,
          modalHeading:
            churnIntervention.localizations.at(0)?.modalHeading ??
            churnIntervention.modalHeading,
          modalMessage: this.transformArrayStringField(
            churnIntervention.localizations.at(0)?.modalMessage ??
              churnIntervention.modalMessage
          ),
          termsDetails: this.transformArrayStringField(
            churnIntervention.localizations.at(0)?.termsDetails ??
              churnIntervention.termsDetails
          ),
          termsHeading:
            churnIntervention.localizations.at(0)?.termsHeading ??
            churnIntervention.termsHeading,
          productPageUrl:
            churnIntervention.localizations.at(0)?.productPageUrl ??
            churnIntervention.productPageUrl,
        };
      });

    return churnInterventionsByProductId;
  }

  get churnInterventionByProductId(): ChurnInterventionByProductIdRawResult {
    return this.rawResult;
  }
  private transformArrayStringField(details: string): string[] {
    return details.split('\n').filter((detail) => !!detail);
  }

  cmsOfferingContent(): CmsOfferingContent | null {
    const offering = this.rawResult.offerings?.at(0);

    if (!offering) {
      return null;
    }

    return {
      productName: offering.defaultPurchase?.purchaseDetails?.productName,
      successActionButtonUrl: offering.commonContent?.successActionButtonUrl,
      supportUrl: offering.commonContent?.supportUrl,
      webIcon: offering.defaultPurchase?.purchaseDetails?.webIcon,
    };
  }
}
