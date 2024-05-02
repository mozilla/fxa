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
    const offering = this.offeringCollection.items.at(0);
    if (!offering) throw Error('getOffering - No offering exists');
    //Seems to be 2 offerings with 123done API identifier. Comment out for this demo
    //if (this.offeringCollection.items.length > 1)
    //  throw Error('getOffering - More than one offering');
    return offering;
  }

  get offeringCollection(): EligibilityContentByOfferingResult['offeringCollection'] {
    return this.rawResult.offeringCollection;
  }
}
