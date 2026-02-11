/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentOfferingNotFoundError,
  MultipleEligilityContentOfferingResultsError,
} from '../../cms.error';
import {
  EligibilityContentByOfferingResult,
  EligibilityContentOfferingResult,
} from './types';

export class EligibilityContentByOfferingResultUtil {
  constructor(private rawResult: EligibilityContentByOfferingResult) {}

  getOffering(): EligibilityContentOfferingResult {
    const offering = this.offerings.at(0);
    if (!offering) throw new EligibilityContentOfferingNotFoundError();
    if (this.offerings.length > 1)
      throw new MultipleEligilityContentOfferingResultsError(
        this.offerings.map((offering) => offering.stripeProductId)
      );
    return offering;
  }

  get offerings(): EligibilityContentByOfferingResult['offerings'] {
    return this.rawResult.offerings;
  }
}
