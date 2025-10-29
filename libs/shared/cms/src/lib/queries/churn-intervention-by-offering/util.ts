/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ChurnInterventionByOfferingChurnInterventionsCountError,
  ChurnInterventionByOfferingOfferingCountError,
} from './errors';
import {
  ChurnInterventionByOfferingRawResult,
  ChurnInterventionByOfferingResult,
} from './types';

export class ChurnInterventionByOfferingResultUtil {
  constructor(private rawResult: ChurnInterventionByOfferingRawResult) {}

  getTransformedChurnInterventionByOffering() {
    let churnInterventionByOffering:
      | ChurnInterventionByOfferingResult
      | undefined;
    if (this.rawResult.offerings.length > 1) {
      throw new ChurnInterventionByOfferingOfferingCountError(
        this.rawResult.offerings.length
      );
    }
    for (const { defaultPurchase, commonContent, churnInterventions } of this
      .rawResult.offerings) {
      if (churnInterventions.length !== 1) {
        throw new ChurnInterventionByOfferingChurnInterventionsCountError(
          churnInterventions.length
        );
      }
      churnInterventionByOffering = {
        webIcon:
          defaultPurchase.purchaseDetails.localizations.length > 0
            ? defaultPurchase.purchaseDetails.localizations[0].webIcon
            : defaultPurchase.purchaseDetails.webIcon,
        supportUrl: commonContent.supportUrl,
        ...churnInterventions[0],
      };
    }
    return churnInterventionByOffering;
  }

  get churnInterventionByOffering(): ChurnInterventionByOfferingRawResult {
    return this.rawResult;
  }
}
