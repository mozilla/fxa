/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ChurnInterventionByProductIdRawResult,
  ChurnInterventionByProductIdResult,
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
    const { defaultPurchase, commonContent, churnInterventions } =
      this.rawResult.offerings[0];

    // One ChurnInterventionByOfferingResult per churn intervention to handle multiple churn types
    const churnInterventionsByProductId: ChurnInterventionByProductIdResult[] =
      churnInterventions.map((churnIntervention) => {
        return {
          ...churnIntervention,
          webIcon:
            defaultPurchase.purchaseDetails.localizations.length > 0
              ? defaultPurchase.purchaseDetails.localizations[0].webIcon
              : defaultPurchase.purchaseDetails.webIcon,
          supportUrl: commonContent.supportUrl,
          termsDetails: this.transformArrayStringField(
            churnIntervention.termsDetails
          ),
          modalMessage: this.transformArrayStringField(
            churnIntervention.modalMessage
          ),
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
}
