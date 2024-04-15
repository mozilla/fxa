/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentByOfferingResult,
  EligibilityContentOfferingResult,
} from './types';

export class EligibilityContentByOfferingResultUtil {
  constructor(private rawResult: EligibilityContentByOfferingResult) {}

  getOffering(): EligibilityContentOfferingResult {
    if (this.offeringCollection.items.length > 1)
      throw Error('getOffering - More than one offering');
    return this.offeringCollection.items[0];
  }

  get offeringCollection(): EligibilityContentByOfferingResult['offeringCollection'] {
    return this.rawResult.offeringCollection;
  }
}
